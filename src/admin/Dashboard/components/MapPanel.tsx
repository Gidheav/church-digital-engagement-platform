/**
 * MapPanel — Community health regional distribution map
 * Memoized to prevent re-renders
 * REGION_DOTS extracted to module-level constant for zero-alloc renders
 */

import React, { memo, useState } from 'react';
import { REGIONS } from '../constants/dashboard.constants';

/**
 * Pre-rendered region dots — static constant, zero allocation on every render
 * NOTE: Any scroll listeners attached to this element must use { passive: true }
 * to avoid blocking the main thread during scroll.
 */
const REGION_DOTS = REGIONS.map((r, i) => (
  <div key={i} className="flex items-center gap-2">
    <div className={`size-2 rounded-full ${r.color} flex-shrink-0`} />
    <div>
      <p className="text-xs font-bold text-slate-deep leading-none">{r.region}</p>
      <p className="text-xs text-primary font-bold">{r.value}</p>
    </div>
  </div>
));

const MapPanel = memo(() => {
  const [mapView, setMapView] = useState<'regional' | 'global'>('global');
  return (
    <div className="xl:col-span-2 rounded-lg border border-border-light bg-white overflow-hidden flex flex-col h-[360px]">
      <div className="border-b border-border-light px-4 py-3 flex justify-between items-center bg-slate-50/30 flex-shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-deep">Community Health Map</h2>
        <div className="flex gap-2">
          {(['regional', 'global'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setMapView(v)}
              className={`rounded-md border px-3 py-1 text-xs font-bold uppercase transition-colors ${
                mapView === v ? 'bg-primary text-white border-primary' : 'bg-white text-slate-soft border-border-light hover:border-primary'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-sky-50/30 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="text-primary" style={{ fontSize: '300px' }}>public</span>
        </div>
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-4 p-6 pointer-events-none">
          {REGION_DOTS}
        </div>
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur border border-border-light p-3 rounded-lg shadow-sm">
            <p className="text-xs text-slate-soft uppercase font-bold mb-1">High Activity Region</p>
            <p className="text-sm font-bold text-slate-deep">North America</p>
            <p className="text-sm text-primary font-bold">2.4M Interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
});

MapPanel.displayName = 'MapPanel';

export default MapPanel;
