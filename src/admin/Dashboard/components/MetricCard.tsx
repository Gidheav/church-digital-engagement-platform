/**
 * MetricCard — A single metric display with optional skeleton loading state
 * Memoized to prevent re-renders when props don't change
 */

import React, { memo } from 'react';
import type { MetricShape } from '../types/dashboard.types';

const MetricCard = memo(({ label, value, change, changePositive, bars, special, loading }: MetricShape) => (
  <div className="min-w-0 rounded-lg border border-border-light bg-gradient-to-b from-white to-blue-50/30 p-3 transition-all hover:border-primary/30">
    <div className="flex justify-between items-start mb-1.5 gap-1">
      <span className="text-[11px] font-bold text-slate-soft uppercase tracking-tight leading-tight truncate min-w-0">{label}</span>
      <span className={`text-[11px] font-bold flex-shrink-0 ${changePositive ? 'text-emerald-600' : 'text-rose-500'}`}>{change}</span>
    </div>
    {loading ? (
      <div className="h-5 w-16 bg-slate-100 rounded animate-pulse mt-1" />
    ) : (
      <div className="text-lg font-bold text-slate-deep truncate">{value}</div>
    )}
    {bars ? (
      <div className="mt-2 h-7 w-full bg-primary/5 rounded flex items-end px-1 gap-0.5">
        {bars.map((h, bi) => (
          <div
            key={bi}
            className={`flex-1 rounded-t-sm ${bi === bars.length - 1 ? 'bg-primary' : 'bg-primary/30'}`}
            style={{ height: `${(h / 8) * 100}%` }}
          />
        ))}
      </div>
    ) : special === 'health' ? (
      <div className="mt-2 h-7 w-full bg-slate-100 rounded flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Operational</span>
      </div>
    ) : (
      <div className="mt-3 flex gap-1 items-center">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden min-w-0">
          <div className="w-[60%] h-full bg-emerald-400 rounded-full" />
        </div>
      </div>
    )}
  </div>
));

MetricCard.displayName = 'MetricCard';

export default MetricCard;
