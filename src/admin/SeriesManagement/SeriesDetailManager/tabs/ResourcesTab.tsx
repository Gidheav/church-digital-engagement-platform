/**
 * ResourcesTab - Series resources and admin notes
 */
import React from 'react';
import Icon from '../../../../components/common/Icon';
import SeriesResourcesSidebar from '../components/SeriesResourcesSidebar';
import AdminNotesSidebar from '../components/AdminNotesSidebar';

const ResourcesTab: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto flex gap-6">
      {/* Left: Placeholder content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Icon name="folder_open" size={48} className="text-slate-300" />
        <p className="text-slate-700 font-semibold mt-4 text-lg">Series Resources</p>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
          Attach discussion guides, PDFs, and supplementary materials to this series.
        </p>
      </div>
      {/* Right: Sidebar with resources and notes */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <SeriesResourcesSidebar />
        <AdminNotesSidebar />
      </div>
    </div>
  );
};

ResourcesTab.displayName = 'ResourcesTab';
export default React.memo(ResourcesTab);
