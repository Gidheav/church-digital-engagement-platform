/**
 * ContentGrid Component - Enterprise Edition
 * 
 * Responsive grid layout for content cards
 * Supports filtering and view mode switching
 */

import React from 'react';
import { HomePost } from '../../services/home.service';
import ContentCard from './ContentCard';
import './ContentGrid.css';

interface ContentGridProps {
  title: string;
  posts: HomePost[];
  viewAll?: string;
  columns?: 2 | 3 | 4;
  showExcerpt?: boolean;
  variant?: 'default' | 'compact';
  emptyMessage?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  title,
  posts,
  viewAll,
  columns = 3,
  showExcerpt = true,
  variant = 'default',
  emptyMessage = 'No content available',
}) => {
  if (!posts || posts.length === 0) {
    return (
      <section className="content-grid-section">
        <div className="content-grid-container">
          <div className="content-grid-header">
            <h2 className="content-grid-title">{title}</h2>
          </div>
          <div className="content-grid-empty">
            <p>{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-grid-section">
      <div className="content-grid-container">
        <div className="content-grid-header">
          <h2 className="content-grid-title">{title}</h2>
          {viewAll && (
            <a href={viewAll} className="content-grid-view-all">
              View All
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </a>
          )}
        </div>

        <div className={`content-grid content-grid-${columns}`}>
          {posts.map((post) => (
            <ContentCard
              key={post.id}
              post={post}
              variant={variant}
              showExcerpt={showExcerpt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentGrid;
