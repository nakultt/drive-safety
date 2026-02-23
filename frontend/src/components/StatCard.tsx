import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    timeframe?: string;
  };
  backgroundColor?: string;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  trend,
  backgroundColor = 'bg-indigo-50',
  iconColor = 'text-indigo-600'
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {trend && (
            <p className={`text-sm font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.timeframe || 'vs yesterday'}
            </p>
          )}
        </div>
        <div className={`${backgroundColor} rounded-xl p-4`}>
          <Icon className={`${iconColor} w-6 h-6`} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
