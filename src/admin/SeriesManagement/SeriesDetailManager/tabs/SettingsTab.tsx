/**
 * SettingsTab - Series metadata and danger zone
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeriesDetail } from '../../../../services/series.service';
import seriesService from '../../../../services/series.service';
import Icon from '../../../../components/common/Icon';
import { fmtDate } from '../helpers/series-detail.helpers';

interface SettingsTabProps {
  series: SeriesDetail | null;
  totalViews: number;
  seriesId: string;
  onDeleteSuccess?: () => void;
  onSetHidden?: () => void;
  removeConfirmId?: string | null;
  onSetRemoveConfirm?: (id: string | null) => void;
  removingId?: string | null;
  showDeleteSeriesModal?: boolean;
  onSetShowDeleteModal?: (show: boolean) => void;
  deleteSeriesInput?: string;
  onSetDeleteInput?: (value: string) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = React.memo(({
  series,
  totalViews,
  seriesId,
  onDeleteSuccess,
  onSetHidden,
  removeConfirmId,
  onSetRemoveConfirm,
  removingId,
  showDeleteSeriesModal,
  onSetShowDeleteModal,
  deleteSeriesInput = '',
  onSetDeleteInput,
}) => {
  const navigate = useNavigate();

  const handleDeleteSeries = useCallback(async () => {
    if (!seriesId) return;
    try {
      await seriesService.deleteSeries(seriesId);
      navigate('/admin/series');
      onDeleteSuccess?.();
    } catch (err: any) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    } finally {
      onSetShowDeleteModal?.(false);
      onSetDeleteInput?.('');
    }
  }, [seriesId, navigate, onDeleteSuccess, onSetShowDeleteModal, onSetDeleteInput]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left column: Info cards */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Card: Series Information */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <Icon name="info" size={18} className="text-primary/70" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Series Information</h3>
                <p className="text-xs text-slate-400">Read-only metadata about this series</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { icon: 'tag', label: 'Series ID', value: series?.id || '' },
                { icon: 'link', label: 'Public URL Slug', value: series?.slug || '' },
                { icon: 'calendar_today', label: 'Created', value: series ? fmtDate(series.created_at) : '' },
                { icon: 'article', label: 'Total Posts', value: series ? `${series.post_count} posts (${series.published_post_count} published)` : '' },
                { icon: 'visibility', label: 'Total Views', value: totalViews.toLocaleString() },
              ].map((row: any) => (
                <div key={row.label} className="flex items-center gap-4 px-6 py-3.5">
                  <Icon name={row.icon} size={16} className="text-slate-300 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 flex-shrink-0">{row.label}</span>
                  <span className="text-sm text-slate-800 font-medium truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Public URL */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <Icon name="open_in_new" size={18} className="text-primary/70" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Public Page</h3>
                <p className="text-xs text-slate-400">The live URL for this series</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                <Icon name="link" size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate flex-1">/library/series/{series?.slug}</span>
                <a
                  href={`/library/series/${series?.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Open
                  <Icon name="open_in_new" className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Danger zone */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2.5 bg-red-50/60">
              <Icon name="warning" size={18} className="text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
                <p className="text-xs text-red-400">Irreversible actions</p>
              </div>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Archive */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-800">Archive Series</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hides the series from public view without deleting any content. You can restore it later from Visibility settings.
                </p>
                <button
                  type="button"
                  onClick={onSetHidden}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="archive" size={14} />
                  Archive (Set Hidden)
                </button>
              </div>
              <div className="border-t border-red-100" />
              {/* Delete */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-red-700">Delete Series</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Permanently removes this series. Posts assigned to it will not be deleted but will no longer be grouped.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSetDeleteInput?.('');
                    onSetShowDeleteModal?.(true);
                  }}
                  className="mt-1 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Icon name="delete_forever" size={14} />
                  Delete Series
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Series Confirmation Modal */}
      {showDeleteSeriesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => {
            if (e.target === e.currentTarget) {
              onSetShowDeleteModal?.(false);
              onSetDeleteInput?.('');
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="delete_forever" size={24} className="text-red-400" />
              <h2 className="text-lg font-bold text-slate-900">Delete Series</h2>
            </div>
            <p className="text-slate-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">"{series?.title}"</span>? This cannot be undone. Posts assigned to it will not be deleted but will
              no longer be grouped.
            </p>
            <p className="text-xs text-slate-500 mb-2">
              To confirm, type <span className="font-semibold text-slate-700">{series?.title}</span> below:
            </p>
            <input
              type="text"
              value={deleteSeriesInput}
              onChange={e => onSetDeleteInput?.(e.target.value)}
              onPaste={e => e.preventDefault()}
              placeholder={series?.title || 'Series name'}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => {
                  onSetShowDeleteModal?.(false);
                  onSetDeleteInput?.('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={handleDeleteSeries}
                disabled={deleteSeriesInput !== (series?.title || '')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

SettingsTab.displayName = 'SettingsTab';
export default SettingsTab;
