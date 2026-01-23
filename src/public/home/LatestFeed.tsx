/**
 * LatestFeed Component
 * Mixed content chronological feed
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';

interface LatestFeedProps {
  posts: HomePost[];
}

const LatestFeed: React.FC<LatestFeedProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeBadgeClass = (type: string) => {
    const classes: { [key: string]: string } = {
      SERMON: 'badge-sermon',
      ANNOUNCEMENT: 'badge-announcement',
      ARTICLE: 'badge-article',
      DEVOTIONAL: 'badge-devotional'
    };
    return classes[type] || 'badge-default';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      SERMON: 'Sermon',
      ANNOUNCEMENT: 'Announcement',
      ARTICLE: 'Article',
      DEVOTIONAL: 'Devotional'
    };
    return labels[type] || type;
  };

  return (
    <section className="latest-feed">
      <div className="section-container">
        <h2 className="section-title">More from the Church</h2>
        <div className="feed-list">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/content/${post.id}`}
              className="feed-item"
            >
              <div className="feed-header">
                <span className={`feed-badge ${getTypeBadgeClass(post.type)}`}>
                  {getTypeLabel(post.type)}
                </span>
                <span className="feed-date">{formatDate(post.published_at)}</span>
              </div>
              <h3 className="feed-title">{post.title}</h3>
              <p className="feed-author">
                By {post.author.first_name} {post.author.last_name}
              </p>
              <p className="feed-excerpt">{post.excerpt}</p>
            </Link>
          ))}
        </div>
        <div className="feed-actions">
          <Link to="/content" className="btn-view-more">
            View All Content
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestFeed;
