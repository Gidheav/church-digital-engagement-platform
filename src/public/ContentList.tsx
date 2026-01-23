/**
 * ContentList Component
 * Public page displaying all published content
 * Accessible to all users (no authentication required)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import contentService, { PublicPostListItem } from '../services/content.service';
import './ContentList.css';

const ContentList: React.FC = () => {
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const filters: any = {};
      if (filterType) filters.type = filterType;

      const data = await contentService.getAllPosts(filters);
      setPosts(data);
    } catch (err: any) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SERMON':
        return '#87CEEB';
      case 'ANNOUNCEMENT':
        return '#FFB347';
      case 'ARTICLE':
        return '#90EE90';
      default:
        return '#87CEEB';
    }
  };

  if (loading) {
    return (
      <div className="content-list-page">
        <Header />
        <div className="content-list-container">
          <div className="loading">Loading content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-list-page">
      <Header />
      <div className="content-list-container">
      <div className="content-list-header">
        <h1>Church Content</h1>
        <p className="subtitle">Sermons, articles, and announcements from our church</p>
      </div>

      <div className="content-filters">
        <button
          className={`filter-btn ${filterType === '' ? 'active' : ''}`}
          onClick={() => setFilterType('')}
        >
          All Content
        </button>
        <button
          className={`filter-btn ${filterType === 'SERMON' ? 'active' : ''}`}
          onClick={() => setFilterType('SERMON')}
        >
          Sermons
        </button>
        <button
          className={`filter-btn ${filterType === 'ARTICLE' ? 'active' : ''}`}
          onClick={() => setFilterType('ARTICLE')}
        >
          Articles
        </button>
        <button
          className={`filter-btn ${filterType === 'ANNOUNCEMENT' ? 'active' : ''}`}
          onClick={() => setFilterType('ANNOUNCEMENT')}
        >
          Announcements
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {posts.length === 0 ? (
        <div className="no-content">
          <p>No content available at this time.</p>
        </div>
      ) : (
        <div className="content-grid">
          {posts.map((post) => (
            <Link to={`/content/${post.id}`} key={post.id} className="content-card">
              <div className="content-card-header">
                <span
                  className="content-type-badge"
                  style={{ backgroundColor: getTypeColor(post.post_type) }}
                >
                  {post.post_type}
                </span>
                <span className="content-views">{post.views_count} views</span>
              </div>
              <h2 className="content-title">{post.title}</h2>
              <div className="content-meta">
                <span className="content-author">By {post.author_name}</span>
                <span className="content-date">{formatDate(post.published_at)}</span>
              </div>
              <div className="content-stats">
                <span>{post.comments_count} comments</span>
                <span>{post.reactions_count} reactions</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ContentList;
