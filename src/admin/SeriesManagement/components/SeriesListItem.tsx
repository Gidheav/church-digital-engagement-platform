import React from 'react';
import { Series } from '../types/series-manager.types';
import SeriesViewsCell from './SeriesViewsCell';
import { getVisibilityBadgeClass } from '../helpers/series-manager.helpers';
import Icon from '../../../components/common/Icon';

interface SeriesListItemProps {
  series: Series;
  onClick: () => void;
}

const SeriesListItem: React.FC<SeriesListItemProps> = ({ series: s, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Cover thumbnail */}
      <div className="h-14 w-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
        {s.cover_image ? (
          <img src={s.cover_image} alt={s.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Icon name="account_tree" size={24} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Series info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-bold text-slate-900 truncate">{s.title}</h3>
          {s.is_featured && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
              Featured
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getVisibilityBadgeClass(s.visibility)}`}>
            {s.visibility === 'MEMBERS_ONLY' ? 'Members Only' : s.visibility === 'PUBLIC' ? 'Public' : 'Hidden'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
          <span>{s.published_post_count} / {s.post_count} posts published</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <SeriesViewsCell seriesId={s.id} />
          {s.author_name && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1">
                <Icon name="person" size={12} />
                {s.author_name}
              </span>
            </>
          )}
          {s.date_range?.start && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>
                {new Date(s.date_range.start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action arrow */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Icon name="chevron_right" size={18} className="text-slate-300" />
      </div>
    </div>
  );
};

export default React.memo(SeriesListItem);
