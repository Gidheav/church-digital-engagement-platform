/**
 * HomePage - Premium Enterprise Edition
 * 
 * Complete redesign utilizing full database integration:
 * - Dynamic featured content with real data
 * - Rich content sections (sermons, series, articles)
 * - Interactive elements with view counts, reactions
 * - Professional design matching admin dashboard
 * - Responsive and accessible
 * 
 * Design: Enterprise-grade with modern UI patterns
 */

import React, { useEffect, useState } from 'react';
import homeService, { HomeContent } from '../services/home.service';

// Layout Components
import PublicNavigation from './components/PublicNavigation';
import PublicFooter from './components/PublicFooter';

// Styles
import '../styles/design-system.css';
import './components/PublicNavigation.css';
import './components/PublicFooter.css';
import './HomePage.css';

// Content categories for navigation
const contentCategories = [
  { id: 'all', label: 'All Content', icon: '📚' },
  { id: 'sermon', label: 'Sermons', icon: '🎙️' },
  { id: 'article', label: 'Articles', icon: '📝' },
  { id: 'announcement', label: 'Announcements', icon: '📢' },
  { id: 'devotional', label: 'Devotionals', icon: '🙏' },
];

// Scripture reflection quotes
const reflectionQuotes = [
  {
    text: '"For now we see only a reflection as in a mirror; then we shall see face to face."',
    attribution: '1 Corinthians 13:12'
  },
  {
    text: '"Trust in the Lord with all your heart and lean not on your own understanding."',
    attribution: 'Proverbs 3:5'
  },
  {
    text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you."',
    attribution: 'Jeremiah 29:11'
  }
];

// Generate random quote
const getRandomQuote = () => reflectionQuotes[Math.floor(Math.random() * reflectionQuotes.length)];

