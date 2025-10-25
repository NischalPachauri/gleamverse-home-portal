import React from 'react';
import { BookMarked, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { BookmarkStatusType } from '@/hooks/useLocalBookmarks';

interface ReadingStatusBadgeProps {
  status: BookmarkStatusType | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ReadingStatusBadge({ status, size = 'md', showLabel = true }: ReadingStatusBadgeProps) {
  if (!status) return null;
  
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base'
  };
  
  const getStatusConfig = () => {
    switch (status) {
      case 'Planning to Read':
        return {
          icon: <BookMarked className={sizeClasses[size]} />,
          color: 'bg-emerald-500',
          textColor: 'text-emerald-50',
          label: 'Planning'
        };
      case 'Reading':
        return {
          icon: <BookOpen className={sizeClasses[size]} />,
          color: 'bg-blue-500',
          textColor: 'text-blue-50',
          label: 'Reading'
        };
      case 'On Hold':
        return {
          icon: <Clock className={sizeClasses[size]} />,
          color: 'bg-amber-500',
          textColor: 'text-amber-50',
          label: 'On Hold'
        };
      case 'Completed':
        return {
          icon: <CheckCircle2 className={sizeClasses[size]} />,
          color: 'bg-purple-500',
          textColor: 'text-purple-50',
          label: 'Completed'
        };
      default:
        return null;
    }
  };
  
  const config = getStatusConfig();
  if (!config) return null;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.color} ${config.textColor}`}>
      {config.icon}
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </div>
  );
}