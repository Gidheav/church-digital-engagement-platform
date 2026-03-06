/**
 * Series Manager
 * Lists all series from the real API with create / edit / delete actions.
 * Optimized with React.memo, useCallback, and memoized filtering.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import seriesService from '../../services/series.service';
import Icon from '../../components/common/Icon';
import SeriesListItem from './components/SeriesListItem';
import { Series } from './types/series-manager.types';

const SeriesManager: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await seriesService.getAllSeries();
      setSeries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load series');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const handleCreateNew = useCallback(() => {
    navigate('/admin/series/new');
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return series;
    return series.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [series, searchTerm]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Series Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Loading...' : `${series.length} series total`}</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2"
          >
            <Icon name="add" size={14} />
            New Series
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/20 px-8 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Icon name="search" size={18} />
            </span>
            <input
              type="text"
              placeholder="Search series by title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-transparent p-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 h-[72px] animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <Icon name="error_outline" size={36} className="text-red-400" />
              <p className="mt-3 text-red-700 font-semibold">{error}</p>
              <button onClick={fetchSeries} className="mt-4 text-sm text-primary underline">
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon name="account_tree" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">
                {searchTerm ? 'No series match your search' : 'No series yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Create your first series
                </button>
              )}
            </div>
          )}

          {/* Series list */}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map(s => (
                <SeriesListItem
                  key={s.id}
                  series={s}
                  onClick={() => navigate(`/admin/series/${s.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SeriesManager);
