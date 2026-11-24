import React from 'react';
import { getStatusColorClass } from '../../utils/formatters';

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  if (!status) return null;

  const colorClass = getStatusColorClass(status);
  const sizeClass = size === 'xs' 
    ? 'px-2 py-0.5 text-xs font-medium' 
    : 'px-2.5 py-1 text-xs font-semibold tracking-wide';

  const dotColorClass = {
    'bg-teal-50 text-teal-700 border-teal-200': 'bg-teal-500',
    'bg-emerald-50 text-emerald-700 border-emerald-200': 'bg-emerald-500',
    'bg-amber-50 text-amber-700 border-amber-200': 'bg-amber-500',
    'bg-rose-50 text-rose-700 border-rose-200': 'bg-rose-500',
    'bg-slate-100 text-slate-600 border-slate-200': 'bg-slate-400',
    'bg-slate-100 text-slate-700 border-slate-200': 'bg-slate-500',
  }[colorClass] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
      <span>{status}</span>
    </span>
  );
}
