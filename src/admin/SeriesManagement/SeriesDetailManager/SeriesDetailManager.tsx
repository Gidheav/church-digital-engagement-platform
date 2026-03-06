/**
 * SeriesDetailManager.tsx
 * Manage series details, posts, analytics, resources with multi-tab interface.
 * Optimized with React.memo, useCallback, useMemo, and lazy-loading tabs.
 */
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import seriesService, { SeriesDetail, SeriesPost, SERIES_VISIBILITY_OPTIONS } from '../../../services/series.service';
import postService, { Post } from '../../../services/post.service';
import ImageUploadInput from '../../components/ImageUploadInput';
import Icon from '../../../components/common/Icon';
import { TabKey, LocationState, EditForm } from './types/series-detail.types';
import { EMPTY_EDIT_FORM } from './constants/series-detail.constants';
import { fmtDate, getAuthorName } from './helpers/series-detail.helpers';

// Lazy-loaded tabs - deferred until needed
const PostsTab = lazy(() => import('./tabs/PostsTab'));
const EditTab = lazy(() => import('./tabs/EditTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));
const ResourcesTab = lazy(() => import('./tabs/ResourcesTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));

const TabSkeleton = () => (
  <div className="flex flex-col gap-4">
    <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
    <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
  </div>
);

const SeriesDetailManager: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Determine mode
  const isCreateMode = !id || id === 'new';

  // ── Series data ─────────────────────────────────────────────────
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [posts, setPosts] = useState<SeriesPost[]>([]);
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState('');

  // ── Tabs ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>(isCreateMode ? 'edit' : 'posts');

  // ── Posts tab state ─────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [showDeleteSeriesModal, setShowDeleteSeriesModal] = useState(false);
  const [deleteSeriesInput, setDeleteSeriesInput] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  // ── Add Post modal state ────────────────────────────────────────
  const [showAddPost, setShowAddPost] = useState(false);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);
  const [addPostSearch, setAddPostSearch] = useState('');
  const [addingPostId, setAddingPostId] = useState<string | null>(null);
  const [loadingAvailablePosts, setLoadingAvailablePosts] = useState(false);

  // ── Edit/Create form state ──────────────────────────────────────
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // ── Fetch (only in edit mode) ────────────────────────────────────
  const fetchSeries = useCallback(async () => {
    if (!id || isCreateMode) return;
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
  }, [id, isCreateMode]);

  useEffect(() => {
    if (!isCreateMode) {
      fetchSeries();
    }
  }, [fetchSeries, isCreateMode]);

  // Sync edit form whenever series data arrives
  useEffect(() => {
    if (series && !isCreateMode) {
      setEditForm({
        title: series.title,
        description: series.description || '',
        cover_image: series.cover_image || '',
        visibility: series.visibility,
        is_featured: series.is_featured,
        featured_priority: series.featured_priority,
      });
    }
  }, [series, isCreateMode]);

  // Show success message if just created
  useEffect(() => {
    if (state?.justCreated) {
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3500);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [state, navigate, location.pathname]);

  // ── Post actions ─────────────────────────────────────────────────
  const handleSaveOrder = useCallback(async () => {
    if (!id || isCreateMode) return;
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
  }, [id, isCreateMode, posts]);

  const handleRemovePost = useCallback((postId: string) => {
    if (!id || isCreateMode) return;
    setRemoveConfirmId(postId);
  }, [id, isCreateMode]);

  const confirmRemovePost = useCallback(async () => {
    if (!id || isCreateMode || !removeConfirmId) return;
    setRemovingId(removeConfirmId);
    try {
      await seriesService.removePostFromSeries(id, { post_id: removeConfirmId });
      setPosts(prev => prev.filter(p => p.id !== removeConfirmId));
      setSeries(prev =>
        prev ? { ...prev, post_count: Math.max(0, prev.post_count - 1) } : prev
      );
    } catch (err: any) {
      alert('Failed to remove post: ' + (err.message || 'Unknown error'));
    } finally {
      setRemovingId(null);
      setRemoveConfirmId(null);
    }
  }, [id, isCreateMode, removeConfirmId]);

  // ── Drag-to-reorder ──────────────────────────────────────────────
  const handleDragStart = useCallback((postId: string) => setDraggedId(postId), []);
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const handleDrop = useCallback((targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = posts.findIndex(p => p.id === draggedId);
    const to = posts.findIndex(p => p.id === targetId);
    if (from === -1 || to === -1) return;
    const reordered = [...posts];
    const [item] = reordered.splice(from, 1);
    reordered.splice(to, 0, item);
    setPosts(reordered);
    setDraggedId(null);
  }, [draggedId, posts]);

  const handleMovePost = useCallback((postId: string, direction: 'up' | 'down') => {
    if (isCreateMode) return;
    const idx = posts.findIndex(p => p.id === postId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === posts.length - 1) return;
    const newPosts = [...posts];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newPosts[idx], newPosts[swapIdx]] = [newPosts[swapIdx], newPosts[idx]];
    setPosts(newPosts);
  }, [isCreateMode, posts]);

  // ── Add Post handlers ────────────────────────────────────────────
  const loadAvailablePosts = useCallback(async () => {
    if (isCreateMode) return;
    setLoadingAvailablePosts(true);
    try {
      const result = await postService.getAllPosts({ is_published: undefined });
      const allArr: Post[] = Array.isArray(result) ? result : (result as any).results || [];
      setAvailablePosts(allArr.filter(p => !posts.some(sp => sp.id === p.id)));
    } catch {
      // ignore
    } finally {
      setLoadingAvailablePosts(false);
    }
  }, [posts, isCreateMode]);

  useEffect(() => {
    if (showAddPost && !isCreateMode) {
      setAddPostSearch('');
      loadAvailablePosts();
    }
  }, [showAddPost, loadAvailablePosts, isCreateMode]);

  const handleAddPost = useCallback(async (postId: string) => {
    if (!id || isCreateMode) return;
    setAddingPostId(postId);
    try {
      await seriesService.addPostToSeries(id, { post_id: postId, series_order: posts.length + 1 });
      await fetchSeries();
      setAvailablePosts(prev => prev.filter(p => p.id !== postId));
    } catch (err: any) {
      alert('Failed to add post: ' + (err.message || 'Error'));
    } finally {
      setAddingPostId(null);
    }
  }, [id, isCreateMode, posts.length, fetchSeries]);

  // ── Edit/Create form handlers ────────────────────────────────────
  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      if (type === 'checkbox') {
        setEditForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      } else if (type === 'number') {
        setEditForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
      } else {
        setEditForm(prev => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  const handleFormFieldChange = useCallback((field: keyof EditForm, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateSeries = useCallback(async () => {
    if (!editForm.title.trim()) {
      setEditError('Series title is required.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const newSeries = await seriesService.createSeries({
        title: editForm.title,
        description: editForm.description,
        cover_image: editForm.cover_image,
        visibility: editForm.visibility,
        is_featured: editForm.is_featured,
        featured_priority: editForm.featured_priority,
      });

      setCreateSuccess(true);
      setTimeout(() => {
        navigate(`/admin/series/${newSeries.id}`, {
          state: { justCreated: true },
        });
      }, 1500);
    } catch (err: any) {
      setEditError(
        err.response?.data?.message ||
        err.response?.data?.title?.[0] ||
        err.message ||
        'Failed to create series'
      );
    } finally {
      setEditSaving(false);
    }
  }, [editForm, navigate]);

  const handleEditSave = useCallback(async () => {
    if (!id || isCreateMode || !editForm.title.trim()) {
      setEditError('Series title is required.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    setEditSuccess(false);
    try {
      await seriesService.updateSeries(id, {
        title: editForm.title,
        description: editForm.description,
        cover_image: editForm.cover_image,
        visibility: editForm.visibility,
        is_featured: editForm.is_featured,
        featured_priority: editForm.featured_priority,
      });
      setEditSuccess(true);
      fetchSeries();
      setTimeout(() => setEditSuccess(false), 3500);
    } catch (err: any) {
      setEditError(
        err.response?.data?.message ||
        err.response?.data?.title?.[0] ||
        err.message ||
        'Failed to save changes'
      );
    } finally {
      setEditSaving(false);
    }
  }, [id, isCreateMode, editForm, fetchSeries]);

  const handleDiscardChanges = useCallback(() => {
    if (series) {
      setEditForm({
        title: series.title,
        description: series.description || '',
        cover_image: series.cover_image || '',
        visibility: series.visibility,
        is_featured: series.is_featured,
        featured_priority: series.featured_priority,
      });
    }
    setEditError('');
    setEditSuccess(false);
  }, [series]);

  const handleSetHidden = useCallback(() => {
    setEditForm(prev => ({ ...prev, visibility: 'HIDDEN' }));
    setActiveTab('edit');
  }, []);

  // ── Tab configuration ───────────────────────────────────────────
  const tabs = useMemo(() => {
    if (isCreateMode) {
      return [{ key: 'edit' as TabKey, icon: 'add_circle', label: 'Create Series' }];
    }
    return [
      { key: 'posts' as TabKey, icon: 'list_alt', label: 'Posts', count: posts.length },
      { key: 'edit' as TabKey, icon: 'edit', label: 'Edit Series' },
      { key: 'analytics' as TabKey, icon: 'analytics', label: 'Analytics' },
      { key: 'resources' as TabKey, icon: 'folder_open', label: 'Resources' },
      { key: 'settings' as TabKey, icon: 'settings', label: 'Settings' },
    ];
  }, [isCreateMode, posts.length]);

  const totalViews = useMemo(
    () => posts.reduce((sum, p) => sum + (p.views_count || 0), 0),
    [posts]
  );

  const authorName = useMemo(() => {
    if (!isCreateMode && series) return getAuthorName(series);
    return null;
  }, [isCreateMode, series]);

  // ── Loading / error ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Icon name="progress_activity" size={36} className="animate-spin" />
          <p className="text-sm font-medium">Loading series...</p>
        </div>
      </div>
    );
  }

  if (!isCreateMode && (error || !series)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Icon name="error_outline" size={48} className="text-red-300" />
          <p className="mt-3 text-red-600 font-semibold">{error || 'Series not found'}</p>
          <button onClick={fetchSeries} className="mt-4 text-primary text-sm underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
            <button
              onClick={() => navigate('/admin/series')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Icon name="arrow_back" size={14} />
              Series Management
            </button>
            <Icon name="chevron_right" size={10} />
            <span className="text-slate-900 truncate max-w-xs">
              {isCreateMode ? 'New Series' : series?.title}
            </span>
          </nav>

          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-5">
              {/* Cover image */}
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 hidden sm:block">
                {!isCreateMode && series?.cover_image ? (
                  <img src={series.cover_image} alt={series.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Icon name={isCreateMode ? 'add_circle' : 'account_tree'} size={32} className="text-slate-300" />
                  </div>
                )}
              </div>

              <div>
                {/* Title + badges */}
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                    {isCreateMode ? 'Create New Series' : series?.title}
                  </h2>
                  {!isCreateMode && series?.is_featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200 inline-block">
                      Featured
                    </span>
                  )}
                  {!isCreateMode && series && (
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
                  )}
                </div>

                {/* Meta line - only show in edit mode */}
                {!isCreateMode && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 hidden md:flex">
                    {authorName && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="person" size={14} />
                        Author: <strong>{authorName}</strong>
                      </span>
                    )}
                    {authorName && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                    <span className="flex items-center gap-1.5">
                      <Icon name="calendar_today" size={14} />
                      Created: <strong>{series ? fmtDate(series.created_at) : ''}</strong>
                    </span>
                    {series?.date_range?.start && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5">
                          <Icon name="event" size={14} />
                          Active:{' '}
                          <strong>
                            {fmtDate(series.date_range.start)}
                            {series.date_range.end ? ` – ${fmtDate(series.date_range.end)}` : ' – Present'}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3 flex-shrink-0 hidden md:flex">
              {!isCreateMode && (
                <a
                  href={`/library/series/${series?.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Icon name="visibility" size={18} />
                  View
                </a>
              )}
              {isCreateMode && (
                <button
                  onClick={handleCreateSeries}
                  disabled={editSaving || !editForm.title.trim()}
                  className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm flex items-center gap-2"
                >
                  <Icon name={editSaving ? 'hourglass_empty' : 'add_circle'} size={18} />
                  {editSaving ? 'Creating...' : 'Create Series'}
                </button>
              )}
            </div>
          </div>

          {/* Metrics strip - only in edit mode */}
          {!isCreateMode && (
            <div className="hidden md:grid grid-cols-4 gap-4 mt-6 border-t border-slate-100 pt-4">
              {[
                { icon: 'visibility', bg: 'bg-blue-50 text-blue-600', label: 'Total Views', value: totalViews.toLocaleString() },
                { icon: 'article', bg: 'bg-purple-50 text-purple-600', label: 'Posts Published', value: series ? `${series.published_post_count} / ${series.post_count}` : '0 / 0' },
                { icon: 'share', bg: 'bg-orange-50 text-orange-600', label: 'Shares', value: '—' },
                { icon: 'bookmark', bg: 'bg-teal-50 text-teal-600', label: 'Saves', value: '—' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${m.bg}`}>
                    <Icon name={m.icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{m.label}</p>
                    <p className="text-sm font-bold text-slate-900">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <nav className="flex -mb-px space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
                {'count' in tab && tab.count !== undefined && (
                  <span
                    className={`py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
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

      {/* ── Tab content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <Suspense fallback={<TabSkeleton />}>
              <PostsTab
                posts={posts}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddPost={() => setShowAddPost(true)}
                onSaveOrder={handleSaveOrder}
                onRemovePost={handleRemovePost}
                onMovePost={handleMovePost}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggedId={draggedId}
                removingId={removingId}
                savingOrder={savingOrder}
              />
            </Suspense>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <Suspense fallback={<TabSkeleton />}>
              <EditTab
                isCreateMode={isCreateMode}
                editForm={editForm}
                onFormChange={handleEditChange}
                onFormFieldChange={handleFormFieldChange}
                onSave={isCreateMode ? handleCreateSeries : handleEditSave}
                onDiscard={handleDiscardChanges}
                onNavigate={navigate}
                editSaving={editSaving}
                editError={editError}
                editSuccess={editSuccess}
                createSuccess={createSuccess}
              />
            </Suspense>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <Suspense fallback={<TabSkeleton />}>
              <AnalyticsTab />
            </Suspense>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <Suspense fallback={<TabSkeleton />}>
              <ResourcesTab />
            </Suspense>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Suspense fallback={<TabSkeleton />}>
              <SettingsTab
                series={series}
                totalViews={totalViews}
                seriesId={id || ''}
                onDeleteSuccess={() => navigate('/admin/series')}
                onSetHidden={handleSetHidden}
                removeConfirmId={removeConfirmId}
                onSetRemoveConfirm={setRemoveConfirmId}
                removingId={removingId}
                showDeleteSeriesModal={showDeleteSeriesModal}
                onSetShowDeleteModal={setShowDeleteSeriesModal}
                deleteSeriesInput={deleteSeriesInput}
                onSetDeleteInput={setDeleteSeriesInput}
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* ── Add Post Modal ──────────────────────────────────────── */}
      {showAddPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => {
            if (e.target === e.currentTarget) setShowAddPost(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add Posts to Series</h2>
              <button
                onClick={() => setShowAddPost(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Icon name="search" size={18} />
              </span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search posts..."
                value={addPostSearch}
                onChange={e => setAddPostSearch(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loadingAvailablePosts ? (
                <div className="text-center py-8 text-slate-400">
                  <Icon name="progress_activity" className="text-xs animate-spin" />
                  Loading posts...
                </div>
              ) : availablePosts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No posts available</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {availablePosts
                    .filter(p => p.title.toLowerCase().includes(addPostSearch.toLowerCase()))
                    .map(post => (
                      <li key={post.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{post.content_type_name || '—'}</p>
                        </div>
                        <button
                          onClick={() => handleAddPost(post.id)}
                          disabled={addingPostId === post.id}
                          className="flex-shrink-0 bg-primary text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-60"
                        >
                          {addingPostId === post.id ? (
                            <>
                              <Icon name="hourglass_empty" size={14} />
                              Adding…
                            </>
                          ) : (
                            <>
                              <Icon name="add" size={14} />
                              Add
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-slate-100 flex-shrink-0 flex justify-end">
              <button
                onClick={() => setShowAddPost(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Post Confirmation Modal */}
      {removeConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => {
            if (e.target === e.currentTarget) setRemoveConfirmId(null);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="remove_circle" size={24} className="text-red-400" />
              <h2 className="text-lg font-bold text-slate-900">Remove Post</h2>
            </div>
            <p className="text-slate-700 mb-4">Are you sure you want to remove this post from the series? This will not delete the post.</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                onClick={() => setRemoveConfirmId(null)}
                disabled={removingId !== null}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={confirmRemovePost}
                disabled={removingId !== null}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SeriesDetailManager);
