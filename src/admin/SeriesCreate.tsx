/**
 * SeriesCreate Component - Enterprise Edition
 * Professional form to create new series
 */

import React, { useState } from 'react';
import seriesService from '../services/series.service';
import { SeriesCreateData, SERIES_VISIBILITY_OPTIONS } from '../types/series.types';
import {
  XIcon,
  SaveIcon,
  FolderIcon,
  AlertCircleIcon,
  ImageIcon,
  EyeIcon,
  StarIcon,
} from './components/Icons';
import './styles/SeriesCreate.pro.css';

interface SeriesCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SeriesCreate: React.FC<SeriesCreateProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<SeriesCreateData>({
    title: '',
    description: '',
    cover_image: '',
    visibility: 'PUBLIC',
    is_featured: false,
    featured_priority: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    
    if (!formData.title.trim()) {
      setError('Series title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await seriesService.createSeries(formData);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to create series:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="series-create-container">
      {/* Header */}
      <div className="series-create-header">
        <h2>
          <FolderIcon size={24} className="icon" />
          Create New Series
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

      {/* Error Alert */}
      {error && (
        <div className="series-error-alert">
          <AlertCircleIcon size={20} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="series-create-form">
        {/* Basic Information Section */}
        <div className="series-form-section">
          <h3 className="section-title">
            <FolderIcon size={16} className="icon" />
            Basic Information
          </h3>

          {/* Title */}
          <div className="series-form-group">
            <label htmlFor="title">
              Series Title
              <span className="required-indicator">*</span>
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
              className="series-form-input"
            />
            <span className="series-form-hint">
              A descriptive name for this series
            </span>
          </div>

          {/* Description */}
          <div className="series-form-group">
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
              className="series-form-textarea"
            />
            <span className="series-form-hint">
              Optional: Provide context and overview of the series
            </span>
          </div>
        </div>

        {/* Visual Settings Section */}
        <div className="series-form-section">
          <h3 className="section-title">
            <ImageIcon size={16} className="icon" />
            Visual Settings
          </h3>

          {/* Cover Image */}
          <div className="series-form-group">
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
              className="series-form-input"
            />
            <span className="series-form-hint">
              Optional: URL to an image (https only)
            </span>
          </div>
        </div>

        {/* Visibility Section */}
        <div className="series-form-section">
          <h3 className="section-title">
            <EyeIcon size={16} className="icon" />
            Visibility Settings
          </h3>

          {/* Visibility */}
          <div className="series-form-group">
            <label htmlFor="visibility">
              Who can view this series?
              <span className="required-indicator">*</span>
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              required
              disabled={loading}
              className="series-form-select"
            >
              {SERIES_VISIBILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="series-form-hint">
              {formData.visibility === 'PUBLIC' && 'Anyone can discover and view this series'}
              {formData.visibility === 'MEMBERS_ONLY' && 'Only authenticated members can view'}
              {formData.visibility === 'HIDDEN' && 'Hidden from public discovery and listings'}
            </span>
          </div>
        </div>

        {/* Featured Settings Section */}
        <div className="series-form-section">
          <h3 className="section-title">
            <StarIcon size={16} className="icon" />
            Featured Settings
          </h3>

          {/* Featured Checkbox */}
          <label className="series-checkbox-wrapper">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="series-checkbox-content">
              <span className="series-checkbox-label">Feature this series</span>
              <span className="series-checkbox-hint">
                Featured series appear prominently on the homepage
              </span>
            </div>
          </label>

          {/* Priority (only show if featured) */}
          {formData.is_featured && (
            <div className="series-conditional-section">
              <div className="series-form-group">
                <label htmlFor="featured_priority">
                  Featured Priority
                </label>
                <div className="priority-input-wrapper">
                  <input
                    type="number"
                    id="featured_priority"
                    name="featured_priority"
                    value={formData.featured_priority}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    disabled={loading}
                  />
                  <span className="priority-label">Higher numbers appear first</span>
                </div>
                <span className="series-form-hint">
                  Set priority between 0-100 (e.g., 1 is highest priority)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="series-form-actions">
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
            className="btn-create"
            disabled={loading || !formData.title.trim()}
          >
            <SaveIcon size={18} />
            <span>{loading ? 'Creating...' : 'Create Series'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SeriesCreate;
