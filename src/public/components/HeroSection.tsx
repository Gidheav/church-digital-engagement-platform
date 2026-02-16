/**
 * HeroSection Component - Enterprise Edition
 * 
 * Large, impactful hero with featured content
 * Supports video, image, and gradient backgrounds
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';
import './HeroSection.css';

interface HeroSectionProps {
  featured: HomePost | null;
  announcements?: HomePost[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ featured, announcements = [] }) => {
  if (!featured) {
    return (
      <section className="hero-section hero-empty">
        <div className="hero-container">
          <div className="hero-content-centered">
            <h1 className="hero-title-large">Welcome to Our Church</h1>
            <p className="hero-subtitle">
              A community of faith, hope, and love. Join us on our journey.
            </p>
            <div className="hero-actions">
              <Link to="/content?type=SERMON" className="btn btn-primary btn-lg">
                Watch Sermons
              </Link>
              <Link to="/about" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-grid">
          {/* Main Featured Content */}
          <div className="hero-main">
            <Link to={`/content/${featured.id}`} className="hero-card">
              <div className="hero-card-media">
                {featured.featured_image ? (
                  <img 
                    src={featured.featured_image} 
                    alt={featured.title}
                    loading="eager"
                  />
                ) : (
                  <div className="hero-card-gradient" />
                )}
                <div className="hero-card-overlay" />
                
                {/* Play button for sermons */}
                {featured.post_type === 'SERMON' && (
                  <div className="hero-play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="hero-card-content">
                <div className="hero-card-meta">
                  <span className={getTypeClass(featured.post_type)}>
                    {getTypeLabel(featured.post_type)}
                  </span>
                  <span className="hero-card-date">
                    {formatDate(featured.published_at)}
                  </span>
                </div>
                
                <h1 className="hero-card-title">{featured.title}</h1>
                
                <p className="hero-card-excerpt">{featured.excerpt}</p>
                
                <div className="hero-card-author">
                  <div className="author-avatar">
                    {featured.author.first_name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <span className="author-name">
                      {featured.author.first_name} {featured.author.last_name}
                    </span>
                    <span className="author-views">
                      {featured.views_count.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Featured Items */}
          {announcements.length > 0 && (
            <div className="hero-secondary">
              {announcements.slice(0, 2).map((item) => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}`}
                  className="hero-secondary-card"
                >
                  <div className="secondary-card-media">
                    {item.featured_image ? (
                      <img src={item.featured_image} alt={item.title} loading="lazy" />
                    ) : (
                      <div className="secondary-card-gradient" />
                    )}
                    <div className="secondary-card-overlay" />
                  </div>
                  
                  <div className="secondary-card-content">
                    <span className={getTypeClass(item.post_type)}>
                      {getTypeLabel(item.post_type)}
                    </span>
                    <h3 className="secondary-card-title">{item.title}</h3>
                    <span className="secondary-card-date">
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
