import React from 'react';
import { Category } from '../types';
import { TAILWIND_BG_LIGHT, TAILWIND_TEXT_COLORS } from '../constants';
import { IconRenderer } from './IconRenderer';
import { Plus } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  disabled: boolean;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory, disabled }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          disabled={disabled}
          onClick={() => onSelectCategory(category.id)}
          className={`
            relative group flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md cursor-pointer hover:-translate-y-1'}
          `}
        >
          <div className={`
            p-3 rounded-full mb-3 transition-colors duration-200
            ${disabled ? 'bg-gray-200 text-gray-400' : `${TAILWIND_BG_LIGHT[category.color]} ${TAILWIND_TEXT_COLORS[category.color]}`}
          `}>
            <IconRenderer name={category.icon} size={24} />
          </div>
          <span className="font-medium text-gray-700">{category.name}</span>
          
          {!disabled && (
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
               <div className="bg-white p-2 rounded-full shadow-sm">
                  <Plus className="text-indigo-600" size={24} />
               </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