const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentQuote] = useState(() => getRandomQuote());

  useEffect(() => {
    loadHomeContent();
  }, []);

  const loadHomeContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await homeService.getHomeContent();
      setContent(data);
    } catch (err: any) {
      console.error('Error loading home content:', err);
      setError(err.response?.data?.detail || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatViews = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getContentIcon = (contentType: string): string => {
    const icons: { [key: string]: string } = {
      'sermon': '🎙️',
      'article': '📝',
      'announcement': '📢',
      'devotional': '🙏',
      'series': '📚'
    };
    return icons[contentType.toLowerCase()] || '📄';
  };

  // Loading State
  if (loading) {
    return (
      <div className="homepage-premium">
        <PublicNavigation />
        <main className="main-content">
          <PremiumLoadingState />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="homepage-premium">
        <PublicNavigation />
        <main className="main-content">
          <PremiumErrorState error={error} onRetry={loadHomeContent} />
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="homepage-premium">
      <PublicNavigation />

      <main className="main-content premium-layout">
        <div className="homepage-container">

          {/* HERO SECTION - Premium Featured Content */}
          <section className="hero-premium" aria-label="Featured content">
            {content?.featured ? (
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="hero-badge-icon">{getContentIcon(content.featured.content_type_name || '')}</span>
                  <span className="hero-badge-text">{content.featured.content_type_name || 'Featured'}</span>
                </div>
                
                <h1 className="hero-title">{content.featured.title}</h1>
                
                <p className="hero-excerpt">
                  {content.featured.excerpt || 'Discover meaningful content that enriches your faith journey.'}
                </p>
                
                <div className="hero-meta">
                  <div className="hero-author">
                    <div className="author-avatar">
                      {(content.featured.author?.first_name?.[0] || 'C').toUpperCase()}
                    </div>
                    <div className="author-info">
                      <span className="author-name">
                        {content.featured.author?.first_name} {content.featured.author?.last_name}
                      </span>
                      <span className="publish-date">{formatDate(content.featured.published_at)}</span>
                    </div>
                  </div>
                  
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👁️</span>
                      <span className="stat-value">{formatViews(content.featured.views_count || 0)}</span>
                    </div>
                    {content.featured.reactions_count > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-value">{content.featured.reactions_count}</span>
                      </div>
                    )}
                    {content.featured.comments_count > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">💬</span>
                        <span className="stat-value">{content.featured.comments_count}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {content.featured.featured_image && (
                  <div className="hero-image">
                    <img 
                      src={content.featured.featured_image} 
                      alt={content.featured.title}
                      loading="eager"
                    />
                    <div className="hero-image-overlay">
                      {content.featured.video_url && (
                        <button className="play-button" aria-label="Play video">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="hero-actions">
                  <button className="btn-hero-primary">
                    {content.featured.video_url ? 'Watch Now' : 'Read More'}
                    <span className="btn-arrow">→</span>
                  </button>
                  <button className="btn-hero-secondary">
                    <span className="btn-icon">🔗</span>
                    Share
                  </button>
                </div>
              </div>
            ) : (
              <div className="hero-placeholder">
                <h1 className="hero-title">Welcome to Our Digital Community</h1>
                <p className="hero-excerpt">Discover sermons, articles, and content that enriches your faith journey.</p>
              </div>
            )}
          </section>

          {/* CONTENT NAVIGATION - Premium Category Selector */}
          <section className="content-navigation premium-nav" aria-label="Content categories">
            <div className="nav-container">
              {contentCategories.map((category) => (
                <button 
                  key={category.id} 
                  className={`nav-item ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="nav-icon">{category.icon}</span>
                  <span className="nav-label">{category.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* LATEST SERMONS - Premium Grid */}
          {content?.sermons && content.sermons.length > 0 && (
            <section className="content-section sermons-section" aria-label="Latest sermons">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🎙️</span>
                  Latest Sermons
                </h2>
                <p className="section-subtitle">Messages to inspire and guide your faith journey</p>
              </div>
              
              <div className="premium-grid sermon-grid">
                {content.sermons.slice(0, 3).map((sermon) => (
                  <article key={sermon.id} className="content-card premium-card">
                    <div className="card-image">
                      {sermon.featured_image ? (
                        <>
                          <img src={sermon.featured_image} alt={sermon.title} loading="lazy" />
                          <div className="image-overlay">
                            {sermon.video_url && (
                              <button className="play-overlay" aria-label="Play sermon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="card-placeholder">
                          <span className="placeholder-icon">🎙️</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-content">
                      <div className="card-badge">
                        <span className="badge-text">Sermon</span>
                      </div>
                      
                      <h3 className="card-title">{sermon.title}</h3>
                      
                      {sermon.excerpt && (
                        <p className="card-excerpt">{sermon.excerpt.slice(0, 120)}...</p>
                      )}
                      
                      <div className="card-meta">
                        <div className="meta-author">
                          <div className="author-avatar">
                            {(sermon.author?.first_name?.[0] || 'C').toUpperCase()}
                          </div>
                          <span className="author-name">
                            {sermon.author?.first_name} {sermon.author?.last_name}
                          </span>
                        </div>
                        
                        <div className="meta-stats">
                          <span className="stat">
                            <span className="stat-icon">👁️</span>
                            {formatViews(sermon.views_count || 0)}
                          </span>
                          <span className="meta-divider">·</span>
                          <span className="stat">{formatDate(sermon.published_at)}</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="btn-card-primary">
                          {sermon.video_url ? 'Watch' : 'Read'}
                        </button>
                        <div className="card-reactions">
                          {sermon.reactions_count > 0 && (
                            <span className="reaction-count">
                              ❤️ {sermon.reactions_count}
                            </span>
                          )}
                          {sermon.comments_count > 0 && (
                            <span className="comment-count">
                              💬 {sermon.comments_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* FEATURED ARTICLES */}
          {content?.articles && content.articles.length > 0 && (
            <section className="content-section articles-section" aria-label="Featured articles">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📝</span>
                  From the Journal
                </h2>
                <p className="section-subtitle">Thoughtful reflections and insights for spiritual growth</p>
              </div>
              
              <div className="premium-grid article-grid">
                {content.articles.slice(0, 4).map((article) => (
                  <article key={article.id} className="content-card premium-card article-card">
                    {article.featured_image && (
                      <div className="card-image">
                        <img src={article.featured_image} alt={article.title} loading="lazy" />
                      </div>
                    )}
                    
                    <div className="card-content">
                      <div className="card-badge">
                        <span className="badge-text">Article</span>
                      </div>
                      
                      <h3 className="card-title">{article.title}</h3>
                      
                      <p className="card-excerpt">
                        {article.excerpt?.slice(0, 150)}...
                      </p>
                      
                      <div className="card-meta">
                        <div className="meta-author">
                          <div className="author-avatar">
                            {(article.author?.first_name?.[0] || 'C').toUpperCase()}
                          </div>
                          <span className="author-name">
                            {article.author?.first_name} {article.author?.last_name}
                          </span>
                        </div>
                        
                        <div className="meta-stats">
                          <span className="stat">
                            <span className="stat-icon">👁️</span>
                            {formatViews(article.views_count || 0)}
                          </span>
                          <span className="meta-divider">·</span>
                          <span className="stat">{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ANNOUNCEMENTS - Important Updates */}
          {content?.announcements && content.announcements.length > 0 && (
            <section className="content-section announcements-section" aria-label="Church announcements">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">📢</span>
                  Church Announcements
                </h2>
                <p className="section-subtitle">Stay updated with important church news and events</p>
              </div>
              
              <div className="announcements-list">
                {content.announcements.slice(0, 3).map((announcement) => (
                  <article key={announcement.id} className="announcement-card">
                    <div className="announcement-content">
                      <div className="announcement-badge">
                        <span className="badge-urgent">Important</span>
                      </div>
                      
                      <h3 className="announcement-title">{announcement.title}</h3>
                      
                      <p className="announcement-excerpt">
                        {announcement.excerpt?.slice(0, 200)}...
                      </p>
                      
                      <div className="announcement-meta">
                        <span className="announcement-date">{formatDate(announcement.published_at)}</span>
                        <div className="announcement-stats">
                          <span className="stat">
                            <span className="stat-icon">👁️</span>
                            {formatViews(announcement.views_count || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* SCRIPTURE REFLECTION - Spiritual Breathing Space */}
          <section className="scripture-section premium-scripture" aria-label="Scripture reflection">
            <div className="scripture-container">
              <div className="scripture-content">
                <blockquote className="scripture-verse">{currentQuote.text}</blockquote>
                <cite className="scripture-reference">{currentQuote.attribution}</cite>
              </div>
              <div className="scripture-decoration">
                <div className="decoration-icon">🙏</div>
              </div>
            </div>
          </section>

          {/* MIXED CONTENT FEED - Latest from all categories */}
          {content?.latest && content.latest.length > 0 && (
            <section className="content-section latest-section" aria-label="Latest content">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🎆</span>
                  More to Explore
                </h2>
                <p className="section-subtitle">Recent content from our community</p>
              </div>
              
              <div className="mixed-content-grid">
                {content.latest.slice(0, 6).map((item) => (
                  <article key={item.id} className="mixed-content-card">
                    <div className="mixed-card-header">
                      <div className="content-type-badge">
                        <span className="badge-icon">{getContentIcon(item.content_type_name || '')}</span>
                        <span className="badge-text">{item.content_type_name || 'Content'}</span>
                      </div>
                      
                      <div className="card-actions-menu">
                        <button className="action-btn" aria-label="More options">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="19" cy="12" r="2"/>
                            <circle cx="5" cy="12" r="2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {item.featured_image && (
                      <div className="mixed-card-image">
                        <img src={item.featured_image} alt={item.title} loading="lazy" />
                      </div>
                    )}
                    
                    <div className="mixed-card-content">
                      <h3 className="mixed-card-title">{item.title}</h3>
                      
                      {item.excerpt && (
                        <p className="mixed-card-excerpt">
                          {item.excerpt.slice(0, 100)}...
                        </p>
                      )}
                      
                      <div className="mixed-card-meta">
                        <div className="meta-author">
                          <div className="author-avatar">
                            {(item.author?.first_name?.[0] || 'C').toUpperCase()}
                          </div>
                          <span className="author-name">
                            {item.author?.first_name} {item.author?.last_name}
                          </span>
                        </div>
                        
                        <div className="meta-engagement">
                          <span className="engagement-item">
                            <span className="engagement-icon">👁️</span>
                            {formatViews(item.views_count || 0)}
                          </span>
                          {item.reactions_count > 0 && (
                            <span className="engagement-item">
                              <span className="engagement-icon">❤️</span>
                              {item.reactions_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

// Premium Loading State Component
const PremiumLoadingState: React.FC = () => (
  <div className="premium-loading-container">
    {/* Hero Skeleton */}
    <div className="loading-hero">
      <div className="hero-skeleton">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-excerpt" />
        <div className="skeleton skeleton-meta" />
        <div className="skeleton skeleton-image" />
        <div className="skeleton-actions">
          <div className="skeleton skeleton-btn-primary" />
          <div className="skeleton skeleton-btn-secondary" />
        </div>
      </div>
    </div>

    {/* Content Sections Skeleton */}
    <div className="loading-sections">
      {[1, 2, 3].map((section) => (
        <div key={section} className="loading-section">
          <div className="section-header-skeleton">
            <div className="skeleton skeleton-section-title" />
            <div className="skeleton skeleton-section-subtitle" />
          </div>
          
          <div className="loading-grid">
            {[1, 2, 3].map((card) => (
              <div key={card} className="loading-card">
                <div className="skeleton skeleton-card-image" />
                <div className="loading-card-content">
                  <div className="skeleton skeleton-card-badge" />
                  <div className="skeleton skeleton-card-title" />
                  <div className="skeleton skeleton-card-excerpt" />
                  <div className="skeleton skeleton-card-meta" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Premium Error State Component
interface PremiumErrorStateProps {
  error: string;
  onRetry: () => void;
}

const PremiumErrorState: React.FC<PremiumErrorStateProps> = ({ error, onRetry }) => (
  <div className="premium-error-container">
    <div className="error-content">
      <div className="error-illustration">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.731 0 2.814-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="error-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </div>
      
      <div className="error-text">
        <h2 className="error-title">Unable to Load Content</h2>
        <p className="error-message">{error}</p>
        <p className="error-suggestion">
          Please check your internet connection and try again.
        </p>
      </div>
      
      <div className="error-actions">
        <button onClick={onRetry} className="btn-error-retry">
          <span className="btn-icon">🔄</span>
          Try Again
        </button>
        <button className="btn-error-support">
          <span className="btn-icon">💬</span>
          Contact Support
        </button>
      </div>
    </div>
  </div>
);

export default HomePage;
