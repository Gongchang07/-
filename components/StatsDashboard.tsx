import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, TooltipProps } from 'recharts';
import { TimeLog, Category, TimeRange } from '../types';
import { COLORS, TAILWIND_TEXT_COLORS } from '../constants';
import { IconRenderer } from './IconRenderer';

interface StatsDashboardProps {
  logs: TimeLog[];
  categories: Category[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ logs, categories }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of current week (Sunday)
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
    
    // Start of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return logs.filter(log => {
      const logDate = new Date(log.date); 
      
      if (timeRange === 'daily') {
        return log.startTime >= todayStart;
      } else if (timeRange === 'weekly') {
        return log.startTime >= weekStart;
      } else if (timeRange === 'monthly') {
        return log.startTime >= monthStart;
      }
      return true;
    });
  }, [logs, timeRange]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredLogs.forEach(log => {
      const current = map.get(log.categoryId) || 0;
      map.set(log.categoryId, current + log.durationSeconds);
    });

    const data = Array.from(map.entries()).map(([id, value]) => {
      const cat = categories.find(c => c.id === id);
      return {
        name: cat?.name || id,
        id: id,
        value: Math.round(value / 60), // Minutes
        color: cat ? COLORS[cat.color as keyof typeof COLORS] : '#999',
        rawColor: cat?.color || 'gray'
      };
    });
    
    // Sort by value desc for better visualization
    return data.sort((a, b) => b.value - a.value);
  }, [filteredLogs, categories]);

  const totalTime = useMemo(() => {
    return filteredLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  }, [filteredLogs]);

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (h > 0) return `${h}小时 ${m}分`;
    return `${m}分钟`;
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    daily: '今日',
    weekly: '本周',
    monthly: '本月'
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-medium text-gray-800">{payload[0].payload.name}</p>
          <p className="text-indigo-600 font-bold">{payload[0].value} 分钟</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Range Selector */}
      <div className="flex bg-gray-100 p-1 rounded-lg self-start mb-2">
        {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
              timeRange === range
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {timeRangeLabels[range]}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-400">该时段暂无记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 w-full text-left">时间分布</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400">总计</span>
                <span className="text-xl font-bold text-gray-800">{formatTotalTime(totalTime)}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4">
              {chartData.slice(0, 6).map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-gray-700 font-medium truncate max-w-[80px]">{entry.name}</span>
                    </div>
                    <span className="text-gray-500">{entry.value}分</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">类别对比</h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    width={80}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed List */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">详细记录</h3>
          <div className="space-y-3">
             {filteredLogs.slice().reverse().map((log) => {
                const cat = categories.find(c => c.id === log.categoryId);
                if (!cat) return null;
                const dateStr = new Date(log.startTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                const timeStr = new Date(log.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                
                const subCatName = log.subCategoryId 
                  ? cat.subCategories?.find(s => s.id === log.subCategoryId)?.name 
                  : null;

                return (
                  <div key={log.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-8 rounded-full bg-${cat.color}-500`}></div>
                       <div>
                         <div className="flex items-center gap-2">
                           <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                           {subCatName && (
                             <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                               {subCatName}
                             </span>
                           )}
                         </div>
                         <p className="text-xs text-gray-400">{dateStr} {timeStr}</p>
                       </div>
                    </div>
                    <span className="text-sm font-mono font-medium text-gray-600">
                      {Math.ceil(log.durationSeconds / 60)} 分钟
                    </span>
                  </div>
                )
             })}
          </div>
        </div>
      )}
    </div>
  );
};