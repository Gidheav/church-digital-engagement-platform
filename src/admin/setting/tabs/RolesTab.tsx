import React from 'react';
import Icon from '../../../components/common/Icon';
import { ROLES } from '../constants/admin-settings.constants';

const RolesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Roles & Permissions</h2>
        <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20">
          <Icon name="add" size={18} className="mr-1" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLES.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${role.color}20` }}>
                  <span className="text-xl" style={{ color: role.color }}>●</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{role.name}</h3>
                  {role.isSystem && <span className="text-[10px] font-medium text-slate-400 uppercase">System</span>}
                </div>
              </div>
              {!role.isSystem && (
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="more_vert" size={18} className="text-slate-400 hover:text-primary" />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{role.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.permissions}</span>
                <span className="text-xs text-slate-500">permissions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.users}</span>
                <span className="text-xs text-slate-500">users</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RolesTab);
