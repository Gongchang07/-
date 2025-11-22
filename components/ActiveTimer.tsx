import React, { useEffect, useState, useRef } from 'react';
import { Category, ActiveSession, Goal } from '../types';
import { TAILWIND_BG_LIGHT, TAILWIND_TEXT_COLORS } from '../constants';
import { IconRenderer } from './IconRenderer';
import { Square, Trophy } from 'lucide-react';

interface ActiveTimerProps {
  session: ActiveSession;
  category: Category;
  onStop: () => void;
  initialDayDuration?: number; // Duration spent in this category BEFORE this session today
  dailyGoal?: Goal;
  onMilestoneReached?: (milestone: '80' | '100') => void;
}

export const ActiveTimer: React.FC<ActiveTimerProps> = ({ 
  session, 
  category, 
  onStop, 
  initialDayDuration = 0,
  dailyGoal,
  onMilestoneReached
}) => {
  const [elapsed, setElapsed] = useState(0);
  const milestonesTriggered = useRef<Set<string>>(new Set());

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const currentSessionDuration = Math.floor((now - session.lastResumeTime) / 1000);
      const totalElapsed = session.accumulatedSeconds + currentSessionDuration;
      setElapsed(totalElapsed);

      // Check Goal Milestones
      if (dailyGoal && dailyGoal.targetSeconds > 0 && onMilestoneReached) {
        const totalToday = initialDayDuration + totalElapsed;
        const progress = totalToday / dailyGoal.targetSeconds;
        
        if (progress >= 1.0 && !milestonesTriggered.current.has('100')) {
          milestonesTriggered.current.add('100');
          onMilestoneReached('100');
        } else if (progress >= 0.8 && progress < 1.0 && !milestonesTriggered.current.has('80')) {
          milestonesTriggered.current.add('80');
          onMilestoneReached('80');
        }
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session, dailyGoal, initialDayDuration, onMilestoneReached]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderGoalProgress = () => {
    if (!dailyGoal) return null;
    
    const totalToday = initialDayDuration + elapsed;
    const percentage = Math.min(100, Math.round((totalToday / dailyGoal.targetSeconds) * 100));
    const remaining = Math.max(0, Math.ceil((dailyGoal.targetSeconds - totalToday) / 60));
    const isGoalMet = percentage >= 100;

    return (
      <div className="w-full max-w-xs mt-8 mb-2">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          <span>Daily Goal</span>
          <span>{isGoalMet ? 'Goal Met!' : `${remaining}m remaining`}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ease-out relative ${isGoalMet ? 'bg-green-500' : 'bg-indigo-500'}`}
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer effect */}
             <div className="absolute top-0 left-0 bottom-0 right-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-400 mt-1">{percentage}%</div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center mb-6 border border-gray-100 relative overflow-hidden">
      {/* Background pulse effect */}
      <div className={`absolute inset-0 opacity-10 ${TAILWIND_BG_LIGHT[category.color]}`}></div>
      
      {dailyGoal && (initialDayDuration + elapsed >= dailyGoal.targetSeconds) && (
        <div className="absolute top-4 right-4 animate-bounce">
          <Trophy className="text-yellow-500 drop-shadow-sm" size={28} fill="currentColor" />
        </div>
      )}
      
      <div className="z-10 flex flex-col items-center w-full animate-fade-in">
        <div className={`p-3 rounded-full ${TAILWIND_BG_LIGHT[category.color]} mb-4`}>
          <IconRenderer name={category.icon} className={TAILWIND_TEXT_COLORS[category.color]} size={32} />
        </div>
        
        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Current Focus</h2>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{category.name}</h3>

        <div className="text-7xl font-mono font-bold text-gray-900 mb-2 tabular-nums tracking-tight">
          {formatTime(elapsed)}
        </div>
        
        {renderGoalProgress()}

        <div className="flex gap-4 mt-6">
          <button 
            onClick={onStop}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-md"
          >
            <Square size={20} fill="currentColor" />
            Stop Session
          </button>
        </div>
      </div>
    </div>
  );
};
