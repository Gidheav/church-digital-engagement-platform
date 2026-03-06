/**
 * Admin Right Sidebar — Pastoral Priorities, Daily Word, Network Performance
 */

import React from 'react';
import Icon from '../../components/common/Icon';
import DailyWordQuickEditor from '../DailyWordQuickEditor';

const AdminRightSidebar: React.FC = () => {

  return (
    <aside
      className="w-80 border-l border-border-light bg-white flex flex-col overflow-y-auto flex-shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Pastoral Priorities */}
      <div className="p-4 space-y-4 border-b border-border-light">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Pastoral Priorities</h2>
        <div className="space-y-3">
          {/* Critical Flag */}
          <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="emergency" size={14} className=" text-rose-500" />
              <span className="text-xs font-bold text-rose-600 uppercase">Critical Flag</span>
            </div>
            <p className="text-xs font-bold text-slate-deep leading-snug">
              Urgent prayer request regarding hospital visit (John Thompson)
            </p>
            <button className="w-full rounded bg-rose-500 py-1.5 text-xs font-bold text-white uppercase hover:bg-rose-600 transition-colors">
              Notify Care Team
            </button>
          </div>

          {/* Community Question */}
          <div className="rounded-lg border border-border-light bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-soft uppercase">Community Question</span>
              <span className="text-xs text-slate-400 font-medium">4h ago</span>
            </div>
            <p className="text-xs font-medium text-slate-deep leading-relaxed">
              "How can I register my family for the Winter Retreat? The link seems broken."
            </p>
            <button className="text-xs font-bold text-primary uppercase hover:underline">
              Respond Now
            </button>
          </div>
        </div>
      </div>
      <DailyWordQuickEditor />

      {/* Network Performance */}
      <div className="mt-auto p-4 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-soft uppercase tracking-wide">Network Performance</p>
          <p className="text-xs font-mono text-emerald-600 font-bold">12ms Ping</p>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div className="w-[24%] h-full bg-primary rounded-full"></div>
        </div>
        <div className="flex justify-between">
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-slate-deep">8.2k</p>
            <p className="text-xs text-slate-soft uppercase font-semibold">Requests/m</p>
          </div>
          <div className="w-px bg-border-light"></div>
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-slate-deep">0.02%</p>
            <p className="text-xs text-slate-soft uppercase font-semibold">Error Rate</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminRightSidebar;
