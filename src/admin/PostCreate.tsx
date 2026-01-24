/**
 * PostCreate Component - Enterprise Edition
 * Professional form to create new posts with dynamic content types
 */

import React, { useState, useEffect } from 'react';
import postService, { PostCreateData } from '../services/post.service';
import contentTypeService, { ContentType } from '../services/contentType.service';
import RichTextEditor from '../components/RichTextEditor';
import { 
  XIcon, 
  TypeIcon, 
  ImageIcon, 
  VideoIcon, 
  MusicIcon, 
  MessageSquareIcon,
  HeartIcon,
  SendIcon,
  SaveIcon,
  AlertCircleIcon
} from './components/Icons';
import './styles/PostForm.pro.css';

interface PostCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ onSuccess, onCancel }) => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [formData, setFormData] = useState<PostCreateData>({
    title: '',
    content: '',
    content_type: '',
    status: 'DRAFT',
    comments_enabled: true,
    reactions_enabled: true,
    featured_image: '',
    video_url: '',
    audio_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const types = await contentTypeService.getEnabled();
        setContentTypes(types);
        if (types.length > 0 && !formData.content_type) {
          setFormData(prev => ({ ...prev, content_type: types[0].id }));
        }
      } catch (err) {
        console.error('Failed to load content types:', err);
      } finally {
        setLoadingTypes(false);
      }
    };
    loadContentTypes();
  }, []);

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
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!formData.content_type) {
      setError('Please select a content type');
      return;
    }

    if (formData.status === 'PUBLISHED') {
      formData.published_at = new Date().toISOString();
    }

    setLoading(true);
    setError('');

    try {
      await postService.createPost(formData);
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create post';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container-pro">
      {/* Header */}
      <div className="post-form-header-pro">
        <div className="header-content">
          <div className="header-text">
            <h2 className="header-title">Create New Post</h2>
            <p className="header-subtitle">Add new content to your platform</p>
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
                    {type.name}
                  </option>
                ))}
              </select>
              {!loadingTypes && contentTypes.length === 0 && (
                <small className="form-hint-error-pro">
                  No content types are enabled. Contact an administrator.
                </small>
              )}
            </div>
          </div>

          <div className="form-group-pro">
            <label htmlFor="content" className="form-label-pro">
              Content <span className="required-star">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
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
                  <span className="checkbox-hint">Enable users to leave comments on this post</span>
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
                  <span className="checkbox-hint">Enable users to react to this post</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="form-section-pro">
          <h3 className="section-title-pro">
            <SendIcon className="section-icon" />
            Publishing Options
          </h3>
          
          <div className="form-group-pro">
            <label htmlFor="status" className="form-label-pro">
              Publication Status <span className="required-star">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-select-pro"
            >
              <option value="DRAFT">Save as Draft</option>
              <option value="PUBLISHED">Publish Immediately</option>
            </select>
            <small className="form-hint-pro">
              Drafts are only visible to moderators and admins. Published posts are visible to all users.
            </small>
          </div>
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
                Creating...
              </>
            ) : (
              <>
                <SaveIcon />
                Create Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreate;
