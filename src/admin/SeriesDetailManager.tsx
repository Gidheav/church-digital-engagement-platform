/**
 * Series Detail Manager
 * Full series detail view powered by real API data.
 * Shows: series header, metrics, posts tab (drag-to-reorder, remove),
 * Settings / Analytics / Resources tabs as future placeholders.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import seriesService, { SeriesDetail, SeriesPost } from '../services/series.service';
import SeriesEdit from './SeriesEdit';

type TabKey = 'posts' | 'settings' | 'analytics' | 'resources';

const SeriesDetailManager: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [posts, setPosts] = useState<SeriesPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchSeries = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await seriesService.getSeries(id);
      setSeries(data);
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load series');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  /* ─── Post actions ─────────────────────────────────────────────── */

  const handleSaveOrder = async () => {
    if (!id) return;
    setSavingOrder(true);
    try {
      await seriesService.reorderSeriesPosts(id, {
        post_orders: posts.map((p, i) => ({ post_id: p.id, order: i + 1 })),
      });
    } catch (err: any) {
      alert('Failed to save order: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!id || !window.confirm('Remove this post from the series?')) return;
    setRemovingId(postId);
    try {
      await seriesService.removePostFromSeries(id, { post_id: postId });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSeries(prev =>
        prev ? { ...prev, post_count: Math.max(0, prev.post_count - 1) } : prev
      );
    } catch (err: any) {
      alert('Failed to remove post: ' + (err.message || 'Unknown error'));
    } finally {
      setRemovingId(null);
    }
  };

  /* ─── Drag-to-reorder ───────────────────────────────────────────── */

  const handleDragStart = (postId: string) => setDraggedId(postId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = posts.findIndex(p => p.id === draggedId);
    const to = posts.findIndex(p => p.id === targetId);
    if (from === -1 || to === -1) return;
    const reordered = [...posts];
    const [item] = reordered.splice(from, 1);
    reordered.splice(to, 0, item);
    setPosts(reordered);
    setDraggedId(null);
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ─── Loading / error states ────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="material-symbols-outlined text-4xl animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-medium">Loading series...</p>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-300">error_outline</span>
          <p className="mt-3 text-red-600 font-semibold">{error || 'Series not found'}</p>
          <button onClick={fetchSeries} className="mt-4 text-primary text-sm underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Helpers ───────────────────────────────────────────────────── */

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const authorName =
    series.author_name ||
    (typeof series.author === 'object' && series.author
      ? (series.author as any).full_name
      : null);

  /* ─── Render ────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Edit modal */}
      {showEdit && (
        <SeriesEdit
          series={series as any}
          onSuccess={() => {
            setShowEdit(false);
            fetchSeries();
          }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
            <span>Series Management</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-slate-900 truncate max-w-xs">{series.title}</span>
          </nav>

          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-5">
              {/* Cover image */}
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                {series.cover_image ? (
                  <img
                    src={series.cover_image}
                    alt={series.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300">
                      account_tree
                    </span>
                  </div>
                )}
              </div>

              <div>
                {/* Title + badges */}
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                    {series.title}
                  </h2>
                  {series.is_featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      series.visibility === 'PUBLIC'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : series.visibility === 'MEMBERS_ONLY'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {series.visibility.replace('_', ' ')}
                  </span>
                </div>

                {/* Meta line */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  {authorName && (
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      Author: <strong>{authorName}</strong>
                    </span>
                  )}
                  {authorName && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Created: <strong>{fmtDate(series.created_at)}</strong>
                  </span>
                  {series.date_range?.start && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">event</span>
                        Active:{' '}
                        <strong>
                          {fmtDate(series.date_range.start)}
                          {series.date_range.end
                            ? ` – ${fmtDate(series.date_range.end)}`
                            : ' – Present'}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href={`/library/series/${series.slug}`}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View as Congregation
              </a>
              <button
                onClick={() => setShowEdit(true)}
                className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Series
              </button>
            </div>
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-100 pt-4">
            {[
              {
                icon: 'visibility',
                bg: 'bg-blue-50 text-blue-600',
                label: 'Total Views',
                value: (series.total_views || 0).toLocaleString(),
              },
              {
                icon: 'article',
                bg: 'bg-purple-50 text-purple-600',
                label: 'Posts Published',
                value: `${series.published_post_count} / ${series.post_count}`,
              },
              {
                icon: 'share',
                bg: 'bg-orange-50 text-orange-600',
                label: 'Shares',
                value: '—',
              },
              {
                icon: 'bookmark',
                bg: 'bg-teal-50 text-teal-600',
                label: 'Saves',
                value: '—',
              },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${m.bg}`}>
                  <span className="material-symbols-outlined text-lg">{m.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    {m.label}
                  </p>
                  <p className="text-sm font-bold text-slate-900">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <nav className="flex -mb-px space-x-8">
            {(
              [
                { key: 'posts' as TabKey, icon: 'list_alt', label: 'Posts', count: posts.length },
                { key: 'settings' as TabKey, icon: 'settings', label: 'Settings' },
                { key: 'analytics' as TabKey, icon: 'analytics', label: 'Analytics' },
                { key: 'resources' as TabKey, icon: 'folder_open', label: 'Resources' },
              ] as const
            ).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
                {'count' in tab && (
                  <span
                    className={`py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Posts tab ─────────────────────────────────────────── */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-72">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <span className="material-symbols-outlined text-lg">search</span>
                  </span>
                  <input
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSaveOrder}
                  disabled={savingOrder}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-sm">
                    {savingOrder ? 'hourglass_empty' : 'save'}
                  </span>
                  {savingOrder ? 'Saving...' : 'Save Order'}
                </button>
              </div>

              {/* Empty state */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <span className="material-symbols-outlined text-5xl text-slate-300">article</span>
                  <p className="mt-2 font-semibold">No posts in this series yet</p>
                  <p className="text-xs mt-1 text-slate-400">
                    Use "Edit Series" to add posts from your content library
                  </p>
                </div>
              )}

              {/* Post rows */}
              {filteredPosts.length > 0 && (
                <div className="flex flex-col gap-2">
                  {filteredPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={() => handleDragStart(post.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(post.id)}
                      className={[
                        'bg-white rounded-xl p-4 flex items-center gap-4 border transition-all select-none',
                        post.is_published
                          ? 'border-slate-200 hover:border-slate-300'
                          : 'border-slate-200 opacity-70',
                        draggedId === post.id ? 'opacity-40 scale-[0.98]' : '',
                      ].join(' ')}
                    >
                      {/* Drag handle */}
                      <div className="text-slate-300 cursor-grab active:cursor-grabbing">
                        <span className="material-symbols-outlined">drag_indicator</span>
                      </div>

                      {/* Thumbnail */}
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg text-slate-300">
                              article
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          Part {idx + 1}: {post.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                          {post.author_name && <span>{post.author_name}</span>}
                          {post.author_name && post.published_at && (
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                          )}
                          {post.published_at && (
                            <span>{fmtDate(post.published_at)}</span>
                          )}
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{(post.views_count || 0).toLocaleString()} views</span>
                          {post.content_type_name && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{post.content_type_name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status + remove */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {post.is_published ? (
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            Draft
                          </span>
                        )}
                        <button
                          onClick={() => handleRemovePost(post.id)}
                          disabled={removingId === post.id}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Remove from series"
                        >
                          <span className="material-symbols-outlined">
                            {removingId === post.id ? 'hourglass_empty' : 'delete'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add post CTA */}
              <button
                onClick={() => setShowEdit(true)}
                className="mt-2 group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/20 transition-colors mb-2">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <span className="text-sm font-semibold text-slate-600 group-hover:text-primary">
                  Add Post to Series
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">
                  Open series editor to select posts
                </span>
              </button>
            </div>
          )}

          {/* ── Settings tab ──────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">settings</span>
              <p className="text-slate-700 font-semibold mt-4 text-lg">Series Settings</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                Update the title, description, cover image, visibility, and featured settings via the
                Edit Series panel.
              </p>
              <button
                onClick={() => setShowEdit(true)}
                className="mt-6 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Edit Series
              </button>
            </div>
          )}

          {/* ── Analytics tab ─────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">analytics</span>
              <p className="text-slate-700 font-semibold mt-4 text-lg">Analytics Coming Soon</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                Detailed per-post engagement, retention curves, and share analytics will be
                available here in a future update.
              </p>
            </div>
          )}

          {/* ── Resources tab ─────────────────────────────────────── */}
          {activeTab === 'resources' && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">folder_open</span>
              <p className="text-slate-700 font-semibold mt-4 text-lg">Resources Coming Soon</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                Attach discussion guides, PDFs, and supplementary materials to this series in a
                future update.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SeriesDetailManager;