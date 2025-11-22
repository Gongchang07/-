export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class prefix (e.g., 'blue') or hex
  icon: string; // Lucide icon name
  subCategories?: SubCategory[];
}

export interface TimeLog {
  id: string;
  categoryId: string;
  subCategoryId?: string; // Optional sub-category ID
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  durationSeconds: number;
  date: string; // ISO Date string YYYY-MM-DD for easy grouping
}

export interface DaySummary {
  totalSeconds: number;
  categoryBreakdown: Record<string, number>; // categoryId -> seconds
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface ActiveSession {
  categoryId: string;
  startTime: number; // Original start time
  accumulatedSeconds: number; // Time from previous pauses
  lastResumeTime: number; // When it was last resumed (or started)
}

export type GoalType = 'daily' | 'weekly';

export interface Goal {
  categoryId: string;
  type: GoalType;
  targetSeconds: number;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';