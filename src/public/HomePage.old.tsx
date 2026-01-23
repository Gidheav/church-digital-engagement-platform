/**
 * Public Homepage - Editorial News Style
 * 
 * Landing page with aggregate content sections:
 * - Featured content (hero)
 * - Latest announcements
 * - Recent sermons
 * - Articles
 * - Latest feed (more from church)
 */

import React, { useEffect, useState } from 'react';
import homeService, { HomeContent } from '../services/home.service';
import Header from '../components/Header';
import FeaturedSection from './home/FeaturedSection';
import AnnouncementStrip from './home/AnnouncementStrip';
import SermonList from './home/SermonList';
import ArticleGrid from './home/ArticleGrid';
import LatestFeed from './home/LatestFeed';
import './home/home.css';

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

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="home-loading">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <Header />
        <div className="home-error">
          <h2>Error loading content</h2>
          <p>{error}</p>
          <button onClick={loadHomeContent} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      
      <main>
        {content?.featured && <FeaturedSection post={content.featured} />}
        
        {content?.announcements && content.announcements.length > 0 && (
          <AnnouncementStrip announcements={content.announcements} />
        )}
        
        {content?.sermons && content.sermons.length > 0 && (
          <SermonList sermons={content.sermons} />
        )}
        
        {content?.articles && content.articles.length > 0 && (
          <ArticleGrid articles={content.articles} />
        )}
        
        {content?.latest && content.latest.length > 0 && (
          <LatestFeed posts={content.latest} />
        )}
      </main>

      <footer className="homepage-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Church Digital Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
