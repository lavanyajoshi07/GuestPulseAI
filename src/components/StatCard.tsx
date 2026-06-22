'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple';
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30',
    green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30',
    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
    purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`border border-border rounded-lg p-6 transition-all duration-300 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-3xl ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
