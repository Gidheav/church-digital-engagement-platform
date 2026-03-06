import React from 'react';
import Icon from '../../../components/common/Icon';

interface SettingsHeaderProps {
  title: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title }) => (
  <header className="z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex-shrink-0">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-slate-700 relative">
          <Icon name="notifications" size={20} className="text-slate-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20">Save Changes</button>
      </div>
    </div>
  </header>
);

export default React.memo(SettingsHeader);
