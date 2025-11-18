import React from 'react';

interface ProgressBarProps {
  value: number; // 0..100
  height?: number;
  className?: string;
}

export default function ProgressBar({ value, height = 8, className = '' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full rounded-full bg-slate-800/60 ${className}`}
      style={{ height, width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      title={`${pct.toFixed(1)}%`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-[width] duration-300"
        style={{ width: '100%' }}
      />
    </div>
  );
}
