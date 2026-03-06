import React from 'react';
import Icon from '../../../components/common/Icon';
import { SettingsNavItem, SettingsTab } from '../types/admin-settings.types';

interface SidebarNavProps {
  navItems: SettingsNavItem[];
  activeTab: SettingsTab;
  sidebarCollapsed: boolean;
  onSelectTab: (tab: SettingsTab) => void;
  onToggleCollapsed: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  navItems,
  activeTab,
  sidebarCollapsed,
  onSelectTab,
  onToggleCollapsed,
}) => {
  return (
    <aside
      className={`bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col flex-shrink-0 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="settings" size={18} />
          {!sidebarCollapsed && <span className="font-bold text-lg text-slate-900 dark:text-white">Settings</span>}
        </div>
        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={onToggleCollapsed}>
          <Icon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} size={18} className="text-slate-500" />
        </button>
      </div>

      <nav className="p-4 space-y-1 flex-shrink-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-3 w-full rounded px-3 py-2 font-medium transition-all text-left ${
              activeTab === item.id ? 'bg-primary text-white font-semibold' : 'text-slate-soft hover:bg-slate-50 hover:text-primary'
            }`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={18} className={activeTab === item.id ? 'text-white' : ''} />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                {item.badge && <span className="px-1.5 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">{item.badge}</span>}
              </>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default React.memo(SidebarNav);
