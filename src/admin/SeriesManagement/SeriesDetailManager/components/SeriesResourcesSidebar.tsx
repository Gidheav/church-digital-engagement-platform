import React, { useState } from 'react';
import Icon from '../../../../components/common/Icon';
import { Resource } from '../types/series-detail.types';

interface SeriesResourcesSidebarProps {
  resources?: Resource[];
  onRemove?: (id: number) => void;
}

const SeriesResourcesSidebar: React.FC<SeriesResourcesSidebarProps> = ({ resources = [], onRemove }) => {
  const [items, setItems] = useState<Resource[]>(resources);

  const handleRemove = (id: number) => {
    setItems(items.filter(r => r.id !== id));
    onRemove?.(id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Series Resources</h3>
        <button className="text-primary hover:text-primary-dark p-1">
          <Icon name="add_circle" size={18} />
        </button>
      </div>
      <ul className="space-y-3">
        {items.map(resource => (
          <li key={resource.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer group">
            <span className={`material-symbols-outlined ${resource.type === 'pdf' ? 'text-red-500' : 'text-blue-500'} text-2xl mt-0.5`}>
              {resource.type === 'pdf' ? 'picture_as_pdf' : 'description'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary">
                {resource.name}
              </p>
              <p className="text-[10px] text-slate-500">Added {resource.dateAdded} • {resource.size}</p>
            </div>
            <button
              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(resource.id)}
            >
              <Icon name="close" size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-slate-50 rounded transition-colors text-center border border-dashed border-slate-300">
          + Attach File
        </button>
      </div>
    </div>
  );
};

export default React.memo(SeriesResourcesSidebar);
