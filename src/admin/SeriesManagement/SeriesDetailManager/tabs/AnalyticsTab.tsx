/**
 * AnalyticsTab - future analytics dashboard
 */
import React from 'react';
import Icon from '../../../../components/common/Icon';

const AnalyticsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <Icon name="analytics" size={48} className="text-slate-300" />
      <p className="text-slate-700 font-semibold mt-4 text-lg">Analytics Coming Soon</p>
      <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
        Detailed per-post engagement, retention curves, and share analytics will be available here in a future update.
      </p>
    </div>
  );
};

AnalyticsTab.displayName = 'AnalyticsTab';
export default React.memo(AnalyticsTab);
