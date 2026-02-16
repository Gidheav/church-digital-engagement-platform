/**
 * SeriesDetail Component
 * Displays a single series with all its posts in order
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import seriesService, { SeriesDetail as SeriesDetailType } from '../services/series.service';
import './styles/SeriesDetail.css';

const SeriesDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<SeriesDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadSeries();
    }
  }, [slug]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const data = await seriesService.getPublicSeriesBySlug(slug!);
      setSeries(data);
    } catch (err: any) {
      console.error('Failed to load series:', err);
      if (err.response?.status === 404) {
        setError('Series not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this series');
      } else {
        setError('Failed to load series');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/content/${postId}`);
  };

  if (loading) {
    return (
      <div className="series-detail-container">
        <div className="loading-spinner">Loading series...</div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="series-detail-container">
        <div className="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>{error || 'Series not found'}</h3>
          <button onClick={() => navigate('/series')} className="btn-primary">
            View All Series
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="series-detail-container">
      {/* Series Header */}
      <div className="series-header">
        <button onClick={() => navigate('/series')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Series
        </button>

        {series.cover_image && (
          <div
            className="series-header-image"
            style={{ backgroundImage: `url(${series.cover_image})` }}
          />
        )}

        <div className="series-header-content">
          {series.is_featured && (
            <span className="series-featured-badge">⭐ Featured Series</span>
          )}
          <h1 className="series-title">{series.title}</h1>
          {series.description && (
            <p className="series-description">{series.description}</p>
          )}
          <div className="series-meta">
            <span className="series-author">by {series.author.full_name}</span>
            <span className="series-post-count">
              {series.post_count} {series.post_count === 1 ? 'post' : 'posts'}
            </span>
            <span className="series-views">
              {series.total_views || 0} views
            </span>
          </div>
        </div>
      </div>

      {/* Series Posts */}
      <div className="series-posts">
        <h2 className="series-posts-title">Posts in This Series</h2>
        
        {series.posts && series.posts.length > 0 ? (
          <div className="series-posts-list">
            {series.posts.map((post) => (
              <div
                key={post.id}
                className="series-post-card"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="post-card-number">
                  Part {post.series_order}
                </div>
                <div className="post-card-content">
                  <h3 className="post-card-title">{post.title}</h3>
                  <div className="post-card-meta">
                    <span className="post-type">{post.content_type_name || 'Post'}</span>
                    {post.published_at && (
                      <span className="post-date">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="post-card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-posts-state">
            <p>No posts have been added to this series yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
