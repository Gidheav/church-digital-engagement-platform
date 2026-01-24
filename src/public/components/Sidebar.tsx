/**
 * Sidebar Component - Enterprise Edition
 * 
 * Right sidebar with:
 * - Upcoming events
 * - Recent content
 * - Newsletter signup
 * - Quick links
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';
import './Sidebar.css';

interface SidebarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
}

interface SidebarProps {
  recentPosts?: HomePost[];
  events?: SidebarEvent[];
  announcements?: HomePost[];
  verseOfTheDay?: {
    text: string;
    reference: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({
  recentPosts = [],
  events = [],
  announcements = [],
  verseOfTheDay,
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  };

  return (
    <aside className="sidebar">
      {/* Verse of the Day */}
      {verseOfTheDay && (
        <div className="sidebar-card verse-card">
          <div className="verse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <blockquote className="verse-text">
            "{verseOfTheDay.text}"
          </blockquote>
          <cite className="verse-reference">{verseOfTheDay.reference}</cite>
        </div>
      )}

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="sidebar-card announcements-card">
          <h3 className="sidebar-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Latest Updates
          </h3>
          <div className="announcements-list">
            {announcements.slice(0, 6).map((announcement) => (
              <Link
                key={announcement.id}
                to={`/content/${announcement.id}`}
                className="announcement-item"
              >
                <div className="announcement-header">
                  <span className="announcement-indicator" />
                  <span className="announcement-date">
                    {new Date(announcement.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="announcement-title">{announcement.title}</h4>
                {announcement.excerpt && (
                  <p className="announcement-excerpt">
                    {announcement.excerpt.substring(0, 60)}...
                  </p>
                )}
                {announcement.type && (
                  <span className={`announcement-badge badge-${announcement.type.toLowerCase()}`}>
                    {announcement.type.replace('_', ' ')}
                  </span>
                )}
              </Link>
            ))}
          </div>
          {announcements.length > 6 && (
            <Link to="/announcements" className="sidebar-link">
              View All Updates
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div className="sidebar-card">
          <h3 className="sidebar-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Upcoming Events
          </h3>
          <div className="events-list">
            {events.slice(0, 3).map((event) => {
              const dateInfo = formatDate(event.date);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="event-item"
                >
                  <div className="event-date-badge">
                    <span className="event-day">{dateInfo.day}</span>
                    <span className="event-month">{dateInfo.month}</span>
                  </div>
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    {event.time && (
                      <span className="event-time">{event.time}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          <Link to="/events" className="sidebar-link">
            View All Events
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </Link>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="sidebar-card">
          <h3 className="sidebar-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Recent Posts
          </h3>
          <div className="recent-posts-list">
            {recentPosts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                to={`/content/${post.id}`}
                className="recent-post-item"
              >
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt=""
                    className="recent-post-thumb"
                    loading="lazy"
                  />
                ) : (
                  <div className={`recent-post-thumb-placeholder ${post.type.toLowerCase()}`}>
                    {post.type === 'SERMON' && (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </div>
                )}
                <div className="recent-post-info">
                  <span className="recent-post-title">{post.title}</span>
                  <span className="recent-post-meta">
                    {post.author.first_name} {post.author.last_name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="sidebar-card newsletter-card">
        <h3 className="sidebar-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Stay Connected
        </h3>
        <p className="newsletter-desc">
          Get weekly updates, devotionals, and church news delivered to your inbox.
        </p>

        {!isSubscribed ? (
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="newsletter-input"
              required
            />
            <button
              type="submit"
              className="btn btn-primary newsletter-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        ) : (
          <div className="newsletter-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            <span>Thank you for subscribing!</span>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Quick Links
        </h3>
        <nav className="quick-links">
          <Link to="/about" className="quick-link">
            <span>About Us</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </Link>
          <Link to="/contact" className="quick-link">
            <span>Contact</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </Link>
          <Link to="/giving" className="quick-link">
            <span>Give Online</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </Link>
          <Link to="/prayer" className="quick-link">
            <span>Prayer Requests</span>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
