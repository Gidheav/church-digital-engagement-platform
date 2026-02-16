/**
 * SeriesEdit Component - Enterprise Edition
 * Professional series editor with tabbed interface
 */

import React, { useState, useEffect } from 'react';
import seriesService, { Series, SeriesPost, SeriesUpdateData, SERIES_VISIBILITY_OPTIONS } from '../services/series.service';
import postService, { Post } from '../services/post.service';
import {
  XIcon,
  SaveIcon,
  FolderIcon,
  AlertCircleIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ImageIcon,
  EyeIcon,
  StarIcon,
  ListIcon,
  BookOpen,
} from './components/Icons';
import './styles/SeriesEdit.pro.css';

interface SeriesEditProps {
  series: Series;
  onSuccess: () => void;
  onCancel: () => void;
}

type TabMode = 'details' | 'posts';

const SeriesEdit: React.FC<SeriesEditProps> = ({ series, onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('details');
  const [formData, setFormData] = useState<SeriesUpdateData>({
    title: series.title,
    description: series.description || '',
    cover_image: series.cover_image || '',
    visibility: series.visibility,
    is_featured: series.is_featured,
    featured_priority: series.featured_priority,
  });
  
  // Posts management
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([]);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [suggestedOrder, setSuggestedOrder] = useState<number>(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'posts') {
      loadSeriesPosts();
      loadAvailablePosts();
    }
  }, [activeTab]);

  const loadSeriesPosts = async () => {
    try {
      const posts = await seriesService.getSeriesPosts(series.id);
      setSeriesPosts(posts);
      
      // Calculate suggested order for next post
      if (posts.length > 0) {
        const maxOrder = Math.max(...posts.map(p => p.series_order || 0));
        setSuggestedOrder(maxOrder + 1);
      } else {
        setSuggestedOrder(1);
      }
    } catch (err) {
      console.error('Failed to load series posts:', err);
    }
  };

  const loadAvailablePosts = async () => {
    try {
      const allPosts = await postService.getAllPosts();
      const postsArray = Array.isArray(allPosts) ? allPosts : (allPosts as any).results || [];
      
      // Filter out posts already in this series
      const available = postsArray.filter(
        (post: Post) => !seriesPosts.some(sp => sp.id === post.id)
      );
      setAvailablePosts(available);
    } catch (err) {
      console.error('Failed to load available posts:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await seriesService.updateSeries(series.id, formData);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update series:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update series');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (post?: Post) => {
    // If post is provided (from modal list), use it directly
    const postId = post?.id || selectedPostId;
    
    if (!postId) {
      alert('Please select a post');
      return;
    }

    try {
      await seriesService.addPostToSeries(series.id, {
        post_id: postId,
        series_order: post ? suggestedOrder : suggestedOrder,
      });
      await loadSeriesPosts();
      await loadAvailablePosts();
      setShowAddPostModal(false);
      setSelectedPostId('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add post to series');
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!window.confirm('Remove this post from the series?')) {
      return;
    }

    try {
      await seriesService.removePostFromSeries(series.id, { post_id: postId });
      await loadSeriesPosts();
      await loadAvailablePosts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove post');
    }
  };

  const handleMovePost = async (postId: string, direction: 'up' | 'down') => {
    const index = seriesPosts.findIndex(p => p.id === postId);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === seriesPosts.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrder = [...seriesPosts];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, removed);

    // Update series_order for all posts
    const orderUpdates = newOrder.map((post, idx) => ({
      post_id: post.id,
      order: idx + 1,
    }));

    try {
      await seriesService.reorderSeriesPosts(series.id, { post_orders: orderUpdates });
      await loadSeriesPosts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reorder posts');
    }
  };

  return (
    <div className="series-edit-container">
      {/* Header */}
      <div className="series-edit-header">
        <h2>
          <FolderIcon size={24} className="icon" />
          Edit: {series.title}
        </h2>
        <button 
          className="close-btn" 
          onClick={onCancel} 
          disabled={loading}
          type="button"
          aria-label="Close"
        >
          <XIcon size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="series-edit-tabs">
        <button
          className={`series-edit-tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
          type="button"
        >
          Series Details
        </button>
        <button
          className={`series-edit-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          type="button"
        >
          Posts ({seriesPosts.length})
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="series-edit-error">
          <AlertCircleIcon size={20} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <form onSubmit={handleSubmit} className="series-edit-form">
          {/* Basic Information Section */}
          <div className="series-edit-section">
            <h3 className="section-title">
              <FolderIcon size={16} className="icon" />
              Basic Information
            </h3>

            {/* Title */}
            <div className="series-edit-group">
              <label htmlFor="title">
                Series Title
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Foundations of Faith"
                required
                disabled={loading}
                className="series-edit-input"
              />
            </div>

            {/* Description */}
            <div className="series-edit-group">
              <label htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this series is about..."
                disabled={loading}
                className="series-edit-textarea"
              />
              <span className="series-edit-hint">
                Optional: Provide context and overview
              </span>
            </div>
          </div>

          {/* Visual Settings Section */}
          <div className="series-edit-section">
            <h3 className="section-title">
              <ImageIcon size={16} className="icon" />
              Visual Settings
            </h3>

            {/* Cover Image */}
            <div className="series-edit-group">
              <label htmlFor="cover_image">
                Cover Image URL
              </label>
              <input
                type="text"
                id="cover_image"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
                className="series-edit-input"
              />
              <span className="series-edit-hint">
                Optional: URL to an image (https only)
              </span>
            </div>
          </div>

          {/* Visibility Section */}
          <div className="series-edit-section">
            <h3 className="section-title">
              <EyeIcon size={16} className="icon" />
              Visibility Settings
            </h3>

            {/* Visibility */}
            <div className="series-edit-group">
              <label htmlFor="visibility">
                Who can view this series?
                <span className="required">*</span>
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                required
                disabled={loading}
                className="series-edit-select"
              >
                {SERIES_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="series-edit-hint">
                {formData.visibility === 'PUBLIC' && 'Anyone can discover and view this series'}
                {formData.visibility === 'MEMBERS_ONLY' && 'Only authenticated members can view'}
                {formData.visibility === 'HIDDEN' && 'Hidden from public discovery and listings'}
              </span>
            </div>
          </div>

          {/* Featured Settings Section */}
          <div className="series-edit-section">
            <h3 className="section-title">
              <StarIcon size={16} className="icon" />
              Featured Settings
            </h3>

            {/* Featured Checkbox */}
            <label className="series-edit-checkbox">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="series-edit-checkbox-content">
                <span className="series-edit-checkbox-label">Feature this series</span>
                <span className="series-edit-checkbox-hint">
                  Featured series appear prominently on the homepage
                </span>
              </div>
            </label>

            {/* Priority (only show if featured) */}
            {formData.is_featured && (
              <div className="series-edit-conditional">
                <div className="series-edit-group">
                  <label htmlFor="featured_priority">
                    Featured Priority
                  </label>
                  <div className="priority-compact-wrapper">
                    <input
                      type="number"
                      id="featured_priority"
                      name="featured_priority"
                      value={formData.featured_priority}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      disabled={loading}
                      className="priority-input"
                    />
                    <span className="priority-label">Higher numbers appear first</span>
                  </div>
                  <span className="series-edit-hint">
                    Set priority between 0-100
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="series-edit-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading || !formData.title?.trim()}
            >
              <SaveIcon size={18} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="series-posts-management">
          <div className="series-posts-header">
            <h3 className="section-title">
              <ListIcon size={16} className="icon" />
              Series Posts ({seriesPosts.length})
            </h3>
            <button
              type="button"
              className="btn-add-post"
              onClick={() => setShowAddPostModal(true)}
              disabled={loading}
            >
              <PlusIcon size={16} />
              <span>Add Post</span>
            </button>
          </div>

          {seriesPosts.length === 0 ? (
            <div className="series-posts-empty">
              <BookOpen size={32} className="empty-icon" />
              <p className="empty-title">No posts in this series yet</p>
              <p className="empty-hint">
                Click "Add Post" above to include posts in this series
              </p>
            </div>
          ) : (
            <div className="series-posts-list">
              {seriesPosts.map((post, index) => (
                <div key={post.id} className="series-post-item">
                  <div className="series-post-number">{index + 1}</div>
                  <div className="series-post-content">
                    <h4 className="series-post-title">{post.title}</h4>
                    <span className="series-post-author">
                      by {post.author_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="series-post-actions">
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn-move-up"
                        onClick={() => handleMovePost(post.id, 'up')}
                        disabled={loading}
                        title="Move up"
                        aria-label="Move post up"
                      >
                        <ChevronUpIcon size={16} />
                      </button>
                    )}
                    {index < seriesPosts.length - 1 && (
                      <button
                        type="button"
                        className="btn-move-down"
                        onClick={() => handleMovePost(post.id, 'down')}
                        disabled={loading}
                        title="Move down"
                        aria-label="Move post down"
                      >
                        <ChevronDownIcon size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-remove-post"
                      onClick={() => handleRemovePost(post.id)}
                      disabled={loading}
                      title="Remove from series"
                      aria-label="Remove post from series"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Post Modal */}
      {showAddPostModal && (
        <div className="series-modal-overlay" onClick={() => setShowAddPostModal(false)}>
          <div className="series-modal" onClick={(e) => e.stopPropagation()}>
            <div className="series-modal-header">
              <h3>
                <PlusIcon size={20} />
                Add Posts to Series
              </h3>
              <button
                className="btn-modal-close"
                onClick={() => setShowAddPostModal(false)}
                type="button"
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="series-modal-body">
              {availablePosts.length === 0 ? (
                <div className="modal-empty">
                  <BookOpen size={40} className="empty-icon" />
                  <p>No available posts to add</p>
                </div>
              ) : (
                <div className="available-posts-list">
                  {availablePosts.map((post) => (
                    <div key={post.id} className="available-post-item">
                      <div className="available-post-info">
                        <h4 className="available-post-title">{post.title}</h4>
                        <span className="available-post-author">
                          by {post.author_name || 'Unknown'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-add-to-series"
                        onClick={() => handleAddPost(post)}
                        disabled={loading}
                      >
                        <PlusIcon size={16} />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesEdit;
