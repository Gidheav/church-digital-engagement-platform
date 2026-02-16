/**
 * ContentCard Component - Enterprise Edition
 * 
 * Reusable, accessible card for all content types
 * Supports grid and list view modes
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';
import './ContentCard.css';

interface ContentCardProps {
  post: HomePost;
  variant?: 'default' | 'compact' | 'horizontal';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showViews?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  post,
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showViews = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTypeClass = (type: string) => {
    return `badge badge-${type.toLowerCase()}`;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      SERMON: 'Sermon',
      ANNOUNCEMENT: 'Announcement',
      ARTICLE: 'Article',
      DEVOTIONAL: 'Devotional',
      TESTIMONY: 'Testimony',
    };
    return labels[type] || type;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <article className={`content-card content-card-${variant}`}>
      <Link to={`/content/${post.id}`} className="card-link">
        {/* Thumbnail */}
        <div className="card-media">
          {post.featured_image ? (
            <img 
              src={post.featured_image} 
              alt={post.title}
              loading="lazy"
            />
          ) : (
            <div className={`card-media-placeholder ${post.post_type.toLowerCase()}`}>
              {post.post_type === 'SERMON' && (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
              {post.post_type === 'ARTICLE' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              )}
              {post.post_type === 'ANNOUNCEMENT' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              )}
              {post.post_type === 'DEVOTIONAL' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              )}
            </div>
          )}
          
          {/* Play indicator for sermons */}
          {post.post_type === 'SERMON' && post.featured_image && (
            <div className="card-play-indicator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card-body">
          <div className="card-meta">
            <span className={getTypeClass(post.post_type)}>
              {getTypeLabel(post.post_type)}
            </span>
            <span className="card-date">{formatDate(post.published_at)}</span>
          </div>

          <h3 className="card-title">{post.title}</h3>

          {showExcerpt && post.excerpt && (
            <p className="card-excerpt">{post.excerpt}</p>
          )}

          <div className="card-footer">
            {showAuthor && (
              <div className="card-author">
                <span className="author-avatar-sm">
                  {post.author.first_name.charAt(0)}
                </span>
                <span className="author-name-sm">
                  {post.author.first_name} {post.author.last_name}
                </span>
              </div>
            )}
            
            {showViews && post.views_count > 0 && (
              <span className="card-views">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {formatViews(post.views_count)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="card-actions">
        <button className="card-action-btn" aria-label="Save">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
        <button className="card-action-btn" aria-label="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    </article>
  );
};

export default ContentCard;
