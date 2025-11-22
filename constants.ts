import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '工作', color: 'blue', icon: 'Briefcase', subCategories: [] },
  { 
    id: 'study', 
    name: '学习', 
    color: 'indigo', 
    icon: 'BookOpen',
    subCategories: [
      { id: 'reading', name: '阅读' },
      { id: 'listening', name: '听书' },
      { id: 'english', name: '英语' }
    ]
  },
  { id: 'exercise', name: '运动', color: 'green', icon: 'Dumbbell', subCategories: [] },
  { id: 'reading', name: '阅读', color: 'yellow', icon: 'Coffee', subCategories: [] },
  { id: 'creative', name: '创意', color: 'purple', icon: 'Palette', subCategories: [] },
  { id: 'entertainment', name: '休闲', color: 'pink', icon: 'Gamepad2', subCategories: [] },
];

export const COLORS = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#64748b',
  red: '#ef4444',
  orange: '#f97316',
  teal: '#14b8a6',
  cyan: '#06b6d4',
};

export const TAILWIND_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
};

export const TAILWIND_TEXT_COLORS: Record<string, string> = {
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  pink: 'text-pink-600',
  gray: 'text-gray-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600',
  cyan: 'text-cyan-600',
};

export const TAILWIND_BG_LIGHT: Record<string, string> = {
  blue: 'bg-blue-50',
  indigo: 'bg-indigo-50',
  green: 'bg-green-50',
  yellow: 'bg-yellow-50',
  purple: 'bg-purple-50',
  pink: 'bg-pink-50',
  gray: 'bg-gray-50',
  red: 'bg-red-50',
  orange: 'bg-orange-50',
  teal: 'bg-teal-50',
  cyan: 'bg-cyan-50',
};

export const AVAILABLE_ICONS = [
  'BookOpen', 'Briefcase', 'Coffee', 'Code', 'Dumbbell', 'Gamepad2', 
  'Headphones', 'Laptop', 'Lightbulb', 'Music', 'Palette', 'PenTool', 
  'Phone', 'Camera', 'ShoppingBag', 'Utensils', 'Video', 'Wifi', 
  'Anchor', 'Archive', 'Award', 'Baby', 'Banknote', 'Bath', 'Bike',
  'Car', 'Cat', 'Dog', 'Cloud', 'Cpu', 'DollarSign', 'Droplet',
  'FileText', 'Film', 'Flag', 'Gift', 'Globe', 'Heart', 'Home',
  'Image', 'Key', 'Languages', 'Library', 'Map', 'Mic', 'Moon',
  'Package', 'Plane', 'Rocket', 'Scissors', 'Search', 'Server',
  'Smartphone', 'Smile', 'Star', 'Sun', 'Target', 'Tool', 'Truck',
  'Tv', 'Umbrella', 'User', 'Watch', 'Zap'
];