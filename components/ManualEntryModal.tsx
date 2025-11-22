import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { X, Save, Calendar, Clock, Plus, Minus, Tag, Check } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { TAILWIND_BG_LIGHT, TAILWIND_TEXT_COLORS } from '../constants';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (categoryId: string, durationMinutes: number, date: string, subCategoryId?: string) => void;
  onAddSubCategory: (categoryId: string, subCategory: { id: string; name: string }) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave,
  onAddSubCategory
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30); // Default 30 mins
  const [selectedSubCat, setSelectedSubCat] = useState<string | undefined>(undefined);
  
  // State for custom sub-category input
  const [customSubName, setCustomSubName] = useState('');
  const [isAddingSub, setIsAddingSub] = useState(false);

  // Reset defaults when opening
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setDuration(30);
      setSelectedSubCat(undefined);
      setCustomSubName('');
      setIsAddingSub(false);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const handleDurationChange = (delta: number) => {
    setDuration(prev => Math.max(5, prev + delta));
  };

  const handleCreateSubCategory = () => {
    if (!customSubName.trim()) return;
    
    // Check if it already exists (case insensitive)
    const existing = category.subCategories?.find(s => s.name.toLowerCase() === customSubName.trim().toLowerCase());
    if (existing) {
      setSelectedSubCat(existing.id);
      setCustomSubName('');
      setIsAddingSub(false);
      return;
    }

    // Create new
    const newId = crypto.randomUUID();
    onAddSubCategory(category.id, { id: newId, name: customSubName.trim() });
    setSelectedSubCat(newId);
    setCustomSubName('');
    setIsAddingSub(false);
  };

  const handleSave = () => {
    if (duration > 0) {
      // If user typed something but didn't click add, try to add it now
      let finalSubCatId = selectedSubCat;
      if (!finalSubCatId && customSubName.trim()) {
         const newId = crypto.randomUUID();
         onAddSubCategory(category.id, { id: newId, name: customSubName.trim() });
         finalSubCatId = newId;
      }

      onSave(category.id, duration, date, finalSubCatId);
      onClose();
    }
  };

  const hasSubCategories = category.subCategories && category.subCategories.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-6 ${TAILWIND_BG_LIGHT[category.color]} flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <IconRenderer name={category.icon} className={TAILWIND_TEXT_COLORS[category.color]} size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">记录时间</h2>
              <p className={`text-sm font-medium ${TAILWIND_TEXT_COLORS[category.color]}`}>{category.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
              <Calendar size={16} />
              日期
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-medium"
            />
          </div>
          
          {/* Sub-Category Selection (Customizable) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                <Tag size={16} />
                二级分类 (可选)
              </label>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex flex-wrap gap-2 mb-3">
                {category.subCategories?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCat(selectedSubCat === sub.id ? undefined : sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-1 ${
                      selectedSubCat === sub.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {sub.name}
                    {selectedSubCat === sub.id && <Check size={12} />}
                  </button>
                ))}
                
                {(!category.subCategories || category.subCategories.length === 0) && !isAddingSub && (
                   <span className="text-sm text-gray-400 italic px-2 py-1">暂无细分项</span>
                )}
              </div>

              {/* Add Custom Sub Category Input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customSubName}
                  onChange={(e) => setCustomSubName(e.target.value)}
                  onFocus={() => setIsAddingSub(true)}
                  onBlur={() => !customSubName && setIsAddingSub(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSubCategory()}
                  placeholder="输入自定义分类..."
                  className="flex-1 text-sm p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleCreateSubCategory}
                  disabled={!customSubName.trim()}
                  className="bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
              <Clock size={16} />
              时长 (分钟)
            </label>
            
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <button 
                onClick={() => handleDurationChange(-5)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:scale-110 transition-all"
              >
                <Minus size={20} />
              </button>
              
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-800 tabular-nums">{duration}</span>
                <span className="text-gray-500 font-medium">分</span>
              </div>

              <button 
                onClick={() => handleDurationChange(5)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:scale-110 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex gap-2 justify-center">
              {[15, 30, 60, 90].map(mins => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    duration === mins 
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mins}分
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save size={20} />
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
};