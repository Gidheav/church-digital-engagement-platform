/**
 * HomePage - Enterprise Edition
 * 
 * Modern, professional public homepage with:
 * - Hero/Featured section
 * - Content grids
 * - Sidebar with events, newsletter
 * - Professional footer
 * 
 * Design: Medium + YouTube + Eventbrite hybrid
 */

import React, { useEffect, useState } from 'react';
import homeService, { HomeContent } from '../services/home.service';

// Layout Components
import PublicNavigation from './components/PublicNavigation';
import PublicFooter from './components/PublicFooter';

// Section Components
import Sidebar from './components/Sidebar';

// Styles
import '../styles/design-system.css';
import './components/PublicNavigation.css';
import './components/HeroSection.css';
import './components/ContentCard.css';
import './components/ContentGrid.css';
import './components/Sidebar.css';
import './components/PublicFooter.css';
import './HomePage.css';
import './HomePage.redesign.css';

// Sample events (would come from backend)
const sampleEvents = [
  { id: '1', title: 'Sunday Worship Service', date: '2026-01-25', time: '9:00 AM & 11:00 AM' },
  { id: '2', title: 'Youth Group Meeting', date: '2026-01-28', time: '6:30 PM' },
  { id: '3', title: 'Community Outreach', date: '2026-02-01', time: '10:00 AM' },
];

// Sample verse of the day
const verseOfTheDay = {
  text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
  reference: 'Jeremiah 29:11',
};

