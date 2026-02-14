/**
 * Content Manager Component - Enterprise Edition
 * Professional content management with DataTable
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { UserRole } from '../types/auth.types';
import postService, { Post } from '../services/post.service';
import draftService, { Draft } from '../services/draft.service';
import DataTable, { Column, StatusBadge, ActionMenu } from './components/DataTable';
import { Card } from './components/Card';
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  FilterIcon,
} from './components/Icons';
import PostCreate from './PostCreate';
import PostEdit from './PostEdit';
import './styles/ContentManager.css';

type ViewMode = 'list' | 'create' | 'edit';
type ContentTab = 'ALL' | 'PUBLISHED' | 'DRAFTS' | 'TRASH';

interface ContentManagerProps {
  initialDraftId?: string | null;
  initialTab?: ContentTab;
}

type ContentRow = {
  id: string;
  title: string;
  content_type_name?: string | null;
  post_type?: string | null;
  author: string;
  author_name: string;
  author_email?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  source: 'post' | 'draft';
  draft_id?: string;
  post_id?: string | null;
  content_type?: string | null;
  is_deleted?: boolean;
  search_text?: string;
  time_since_save?: string; // For drafts only
  last_autosave_at?: string; // For drafts only
};

const ContentManager: React.FC<ContentManagerProps> = ({ initialDraftId = null, initialTab = 'ALL' }) => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ContentTab>(initialTab);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [appliedDraftId, setAppliedDraftId] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    loadDrafts();
  }, []);

  useEffect(() => {
    if (activeTab === 'TRASH') {
      loadDeletedPosts();
    } else if (activeTab === 'DRAFTS') {
      console.log('📋 [CONTENT MANAGER] DRAFTS tab activated, loading drafts...');
      loadDrafts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!initialDraftId || appliedDraftId === initialDraftId) return;
    const draft = drafts.find(item => item.id === initialDraftId) || null;
    if (draft) {
      setSelectedDraft(draft);
      setViewMode('create');
      setActiveTab('DRAFTS');
      setAppliedDraftId(initialDraftId);
    }
  }, [initialDraftId, drafts, appliedDraftId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAllPosts();
      
      console.log('=== POSTS DATA RESPONSE ===');
      console.log('Raw response:', data);
      
      // Handle paginated response from DRF
      let postsArray: Post[] = [];
      if (data && typeof data === 'object' && 'results' in data) {
        postsArray = (data as any).results || [];
      } else if (Array.isArray(data)) {
        postsArray = data;
      } else {
        postsArray = [];
      }
      
      console.log(`Total posts received: ${postsArray.length}`);
      console.log('Current user:', user);
      console.log(`User ID: ${user?.id} (type: ${typeof user?.id})`);
      
      postsArray.forEach((post, index) => {
        console.log(`Post ${index}:`, {
          id: post.id,
          title: post.title,
          author: post.author,
          'author (type)': typeof post.author,
          author_name: post.author_name,
          author_email: post.author_email,
        });
      });
      
      setPosts(postsArray);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedPosts = async () => {
    try {
      setLoadingDeleted(true);
      const data = await postService.getAllPosts({ is_deleted: true });

      let postsArray: Post[] = [];
      if (data && typeof data === 'object' && 'results' in data) {
        postsArray = (data as any).results || [];
      } else if (Array.isArray(data)) {
        postsArray = data;
      } else {
        postsArray = [];
      }

      setDeletedPosts(postsArray);
    } catch (err: any) {
      console.error('Failed to load deleted posts:', err);
      setDeletedPosts([]);
    } finally {
      setLoadingDeleted(false);
    }
  };

  const loadDrafts = async () => {
    try {
      setLoadingDrafts(true);
      console.log('📋 [CONTENT MANAGER] Starting to load drafts...');
      const response = await draftService.getAllDrafts();
      console.log('📋 [CONTENT MANAGER] Raw drafts response:', response);
      
      let draftsArray: Draft[] = [];
      if (response && typeof response === 'object' && 'results' in response) {
        draftsArray = (response as any).results || [];
      } else if (Array.isArray(response)) {
        draftsArray = response;
      } else {
        draftsArray = [];
      }
      
      console.log(`📋 [CONTENT MANAGER] Processed drafts array length: ${draftsArray.length}`);
      
      if (draftsArray.length > 0) {
        console.log('📋 [CONTENT MANAGER] First draft:', draftsArray[0]);
      }
      
      setDrafts(draftsArray);
    } catch (err: any) {
      console.error('❌ [CONTENT MANAGER] Failed to load drafts:', err);
      setDrafts([]);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const canModifyPost = (post: Post): boolean => {
    if (user?.role === UserRole.ADMIN) return true;
    if (user?.role === UserRole.MODERATOR) {
      return post.author === user.id;
    }
    return false;
  };

  const handleCreateNew = () => {
    setSelectedDraft(null);
    setViewMode('create');
  };

  const getDraftTitle = (draft: Draft): string => {
    if (draft.draft_data?.title) return draft.draft_data.title;
    if (draft.draft_title) return draft.draft_title;
    if (draft.post_title) return draft.post_title;
    return 'Untitled Draft';
  };

  const handleEditPost = async (post: Post) => {
    if (post.is_published) {
      try {
        setCreatingDraft(true);
        const fullPost = await postService.getPost(post.id);
        const draftData = {
          title: fullPost.title || 'Untitled Draft',
          content: fullPost.content || '',
          content_type: fullPost.content_type || undefined,
          status: fullPost.status,
          comments_enabled: fullPost.comments_enabled,
          reactions_enabled: fullPost.reactions_enabled,
          featured_image: fullPost.featured_image || '',
          video_url: fullPost.video_url || '',
          audio_url: fullPost.audio_url || '',
          is_featured: (fullPost as any).is_featured,
          featured_priority: (fullPost as any).featured_priority,
          series: fullPost.series || null,
          series_order: fullPost.series_order,
        };

        const draft = await draftService.createDraft({
          draft_data: draftData,
          content_type: fullPost.content_type || null,
          post: fullPost.id,
        });

        setSelectedDraft(draft);
        setViewMode('create');
      } catch (err: any) {
        console.error('Failed to create draft copy:', err);
        alert(err.response?.data?.detail || 'Failed to create draft copy');
      } finally {
        setCreatingDraft(false);
      }
      return;
    }

    setSelectedPost(post);
    setViewMode('edit');
  };

  const handleEditDraft = async (draft: Draft) => {
    console.log('✏️ [EDIT DRAFT] Clicked edit for draft:', draft);
    console.log('✏️ [EDIT DRAFT] Draft ID:', draft.id);
    console.log('✏️ [EDIT DRAFT] Draft data from list:', draft.draft_data);
    
    try {
      // Fetch the FULL draft with draft_data from API
      console.log('✏️ [EDIT DRAFT] Fetching full draft details from API...');
      const fullDraft = await draftService.getDraft(draft.id);
      console.log('✏️ [EDIT DRAFT] Full draft received:', fullDraft);
      console.log('✏️ [EDIT DRAFT] Full draft data:', fullDraft.draft_data);
      console.log('✏️ [EDIT DRAFT] Title:', fullDraft.draft_data?.title);
      console.log('✏️ [EDIT DRAFT] Content length:', fullDraft.draft_data?.content?.length || 0);
      console.log('✏️ [EDIT DRAFT] Content preview:', fullDraft.draft_data?.content?.substring(0, 100));
      console.log('✏️ [EDIT DRAFT] Last saved:', fullDraft.last_autosave_at);
      
      setSelectedDraft(fullDraft);
      setViewMode('create');
    } catch (error) {
      console.error('✏️ [EDIT DRAFT] Failed to fetch full draft:', error);
      alert('Failed to load draft. Please try again.');
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (!canModifyPost(post)) {
      alert('You do not have permission to delete this post');
      return;
    }

    confirm({
      title: 'Delete Post',
      message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await postService.deletePost(post.id);
          await Promise.all([loadPosts(), loadDeletedPosts()]);
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete post');
        }
      },
    });
  };

  const handleDeleteDraft = async (draft: Draft) => {
    confirm({
      title: 'Delete Draft',
      message: `Are you sure you want to delete "${getDraftTitle(draft)}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await draftService.deleteDraft(draft.id);
          await loadDrafts();
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to delete draft');
        }
      },
    });
  };

  const handleTogglePublish = async (post: Post) => {
    if (!canModifyPost(post)) {
      alert('You do not have permission to modify this post');
      return;
    }

    try {
      await postService.updatePost(post.id, {
        status: post.is_published ? 'DRAFT' : 'PUBLISHED',
      } as any);
      await loadPosts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handlePublishDraft = async (draft: Draft) => {
    try {
      await draftService.publishDraft(draft.id);
      await Promise.all([loadPosts(), loadDrafts()]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to publish draft');
    }
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedPost(null);
    setSelectedDraft(null);
    loadPosts();
    loadDrafts();
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPost(null);
    setSelectedDraft(null);
  };

  const rows: ContentRow[] = useMemo(() => {
    const combinedPosts = [...posts, ...deletedPosts];
    const postRows: ContentRow[] = combinedPosts.map((post) => ({
      id: post.id,
      title: post.title || 'Untitled',
      content_type_name: (post as any).content_type_name || post.post_type,
      post_type: post.post_type,
      author: post.author,
      author_name: post.author_name,
      author_email: post.author_email,
      status: post.status,
      is_published: post.is_published,
      published_at: post.published_at,
      views_count: post.views_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      source: 'post',
      content_type: post.content_type || null,
      is_deleted: (post as any).is_deleted || false,
      search_text: `${post.title || ''} ${post.author_name || ''}`.trim(),
    }));

    const draftRows: ContentRow[] = drafts.map((draft) => {
      const title = getDraftTitle(draft);
      return {
        id: draft.id,
        title,
        content_type_name: draft.content_type_name || 'Unknown Type',
        post_type: null,
        author: draft.user,
        author_name: draft.user_name || 'Unknown',
        author_email: draft.user_email || '',
        status: 'DRAFT',
        is_published: false,
        published_at: null,
        views_count: 0,
        created_at: draft.created_at,
        updated_at: draft.last_autosave_at,
        source: 'draft',
        draft_id: draft.id,
        post_id: draft.post,
        content_type: draft.content_type || null,
        is_deleted: false,
        search_text: `${title} ${draft.preview || ''} ${draft.content_type_name || ''}`.trim(),
        time_since_save: draft.time_since_save,
        last_autosave_at: draft.last_autosave_at,
      };
    });

    return [...postRows, ...draftRows];
  }, [posts, deletedPosts, drafts]);

  // Filter posts based on user role
  const filteredPosts = rows.filter(row => {
    // ADMIN: See all posts (no filtering by author)
    // MODERATOR: Only see posts they created
    if (user?.role === UserRole.MODERATOR) {
      // Convert both to strings for comparison to avoid type mismatch
      if (row.source === 'post') {
        const postAuthorId = String(row.author);
        const currentUserId = String(user.id);
        
        if (postAuthorId !== currentUserId) {
          console.log(`[FILTER] Moderator "${user.email}" filtering out post "${row.title}" - post.author="${postAuthorId}" !== user.id="${currentUserId}"`);
          return false;
        }
      }
    }
    // If ADMIN, all posts pass through (no author filtering)
    
    // Apply additional filters (type and status)
    if (filterType) {
      const rowType = String(row.content_type_name || row.post_type || '').toUpperCase();
      if (rowType !== filterType.toUpperCase()) {
        return false;
      }
    }

    if (activeTab === 'PUBLISHED') {
      return row.source === 'post' && row.status === 'PUBLISHED';
    }

    if (activeTab === 'DRAFTS') {
      return row.status === 'DRAFT' || row.source === 'draft';
    }

    if (activeTab === 'TRASH') {
      return row.is_deleted === true;
    }

    // ALL
    if (row.is_deleted) {
      return false;
    }
    return true;
  });
  
  console.log(`[FILTER RESULT] Role: ${user?.role}, Total rows: ${rows.length}, Filtered rows: ${filteredPosts.length}`);
  if (rows.length > 0 && filteredPosts.length === 0) {
    console.warn('[FILTER WARNING] No posts matched the filter!');
    console.log('Rows:', rows);
    console.log('User ID:', user?.id, '(type:', typeof user?.id, ')');
  }

  // DataTable columns
  const columns: Column<ContentRow>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      width: '35%',
      render: (value, row) => (
        <div className="post-title-cell">
          <div className="post-title-text">{value || 'Untitled'}</div>
          <div className="post-meta-text">
            {row.content_type_name || row.post_type || 'Unknown Type'}
          </div>
        </div>
      ),
    },
    {
      key: 'author_name',
      label: 'Author',
      sortable: true,
      width: '15%',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '12%',
      align: 'center',
      render: (value) => {
        const statusMap: Record<string, { variant: any; label: string }> = {
          DRAFT: { variant: 'default', label: 'Draft' },
          SCHEDULED: { variant: 'warning', label: 'Scheduled' },
          PUBLISHED: { variant: 'success', label: 'Published' },
        };
        const status = statusMap[value] || { variant: 'default', label: value };
        return <StatusBadge status={status.label} variant={status.variant} />;
      },
    },
    {
      key: 'published_at',
      label: 'Published',
      sortable: true,
      width: '15%',
      render: (value) => value ? new Date(value).toLocaleDateString() : '—',
    },
    {
      key: 'views_count',
      label: 'Views',
      sortable: true,
      width: '10%',
      align: 'center',
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      width: '13%',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'time_since_save',
      label: 'Last Saved',
      sortable: false,
      width: '13%',
      render: (value, row) => {
        // Only show for drafts
        if (row.source !== 'draft' || !value) return '—';
        return (
          <div className="text-xs" title={row.last_autosave_at ? new Date(row.last_autosave_at).toLocaleString() : ''}>
            {value}
          </div>
        );
      },
    },
  ];

  if (viewMode === 'create') {
    return (
      <div className="content-manager-pro">
        <PostCreate 
          key={selectedDraft?.id || 'new'}
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
          initialDraft={selectedDraft} 
        />
      </div>
    );
  }

  if (viewMode === 'edit' && selectedPost) {
    return (
      <div className="content-manager-pro">
        {/* <div className="page-header-pro">
          <div className="page-title-section">
            <h1 className="page-title">Edit Post</h1>
            <p className="page-subtitle">Modify existing content</p>
          </div>
        </div>*/}
        <PostEdit
          postId={selectedPost.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="content-manager-pro">
      {/* Page Header */}
      <div className="page-header-pro">
        <div className="page-title-section">
          <h1 className="page-title">Content Management</h1>
          <p className="page-subtitle">
            {user?.role === UserRole.ADMIN 
              ? 'Manage all sermons, articles, and announcements' 
              : 'Manage your sermons, articles, and announcements'}
          </p>
        </div>
        <button className="btn-primary-pro" onClick={handleCreateNew}>
          <PlusIcon size={18} />
          <span>Create New Post</span>
        </button>
      </div>

      {creatingDraft && (
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Preparing draft...</div>
          <div className="stat-mini-value">Please wait</div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="stats-row-pro">
        <Card className="stat-mini-card">
          <div className="stat-mini-label">
            {user?.role === UserRole.ADMIN ? 'Total Content' : 'My Content'}
          </div>
          <div className="stat-mini-value">{rows.filter(row => !row.is_deleted).length}</div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Published</div>
          <div className="stat-mini-value">
            {rows.filter(p => p.status === 'PUBLISHED').length}
          </div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Drafts</div>
          <div className="stat-mini-value">
            {rows.filter(p => p.status === 'DRAFT').length}
          </div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Scheduled</div>
          <div className="stat-mini-value">
            {rows.filter(p => p.status === 'SCHEDULED').length}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="content-tabs-pro">
        {(['ALL', 'PUBLISHED', 'DRAFTS', 'TRASH'] as ContentTab[]).map((tab) => (
          <button
            key={tab}
            className={`content-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-row-pro">
        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="SERMON">Sermons</option>
            <option value="ARTICLE">Articles</option>
            <option value="ANNOUNCEMENT">Announcements</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredPosts}
        columns={columns}
        loading={loading || loadingDrafts || loadingDeleted}
        searchable={true}
        searchPlaceholder="Search posts by title, author..."
        emptyMessage="No posts found. Create your first post to get started."
        actions={(row) => {
          const dataRow = row as ContentRow;
          const post = posts.find(p => p.id === dataRow.id) || null;
          const draft = drafts.find(d => d.id === dataRow.id) || null;

          if (dataRow.source === 'draft' && draft) {
            return (
              <ActionMenu
                actions={[
                  {
                    label: 'Edit',
                    icon: <EditIcon size={16} />,
                    onClick: () => handleEditDraft(draft),
                  },
                  {
                    label: 'Publish',
                    icon: <EyeIcon size={16} />,
                    onClick: () => handlePublishDraft(draft),
                  },
                  {
                    label: 'Delete',
                    icon: <DeleteIcon size={16} />,
                    onClick: () => handleDeleteDraft(draft),
                    danger: true,
                  },
                ]}
              />
            );
          }

          if (!post) {
            return null;
          }

          return (
            <ActionMenu
              actions={[
                ...(post.is_published
                  ? [
                      {
                        label: 'View',
                        icon: <EyeIcon size={16} />,
                        onClick: () => window.open(`/post/${post.id}`, '_blank'),
                      },
                    ]
                  : []),
                ...(canModifyPost(post)
                  ? [
                      {
                        label: 'Edit',
                        icon: <EditIcon size={16} />,
                        onClick: () => handleEditPost(post),
                      },
                      {
                        label: post.is_published ? 'Unpublish' : 'Publish',
                        icon: <EyeIcon size={16} />,
                        onClick: () => handleTogglePublish(post),
                      },
                      {
                        label: 'Delete',
                        icon: <DeleteIcon size={16} />,
                        onClick: () => handleDeletePost(post),
                        danger: true,
                      },
                    ]
                  : []),
              ]}
            />
          );
        }}
      />
    </div>
  );
};

export default ContentManager;
