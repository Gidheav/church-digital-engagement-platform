/**
 * SeriesList Component
 * Public view of all available series
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import seriesService from '../services/series.service';
import { Series } from '../types/series.types';
import './styles/SeriesList.css';

const SeriesList: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    loadSeries();
  }, [filter]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const data = filter === 'featured'
        ? await seriesService.getFeaturedSeries()
        : await seriesService.getPublicSeries();
      setSeries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load series:', err);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesClick = (slug: string) => {
    navigate(`/series/${slug}`);
  };

  if (loading) {
    return (
      <div className="series-list-container">
        <div className="loading-spinner">Loading series...</div>
      </div>
    );
  }

  return (
    <div className="series-list-container">
      <div className="series-list-header">
        <h1>Content Series</h1>
        <p className="series-list-subtitle">
          Explore organized collections of related content
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="series-filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Series
        </button>
        <button
          className={`filter-tab ${filter === 'featured' ? 'active' : ''}`}
          onClick={() => setFilter('featured')}
        >
          Featured
        </button>
      </div>

      {series.length === 0 ? (
        <div className="empty-series-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No Series Found</h3>
          <p>
            {filter === 'featured'
              ? 'No featured series are currently available.'
              : 'No series are currently available.'}
          </p>
        </div>
      ) : (
        <div className="series-grid">
          {series.map((item) => (
            <div
              key={item.id}
              className="series-card"
              onClick={() => handleSeriesClick(item.slug)}
            >
              {item.cover_image && (
                <div
                  className="series-card-image"
                  style={{ backgroundImage: `url(${item.cover_image})` }}
                />
              )}
              <div className="series-card-content">
                {item.is_featured && (
                  <span className="series-featured-badge">⭐ Featured</span>
                )}
                <h3 className="series-card-title">{item.title}</h3>
                {item.description && (
                  <p className="series-card-description">
                    {item.description.length > 120
                      ? item.description.substring(0, 120) + '...'
                      : item.description}
                  </p>
                )}
                <div className="series-card-meta">
                  <span className="series-post-count">
                    {item.post_count || 0} {item.post_count === 1 ? 'post' : 'posts'}
                  </span>
                  <span className="series-author">by {item.author_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesList;
