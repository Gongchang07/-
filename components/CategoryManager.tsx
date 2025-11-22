import React, { useState } from 'react';
import { Category, SubCategory } from '../types';
import { X, Save, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { TAILWIND_BG_LIGHT, TAILWIND_TEXT_COLORS, AVAILABLE_ICONS, COLORS } from '../constants';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateCategories: (newCategories: Category[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, categories, onUpdateCategories }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    color: 'blue',
    icon: 'BookOpen',
    subCategories: []
  });

  const [newSubCatName, setNewSubCatName] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ name: '', color: 'blue', icon: 'BookOpen', subCategories: [] });
    setEditingId(null);
    setIsAdding(false);
    setNewSubCatName('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (cat: Category) => {
    setFormData({ ...cat, subCategories: cat.subCategories || [] });
    setEditingId(cat.id);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个分类吗？相关的历史记录虽然保留，但统计可能会受影响。')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const handleAddSubCategory = () => {
    if (!newSubCatName.trim()) return;
    const newSub: SubCategory = {
      id: crypto.randomUUID(),
      name: newSubCatName.trim()
    };
    setFormData(prev => ({
      ...prev,
      subCategories: [...(prev.subCategories || []), newSub]
    }));
    setNewSubCatName('');
  };

  const handleRemoveSubCategory = (subId: string) => {
    setFormData(prev => ({
      ...prev,
      subCategories: (prev.subCategories || []).filter(s => s.id !== subId)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (isAdding) {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: formData.name,
        color: formData.color || 'blue',
        icon: formData.icon || 'Circle',
        subCategories: formData.subCategories || []
      };
      onUpdateCategories([...categories, newCategory]);
    } else if (editingId) {
      onUpdateCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } as Category : c));
    }
    resetForm();
  };

  const renderEditor = () => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 animate-fade-in">
      <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
        {isAdding ? '添加新分类' : '编辑分类'}
      </h3>
      
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">分类名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="例如：英语听力"
          />
        </div>

        {/* Sub Categories */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            子分类 (自定义细分项)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSubCatName}
              onChange={(e) => setNewSubCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory()}
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="输入细分名称 (如: 阅读)"
            />
            <button
              onClick={handleAddSubCategory}
              className="bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {formData.subCategories && formData.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.subCategories.map(sub => (
                <div key={sub.id} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md text-sm text-gray-600">
                  <span>{sub.name}</span>
                  <button onClick={() => handleRemoveSubCategory(sub.id)} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">主题颜色</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(COLORS).map((colorKey) => (
              <button
                key={colorKey}
                onClick={() => setFormData({ ...formData, color: colorKey })}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                  formData.color === colorKey ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: COLORS[colorKey as keyof typeof COLORS] }}
              >
                {formData.color === colorKey && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">选择图标</label>
          <div className="h-32 overflow-y-auto grid grid-cols-6 gap-2 p-2 border border-gray-200 rounded-lg bg-white">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                key={iconName}
                onClick={() => setFormData({ ...formData, icon: iconName })}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                  formData.icon === iconName ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
                title={iconName}
              >
                <IconRenderer name={iconName} size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
          <button 
            onClick={handleSubmit} 
            disabled={!formData.name}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">管理分类</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {(isAdding || editingId) && renderEditor()}

          {!isAdding && !editingId && (
            <button
              onClick={handleStartAdd}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 font-medium flex items-center justify-center gap-2 transition-all mb-6"
            >
              <Plus size={20} />
              创建新分类
            </button>
          )}

          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${TAILWIND_BG_LIGHT[cat.color]} ${TAILWIND_TEXT_COLORS[cat.color]}`}>
                    <IconRenderer name={cat.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">{cat.name}</div>
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {cat.subCategories.map(sub => (
                           <span key={sub.id} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                             {sub.name}
                           </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleStartEdit(cat)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="编辑"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};