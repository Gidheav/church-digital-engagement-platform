/**
 * ContentCard - Premium Content Display Component
 * Enterprise-grade card design for posts and articles
 */
import React from 'react';
import { HomePost } from '../services/home.service';
import homeService from '../services/home.service';
import './ContentCard.css';

interface ContentCardProps {
  post: HomePost;
  size?: 'small' | 'medium' | 'large' | 'featured';
  showAuthor?: boolean;
  showDate?: boolean;
  showStats?: boolean;
  showType?: boolean;
  onClick?: (post: HomePost) => void;
  className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({
  post,
  size = 'medium',
  showAuthor = true,
  showDate = true,
  showStats = true,
  showType = true,
  onClick,
  className = ''
}) => {
  const typeColor = homeService.getTypeColor(post.post_type);
  const typeIcon = homeService.getTypeIcon(post.post_type);
  const hasVideo = homeService.hasVideo(post);
  const hasAudio = homeService.hasAudio(post);
  
  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const cardClasses = `
    content-card 
    content-card--${size} 
    ${onClick ? 'content-card--clickable' : ''}
    ${post.is_featured ? 'content-card--featured' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <article className={cardClasses} onClick={handleClick}>
      {/* Featured Badge */}
      {post.is_featured && size === 'featured' && (
        <div className="content-card__featured-badge">
          <span className="featured-badge__icon">⭐</span>
          <span className="featured-badge__text">Featured</span>
        </div>
      )}

      {/* Media Container */}
      {post.featured_image && (
        <div className="content-card__media">
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="content-card__image"
            loading="lazy"
          />
          
          {/* Media Type Indicators */}
          <div className="content-card__media-indicators">
            {hasVideo && (
              <div className="media-indicator media-indicator--video">
                <span className="media-indicator__icon">▶️</span>
              </div>
            )}
            {hasAudio && (
              <div className="media-indicator media-indicator--audio">
                <span className="media-indicator__icon">🎧</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="content-card__body">
        {/* Type Badge */}
        {showType && (
          <div className="content-card__type">
            <span 
              className="type-badge"
              style={{
                backgroundColor: `${typeColor}15`,
                border: `1px solid ${typeColor}30`,
                color: typeColor
              }}
            >
              <span className="type-badge__icon">{typeIcon}</span>
              <span className="type-badge__text">{post.content_type_name}</span>
            </span>
          </div>
        )}

        {/* Series Info */}
        {post.series_title && (
          <div className="content-card__series">
            <span className="series-badge">
              📚 {post.series_title}
              {post.series_order > 0 && (
                <span className="series-badge__order">#{post.series_order}</span>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="content-card__title">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="content-card__excerpt">
          {post.excerpt}
        </p>

        {/* Metadata */}
        <div className="content-card__meta">
          {/* Author */}
          {showAuthor && (
            <div className="content-card__author">
              {post.author.profile_picture && (
                <img 
                  src={post.author.profile_picture} 
                  alt={`${post.author.first_name} ${post.author.last_name}`}
                  className="author-avatar author-avatar--small"
                />
              )}
              <span className="author-name">
                {post.author.first_name} {post.author.last_name}
              </span>
            </div>
          )}

          {/* Date */}
          {showDate && (
            <div className="content-card__date">
              <span className="date-icon">📅</span>
              <time dateTime={post.published_at}>
                {homeService.formatDate(post.published_at)}
              </time>
            </div>
          )}
        </div>

        {/* Stats */}
        {showStats && (post.views_count > 0 || post.reactions_count > 0 || post.comments_count > 0) && (
          <div className="content-card__stats">
            {post.views_count > 0 && (
              <span className="stat">
                <span className="stat__icon">👁️</span>
                <span className="stat__value">{homeService.formatViews(post.views_count)}</span>
              </span>
            )}
            {post.reactions_count > 0 && (
              <span className="stat">
                <span className="stat__icon">❤️</span>
                <span className="stat__value">{post.reactions_count}</span>
              </span>
            )}
            {post.comments_count > 0 && (
              <span className="stat">
                <span className="stat__icon">💬</span>
                <span className="stat__value">{post.comments_count}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ContentCard;