const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Loading State
  if (loading) {
    return (
      <div className="home-page">
        <PublicNavigation />
        <main className="main-content">
          <LoadingState />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="home-page">
        <PublicNavigation />
        <main className="main-content">
          <ErrorState error={error} onRetry={loadHomeContent} />
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="home-page">
      <PublicNavigation />

      <main className="main-content">
        {/* Hero Section - Inspiring Welcome */}
        <section className="hero-banner">
          <div className="hero-banner-container">
            <div className="hero-banner-content">
              <div className="hero-text">
                <h1 className="hero-headline">Growing in Faith, Connected in Community</h1>
                <p className="hero-tagline">
                  Join us on a journey of spiritual growth, fellowship, and service. 
                  Experience God's love in a welcoming community.
                </p>
                <div className="hero-cta-group">
                  <a href="#live" className="btn btn-primary btn-lg hero-cta">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" opacity="0.3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Join Us Live
                  </a>
                  <a href="/content?type=SERMON" className="btn btn-secondary btn-lg hero-cta">
                    Explore Sermons
                  </a>
                </div>
              </div>
              <div className="hero-featured">
                {content?.featured && (
                  <div className="featured-card-hero">
                    <div className="featured-card-media">
                      {content.featured.featured_image ? (
                        <img src={content.featured.featured_image} alt={content.featured.title} />
                      ) : (
                        <div className="featured-card-placeholder" />
                      )}
                      <div className="featured-play-overlay">
                        <button className="play-btn-large">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="featured-card-info">
                      <span className="featured-badge">{content.featured.type}</span>
                      <h3 className="featured-title">{content.featured.title}</h3>
                      <div className="featured-meta">
                        <span>{content.featured.author.first_name} {content.featured.author.last_name}</span>
                        <span>•</span>
                        <span>{new Date(content.featured.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <a href={`/content/${content.featured.id}`} className="btn btn-primary btn-sm">
                        Watch Now
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Navigation Tiles */}
        <section className="quick-access-section">
          <div className="quick-access-container">
            <div className="quick-access-grid">
              <a href="/content?type=SERMON" className="quick-tile">
                <div className="tile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <h3 className="tile-title">Sermons</h3>
                <p className="tile-desc">Watch our latest messages</p>
              </a>
              <a href="/content?type=ARTICLE" className="quick-tile">
                <div className="tile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h3 className="tile-title">Articles</h3>
                <p className="tile-desc">Read inspiring content</p>
              </a>
              <a href="/content?type=DISCIPLESHIP" className="quick-tile">
                <div className="tile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="tile-title">Discipleship</h3>
                <p className="tile-desc">Grow in your faith journey</p>
              </a>
              <a href="/content?type=TESTIMONY" className="quick-tile">
                <div className="tile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </div>
                <h3 className="tile-title">Testimonies</h3>
                <p className="tile-desc">Stories of faith & hope</p>
              </a>
              <a href="/events" className="quick-tile">
                <div className="tile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 className="tile-title">Events</h3>
                <p className="tile-desc">Join our gatherings</p>
              </a>
            </div>
          </div>
        </section>

        {/* Main Content Grid: 70/30 Layout */}
        <div className="content-layout">
          <div className="content-layout-container">
            <div className="content-layout-grid">
              {/* Left Column - Main Content */}
              <div className="content-main-column">
                {/* Latest Sermons Section */}
                {content?.sermons && content.sermons.length > 0 && (
                  <section className="content-section">
                    <div className="section-header">
                      <div className="section-header-left">
                        <div className="section-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                        <h2 className="section-title">Latest Sermons</h2>
                      </div>
                      <a href="/content?type=SERMON" className="section-link">
                        View All
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    </div>
                    <div className="sermon-grid">
                      {content.sermons.slice(0, 4).map((sermon) => (
                        <a key={sermon.id} href={`/content/${sermon.id}`} className="sermon-card">
                          <div className="sermon-card-media">
                            {sermon.featured_image ? (
                              <img src={sermon.featured_image} alt={sermon.title} />
                            ) : (
                              <div className="sermon-placeholder" />
                            )}
                            <div className="play-overlay">
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="sermon-card-content">
                            <h3 className="sermon-title">{sermon.title}</h3>
                            <div className="sermon-meta">
                              <span className="sermon-author">{sermon.author.first_name} {sermon.author.last_name}</span>
                              <span className="sermon-dot">•</span>
                              <span className="sermon-date">{new Date(sermon.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="sermon-stats">
                              <span className="sermon-views">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                {sermon.views_count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Discipleship Section - Inserted between Sermons and Articles */}
                {content?.discipleship && content.discipleship.length > 0 && (
                  <section className="content-section">
                    <div className="section-header">
                      <div className="section-header-left">
                        <div className="section-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        </div>
                        <h2 className="section-title">Discipleship Resources</h2>
                      </div>
                      <a href="/content?type=DISCIPLESHIP" className="section-link">
                        View All
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    </div>
                    <div className="article-grid">
                      {content.discipleship.slice(0, 3).map((discipleship) => (
                        <a key={discipleship.id} href={`/content/${discipleship.id}`} className="article-card">
                          <div className="article-card-media">
                            {discipleship.featured_image ? (
                              <img src={discipleship.featured_image} alt={discipleship.title} />
                            ) : (
                              <div className="article-placeholder" />
                            )}
                          </div>
                          <div className="article-card-content">
                            <span className="article-badge">Discipleship</span>
                            <h3 className="article-title">{discipleship.title}</h3>
                            {discipleship.excerpt && (
                              <p className="article-excerpt">{discipleship.excerpt}</p>
                            )}
                            <div className="article-footer">
                              <div className="article-author">
                                <div className="author-avatar">{discipleship.author.first_name.charAt(0)}</div>
                                <div className="author-info">
                                  <span className="author-name">{discipleship.author.first_name} {discipleship.author.last_name}</span>
                                  <span className="author-date">{new Date(discipleship.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Featured Articles Section */}
                {content?.articles && content.articles.length > 0 && (
                  <section className="content-section">
                    <div className="section-header">
                      <div className="section-header-left">
                        <div className="section-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                          </svg>
                        </div>
                        <h2 className="section-title">Featured Articles</h2>
                      </div>
                      <a href="/content?type=ARTICLE" className="section-link">
                        View All
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    </div>
                    <div className="article-grid">
                      {content.articles.slice(0, 3).map((article) => (
                        <a key={article.id} href={`/content/${article.id}`} className="article-card">
                          <div className="article-card-media">
                            {article.featured_image ? (
                              <img src={article.featured_image} alt={article.title} />
                            ) : (
                              <div className="article-placeholder" />
                            )}
                          </div>
                          <div className="article-card-content">
                            <span className="article-badge">Article</span>
                            <h3 className="article-title">{article.title}</h3>
                            {article.excerpt && (
                              <p className="article-excerpt">{article.excerpt}</p>
                            )}
                            <div className="article-footer">
                              <div className="article-author">
                                <div className="author-avatar">{article.author.first_name.charAt(0)}</div>
                                <div className="author-info">
                                  <span className="author-name">{article.author.first_name} {article.author.last_name}</span>
                                  <span className="author-date">{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recent Testimonies Section */}
                {content?.latest && content.latest.filter(p => p.type === 'TESTIMONY').length > 0 && (
                  <section className="content-section testimonies-section">
                    <div className="section-header">
                      <div className="section-header-left">
                        <div className="section-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                          </svg>
                        </div>
                        <h2 className="section-title">Recent Testimonies</h2>
                      </div>
                      <a href="/content?type=TESTIMONY" className="section-link">
                        View All
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </a>
                    </div>
                    <div className="testimony-grid">
                      {content.latest.filter(p => p.type === 'TESTIMONY').slice(0, 3).map((testimony) => (
                        <a key={testimony.id} href={`/content/${testimony.id}`} className="testimony-card">
                          <div className="testimony-quote-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                            </svg>
                          </div>
                          <p className="testimony-excerpt">{testimony.excerpt}</p>
                          <div className="testimony-author">
                            <div className="testimony-avatar">{testimony.author.first_name.charAt(0)}</div>
                            <div className="testimony-info">
                              <span className="testimony-name">{testimony.author.first_name} {testimony.author.last_name}</span>
                              <span className="testimony-date">{new Date(testimony.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {(!content?.sermons || content.sermons.length === 0) &&
                 (!content?.articles || content.articles.length === 0) &&
                 (!content?.latest || content.latest.length === 0) && (
                  <EmptyState />
                )}
              </div>

              {/* Right Column - Sidebar */}
              <aside className="content-sidebar-column">
                <Sidebar
                  events={sampleEvents}
                  announcements={content?.announcements}
                  recentPosts={content?.latest?.slice(0, 5) || []}
                  verseOfTheDay={verseOfTheDay}
                />
              </aside>
            </div>
          </div>
        </div>

        {/* Bottom Highlight Section */}
        <section className="highlight-banner">
          <div className="highlight-banner-container">
            <div className="highlight-content">
              <span className="highlight-label">Current Series</span>
              <h2 className="highlight-title">Faith in Action: Living Out God's Word</h2>
              <p className="highlight-desc">Join us every Sunday as we explore practical ways to live out our faith in everyday life.</p>
              <a href="/content?type=SERMON" className="btn btn-primary btn-lg">
                Watch the Series
              </a>
            </div>
            <div className="highlight-visual">
              <div className="highlight-circle" />
              <div className="highlight-circle" />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

// Loading State Component
const LoadingState: React.FC = () => (
  <div className="loading-container">
    {/* Hero Skeleton */}
    <div className="skeleton-hero">
      <div className="skeleton skeleton-hero-main" />
      <div className="skeleton-hero-secondary">
        <div className="skeleton skeleton-hero-item" />
        <div className="skeleton skeleton-hero-item" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="skeleton-content">
      <div className="skeleton skeleton-title" style={{ width: '200px', height: '32px' }} />
      <div className="skeleton-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-image" />
            <div className="skeleton-body">
              <div className="skeleton skeleton-text" style={{ width: '60px' }} />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="error-container">
    <div className="error-content">
      <div className="error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button onClick={onRetry} className="btn btn-primary btn-lg">
        Try Again
      </button>
    </div>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="empty-container">
    <div className="empty-content">
      <div className="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h2>No content yet</h2>
      <p>Check back soon for sermons, articles, and more from our church.</p>
    </div>
  </div>
);

export default HomePage;
