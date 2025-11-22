import React, { useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES } from './constants';
import { Category, TimeLog, Goal } from './types';
import { CategoryGrid } from './components/CategoryGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { AIInsight } from './components/AIInsight';
import { GoalManager } from './components/GoalManager';
import { CategoryManager } from './components/CategoryManager';
import { ManualEntryModal } from './components/ManualEntryModal';
import { Layout, Target, FileText, Settings } from 'lucide-react';

const STORAGE_KEY_LOGS = 'focusflow_logs';
const STORAGE_KEY_GOALS = 'focusflow_goals';
const STORAGE_KEY_CATEGORIES = 'focusflow_categories';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Modal States
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [selectedCategoryForLog, setSelectedCategoryForLog] = useState<Category | null>(null);
  
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Load initial data
  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Failed to parse logs');
      }
    }

    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error('Failed to parse goals');
      }
    }

    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Failed to parse categories');
      }
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const handleNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else {
      console.log(`Notification: ${title} - ${body}`);
    }
  };

  const checkGoalCompletion = (categoryId: string, addedSeconds: number, logDate: string) => {
    const dailyGoal = goals.find(g => g.categoryId === categoryId && g.type === 'daily');
    
    if (dailyGoal && logDate === currentDate) {
      // Calculate total including the new log
      const previousTotal = logs
        .filter(log => log.date === currentDate && log.categoryId === categoryId)
        .reduce((acc, log) => acc + log.durationSeconds, 0);
      
      const newTotal = previousTotal + addedSeconds;
      
      // Check if we just crossed the threshold
      if (previousTotal < dailyGoal.targetSeconds && newTotal >= dailyGoal.targetSeconds) {
        const categoryName = categories.find(c => c.id === categoryId)?.name;
        handleNotification('目标达成! 🎉', `恭喜！您已达成 ${categoryName} 的每日目标。`);
      }
    }
  };

  const handleSaveLog = (categoryId: string, durationMinutes: number, date: string, subCategoryId?: string) => {
    const durationSeconds = durationMinutes * 60;
    
    // Determine startTime. If it's today, use now. If past, use noon to be safe for date filtering.
    let startTime = new Date().getTime();
    if (date !== currentDate) {
      const pastDate = new Date(date);
      pastDate.setHours(12, 0, 0, 0);
      startTime = pastDate.getTime();
    }

    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      categoryId,
      subCategoryId,
      startTime: startTime,
      endTime: startTime + (durationSeconds * 1000),
      durationSeconds: durationSeconds,
      date: date,
    };

    checkGoalCompletion(categoryId, durationSeconds, date);
    setLogs(prev => [...prev, newLog]);
  };

  const handleAddSubCategory = (categoryId: string, subCategory: { id: string; name: string }) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subCategories: [...(cat.subCategories || []), subCategory]
        };
      }
      return cat;
    }));
  };

  const getTodayLogs = () => {
    return logs.filter(log => log.date === currentDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <GoalManager 
        isOpen={isGoalManagerOpen} 
        onClose={() => setIsGoalManagerOpen(false)} 
        categories={categories}
        goals={goals}
        onSaveGoals={setGoals}
      />

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onUpdateCategories={setCategories}
      />

      <ManualEntryModal
        isOpen={!!selectedCategoryForLog}
        category={selectedCategoryForLog}
        onClose={() => setSelectedCategoryForLog(null)}
        onSave={handleSaveLog}
        onAddSubCategory={handleAddSubCategory}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layout size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-gray-900">FocusFlow</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsCategoryManagerOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">管理分类</span>
            </button>
            <button 
              onClick={() => setIsGoalManagerOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full"
            >
              <Target size={16} />
              <span className="hidden sm:inline">目标设定</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="text-indigo-500" />
            记录投入时间
          </h2>
          <p className="text-gray-500">点击类别即可记录您在该领域花费的时间。您可以在顶部菜单中添加更细分的类别。</p>
        </div>

        <CategoryGrid 
          categories={categories} 
          onSelectCategory={(id) => setSelectedCategoryForLog(categories.find(c => c.id === id) || null)}
          disabled={false}
        />

        <div className="border-t border-gray-200 my-8"></div>

        {/* Insights & Stats */}
        <div className="space-y-8">
          <AIInsight logs={getTodayLogs()} categories={categories} />
          <StatsDashboard logs={logs} categories={categories} />
        </div>
      </main>
    </div>
  );
};

export default App;