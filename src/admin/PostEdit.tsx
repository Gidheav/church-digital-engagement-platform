/**
 * PostEdit Component - Enterprise Edition
 * Professional form to edit existing posts with dynamic content types
 */

import React, { useState, useEffect } from 'react';
import postService, { PostUpdateData } from '../services/post.service';
import contentTypeService, { ContentType } from '../services/contentType.service';
import { useConfirm } from '../contexts/ConfirmContext';
import RichTextEditor from '../components/RichTextEditor';
import { 
  XIcon, 
  FileTextIcon, 
  TypeIcon, 
  ImageIcon, 
  VideoIcon, 
  MusicIcon, 
  MessageSquareIcon,
  HeartIcon,
  SendIcon,
  SaveIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EyeOffIcon,
  Loader2Icon
} from './components/Icons';
import './styles/PostForm.pro.css';

interface PostEditProps {
  postId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PostEdit: React.FC<PostEditProps> = ({ postId, onSuccess, onCancel }) => {
  const { confirm } = useConfirm();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [formData, setFormData] = useState<PostUpdateData>({
    title: '',
    content: '',
    content_type: '',
    comments_enabled: true,
    reactions_enabled: true,
    featured_image: '',
    video_url: '',
    audio_url: '',
  });
  const [currentStatus, setCurrentStatus] = useState<string>('DRAFT');
  const [currentPublishedAt, setCurrentPublishedAt] = useState<string | null>(null);
  const [currentContentTypeName, setCurrentContentTypeName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContentTypes();
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadContentTypes = async () => {
    try {
      const types = await contentTypeService.getAll();
      setContentTypes(types.filter(t => t.is_enabled || t.is_system));
    } catch (err) {
      console.error('Failed to load content types:', err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadPost = async () => {
    try {
      setLoadingPost(true);
      const post = await postService.getPost(postId);
      setFormData({
        title: post.title,
        content: post.content,
        content_type: post.content_type || '',
        comments_enabled: post.comments_enabled,
        reactions_enabled: post.reactions_enabled,
        featured_image: post.featured_image || '',
        video_url: post.video_url || '',
        audio_url: post.audio_url || '',
      });
      setCurrentStatus(post.status);
      setCurrentPublishedAt(post.published_at);
      setCurrentContentTypeName(post.content_type_name);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle rich text editor content change
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // Handle image upload for the rich text editor
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // TODO: Implement actual image upload to your backend
      // For now, return a placeholder or convert to base64
      
      // Example implementation (replace with actual API call):
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await axios.post('/api/v1/upload/image', formData);
      // return response.data.url;

      // Temporary base64 conversion (not recommended for production)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await postService.updatePost(postId, formData);
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update post';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    confirm({
      title: 'Publish Post',
      message: 'Publish this post immediately? It will become visible to all users.',
      confirmLabel: 'Publish Now',
      cancelLabel: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        setLoading(true);
        setError('');
        try {
          await postService.publishPost(postId);
          onSuccess();
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to publish post');
          setLoading(false);
        }
      },
    });
  };

  const handleUnpublish = () => {
    confirm({
      title: 'Unpublish Post',
      message: 'Unpublish this post? It will be reverted to draft and hidden from users.',
      confirmLabel: 'Unpublish',
      cancelLabel: 'Cancel',
      variant: 'neutral',
      onConfirm: async () => {
        setLoading(true);
        setError('');
        try {
          await postService.unpublishPost(postId);
          onSuccess();
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to unpublish post');
          setLoading(false);
        }
      },
    });
  };

  if (loadingPost) {
    return (
      <div className="post-form-loading-pro">
        <Loader2Icon className="spinning" />
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="post-form-container-pro">
      {/* Header */}
      <div className="post-form-header-pro">
        <div className="header-content">
          <FileTextIcon className="header-icon" />
          <div className="header-text">
            <h2 className="header-title">Edit Post</h2>
            <p className="header-subtitle">Update the details of your content post</p>
          </div>
        </div>
        <button 
          className="btn-icon-pro" 
          onClick={onCancel} 
          disabled={loading}
          aria-label="Close"
        >
          <XIcon />
        </button>
      </div>

      {/* Status Banner */}
      <div className={`status-banner-pro status-banner-${currentStatus.toLowerCase()}`}>
        {currentStatus === 'PUBLISHED' ? (
          <>
            <CheckCircleIcon className="status-icon" />
            <div className="status-content">
              <span className="status-label">Published</span>
              {currentPublishedAt && (
                <span className="status-date">
                  {new Date(currentPublishedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <EyeOffIcon className="status-icon" />
            <div className="status-content">
              <span className="status-label">Draft</span>
              <span className="status-date">Not published yet</span>
            </div>
          </>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-error-pro">
          <AlertCircleIcon className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="post-form-pro">
        {/* Basic Information Section */}
        <div className="form-section-pro">
          <h3 className="section-title-pro">
            <TypeIcon className="section-icon" />
            Basic Information
          </h3>
          
          <div className="form-row-pro">
            <div className="form-group-pro">
              <label htmlFor="title" className="form-label-pro">
                Post Title <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a compelling title"
                disabled={loading}
                className="form-input-pro"
              />
            </div>

            <div className="form-group-pro">
              <label htmlFor="content_type" className="form-label-pro">
                Content Type <span className="required-star">*</span>
              </label>
              <select
                id="content_type"
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                required
                disabled={loading || loadingTypes}
                className="form-select-pro"
              >
                {loadingTypes && <option value="">Loading types...</option>}
                {!loadingTypes && contentTypes.length === 0 && <option value="">No types available</option>}
                {contentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {!type.is_enabled && '(Disabled)'}
                  </option>
                ))}
              </select>
              {currentContentTypeName && (
                <small className="form-hint-pro">
                  Current: {currentContentTypeName}
                </small>
              )}
            </div>
          </div>

          <div className="form-group-pro">
            <label htmlFor="content" className="form-label-pro">
              Content <span className="required-star">*</span>
            </label>
            <RichTextEditor
              value={formData.content || ''}
              onChange={handleContentChange}
              placeholder="Write your content here..."
              disabled={loading}
              minHeight={450}
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>

        {/* Media Section */}
        <div className="form-section-pro">
          <h3 className="section-title-pro">
            <ImageIcon className="section-icon" />
            Media & Resources
          </h3>
          
          <div className="form-group-pro">
            <label htmlFor="featured_image" className="form-label-pro">
              <ImageIcon className="label-icon" />
              Featured Image URL
            </label>
            <input
              type="url"
              id="featured_image"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
              className="form-input-pro"
            />
          </div>

          <div className="form-row-pro">
            <div className="form-group-pro">
              <label htmlFor="video_url" className="form-label-pro">
                <VideoIcon className="label-icon" />
                Video URL
              </label>
              <input
                type="url"
                id="video_url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                disabled={loading}
                className="form-input-pro"
              />
            </div>

            <div className="form-group-pro">
              <label htmlFor="audio_url" className="form-label-pro">
                <MusicIcon className="label-icon" />
                Audio URL
              </label>
              <input
                type="url"
                id="audio_url"
                name="audio_url"
                value={formData.audio_url}
                onChange={handleChange}
                placeholder="https://example.com/audio.mp3"
                disabled={loading}
                className="form-input-pro"
              />
            </div>
          </div>
        </div>

        {/* Engagement Settings */}
        <div className="form-section-pro">
          <h3 className="section-title-pro">
            <HeartIcon className="section-icon" />
            Engagement Settings
          </h3>
          
          <div className="form-checkboxes-pro">
            <label className="checkbox-label-pro">
              <input
                type="checkbox"
                name="comments_enabled"
                checked={formData.comments_enabled}
                onChange={handleChange}
                disabled={loading}
                className="checkbox-input-pro"
              />
              <div className="checkbox-content">
                <MessageSquareIcon className="checkbox-icon" />
                <div className="checkbox-text">
                  <span className="checkbox-title">Allow Comments</span>
                  <span className="checkbox-hint">Existing comments remain visible, but new ones are blocked when disabled</span>
                </div>
              </div>
            </label>

            <label className="checkbox-label-pro">
              <input
                type="checkbox"
                name="reactions_enabled"
                checked={formData.reactions_enabled}
                onChange={handleChange}
                disabled={loading}
                className="checkbox-input-pro"
              />
              <div className="checkbox-content">
                <HeartIcon className="checkbox-icon" />
                <div className="checkbox-text">
                  <span className="checkbox-title">Allow Reactions</span>
                  <span className="checkbox-hint">Existing reactions remain visible, but new ones are blocked when disabled</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Publishing Actions */}
        <div className="form-section-pro">
          <h3 className="section-title-pro">
            <SendIcon className="section-icon" />
            Publishing Status
          </h3>
          
          {currentStatus === 'DRAFT' && (
            <div className="publishing-actions-pro">
              <p className="publishing-hint-pro">
                This post is currently a draft. Publish it to make it visible to all users.
              </p>
              <button
                type="button"
                className="btn-publish-pro"
                onClick={handlePublish}
                disabled={loading}
              >
                <SendIcon />
                Publish Now
              </button>
            </div>
          )}
          
          {currentStatus === 'PUBLISHED' && (
            <div className="publishing-actions-pro">
              <p className="publishing-hint-success-pro">
                <CheckCircleIcon className="hint-icon" />
                This post is currently published and visible to all users.
              </p>
              <button
                type="button"
                className="btn-unpublish-pro"
                onClick={handleUnpublish}
                disabled={loading}
              >
                <EyeOffIcon />
                Unpublish
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions-pro">
          <button
            type="button"
            className="btn-secondary-pro"
            onClick={onCancel}
            disabled={loading}
          >
            <XIcon />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary-pro"
            disabled={loading}
          >
            {loading ? (
              <>
                <SaveIcon className="spinning" />
                Updating...
              </>
            ) : (
              <>
                <SaveIcon />
                Update Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEdit;
