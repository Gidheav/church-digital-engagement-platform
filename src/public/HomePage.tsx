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
import HeroSection from './components/HeroSection';
import ContentGrid from './components/ContentGrid';
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
        {/* Hero Section */}
        <HeroSection 
          featured={content?.featured || null}
          announcements={content?.announcements}
        />

        {/* Main Content with Sidebar Layout */}
        <div className="home-layout">
          <div className="home-container">
            <div className="home-grid">
              {/* Main Content Area */}
              <div className="home-main">
                {/* Sermons Section */}
                {content?.sermons && content.sermons.length > 0 && (
                  <ContentGrid
                    title="Latest Sermons"
                    posts={content.sermons}
                    viewAll="/content?type=SERMON"
                    columns={2}
                    showExcerpt={true}
                  />
                )}

                {/* Articles Section */}
                {content?.articles && content.articles.length > 0 && (
                  <ContentGrid
                    title="Featured Articles"
                    posts={content.articles}
                    viewAll="/content?type=ARTICLE"
                    columns={2}
                    showExcerpt={true}
                  />
                )}

                {/* Latest Feed */}
                {content?.latest && content.latest.length > 0 && (
                  <ContentGrid
                    title="More From Our Church"
                    posts={content.latest}
                    viewAll="/content"
                    columns={3}
                    variant="compact"
                    showExcerpt={false}
                  />
                )}

                {/* Empty State */}
                {(!content?.sermons || content.sermons.length === 0) &&
                 (!content?.articles || content.articles.length === 0) &&
                 (!content?.latest || content.latest.length === 0) && (
                  <EmptyState />
                )}
              </div>

              {/* Sidebar */}
              <aside className="home-sidebar">
                <Sidebar
                  events={sampleEvents}
                  recentPosts={content?.latest?.slice(0, 5) || []}
                  verseOfTheDay={verseOfTheDay}
                />
              </aside>
            </div>
          </div>
        </div>
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
