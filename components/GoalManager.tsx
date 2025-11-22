import React, { useState } from 'react';
import { Category, Goal, GoalType } from '../types';
import { X, Save, Target } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { TAILWIND_TEXT_COLORS, TAILWIND_BG_LIGHT } from '../constants';

interface GoalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  goals: Goal[];
  onSaveGoals: (newGoals: Goal[]) => void;
}

export const GoalManager: React.FC<GoalManagerProps> = ({ isOpen, onClose, categories, goals, onSaveGoals }) => {
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);

  if (!isOpen) return null;

  const handleGoalChange = (categoryId: string, type: GoalType, minutes: number) => {
    setLocalGoals(prev => {
      const filtered = prev.filter(g => !(g.categoryId === categoryId && g.type === type));
      if (minutes <= 0) return filtered;
      return [...filtered, { categoryId, type, targetSeconds: minutes * 60 }];
    });
  };

  const getGoalValue = (categoryId: string, type: GoalType) => {
    const goal = localGoals.find(g => g.categoryId === categoryId && g.type === type);
    return goal ? Math.round(goal.targetSeconds / 60) : '';
  };

  const handleSave = () => {
    onSaveGoals(localGoals);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Target className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">设定时间目标</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <p className="text-sm text-gray-500 mb-4">
            为每个类别设定每日或每周的目标时长（分钟）。当您达到目标的80%和100%时，系统会发送通知提醒。
          </p>

          <div className="grid grid-cols-1 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`p-3 rounded-full ${TAILWIND_BG_LIGHT[cat.color]} flex-shrink-0`}>
                  <IconRenderer name={cat.icon} className={TAILWIND_TEXT_COLORS[cat.color]} size={20} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-700">{cat.name}</h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-400 uppercase">每日 (分钟)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="无"
                      className="w-24 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={getGoalValue(cat.id, 'daily')}
                      onChange={(e) => handleGoalChange(cat.id, 'daily', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-400 uppercase">每周 (分钟)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="无"
                      className="w-24 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={getGoalValue(cat.id, 'weekly')}
                      onChange={(e) => handleGoalChange(cat.id, 'weekly', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Save size={18} />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};