/**
 * Content Manager Component - Enterprise Edition
 * Professional content management with DataTable
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { UserRole } from '../types/auth.types';
import postService, { Post } from '../services/post.service';
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

const ContentManager: React.FC = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAllPosts();
      
      // Handle paginated response from DRF
      if (data && typeof data === 'object' && 'results' in data) {
        setPosts((data as any).results || []);
      } else if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
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
    setViewMode('create');
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setViewMode('edit');
  };

  const handleDelete = async (post: Post) => {
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
          await loadPosts();
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete post');
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

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedPost(null);
    loadPosts();
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (user?.role === UserRole.MODERATOR && post.author !== user.id) {
      return false;
    }
    if (filterType && post.post_type !== filterType) {
      return false;
    }
    if (filterStatus && post.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // DataTable columns
  const columns: Column<Post>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      width: '35%',
      render: (value, row) => (
        <div className="post-title-cell">
          <div className="post-title-text">{value}</div>
          <div className="post-meta-text">
            {row.content_type_name || row.post_type}
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
  ];

  if (viewMode === 'create') {
    return (
      <div className="content-manager-pro">
        <PostCreate onSuccess={handleSuccess} onCancel={handleCancel} />
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
            Manage sermons, articles, and announcements
          </p>
        </div>
        <button className="btn-primary-pro" onClick={handleCreateNew}>
          <PlusIcon size={18} />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row-pro">
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Total Posts</div>
          <div className="stat-mini-value">{posts.length}</div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Published</div>
          <div className="stat-mini-value">
            {posts.filter(p => p.status === 'PUBLISHED').length}
          </div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Drafts</div>
          <div className="stat-mini-value">
            {posts.filter(p => p.status === 'DRAFT').length}
          </div>
        </Card>
        <Card className="stat-mini-card">
          <div className="stat-mini-label">Scheduled</div>
          <div className="stat-mini-value">
            {posts.filter(p => p.status === 'SCHEDULED').length}
          </div>
        </Card>
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
        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredPosts}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search posts by title, author..."
        emptyMessage="No posts found. Create your first post to get started."
        actions={(row) => {
          const post = row as Post;
          return (
            <ActionMenu
              actions={[
                {
                  label: 'View',
                  icon: <EyeIcon size={16} />,
                  onClick: () => window.open(`/post/${post.id}`, '_blank'),
                },
                ...(canModifyPost(post)
                  ? [
                      {
                        label: 'Edit',
                        icon: <EditIcon size={16} />,
                        onClick: () => handleEdit(post),
                      },
                      {
                        label: post.is_published ? 'Unpublish' : 'Publish',
                        icon: <EyeIcon size={16} />,
                        onClick: () => handleTogglePublish(post),
                      },
                      {
                        label: 'Delete',
                        icon: <DeleteIcon size={16} />,
                        onClick: () => handleDelete(post),
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
