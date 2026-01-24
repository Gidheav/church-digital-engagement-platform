/**
 * Church Content Library
 * Professional content discovery and archive page
 * Two-column layout: Filter sidebar + Content area
 * Accessible to all users (no authentication required)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import contentService, { PublicPostListItem } from '../services/content.service';
import './ContentList.css';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'most-commented' | 'alphabetical';

interface Filters {
  type: string;
  search: string;
  // TODO: Add date range, tags, author when backend supports them
}

const ContentList: React.FC = () => {
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    type: '',
    search: '',
  });
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('contentLibrary_viewMode');
    return (saved as ViewMode) || 'grid';
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Load posts when filters change
  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const apiFilters: any = {};
      if (filters.type) apiFilters.type = filters.type;

      const data = await contentService.getAllPosts(apiFilters);
      setPosts(data);
    } catch (err: any) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically extract available content types with counts from backend data
  const availableContentTypes = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    
    // Count posts by type (only active, visible posts)
    posts.forEach(post => {
      if (post.post_type) {
        typeCounts[post.post_type] = (typeCounts[post.post_type] || 0) + 1;
      }
    });

    // Convert to array and sort alphabetically
    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => a.type.localeCompare(b.type));
  }, [posts]);

  // Filter and sort posts client-side
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(searchLower) ||
          post.author_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case 'oldest':
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
        case 'most-viewed':
          return b.views_count - a.views_count;
        case 'most-commented':
          return b.comments_count - a.comments_count;
        case 'alphabetical':
          // Sort by title only, case-insensitive
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        default:
          return 0;
      }
    });

    return result;
  }, [posts, filters.search, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeName = (type: string): string => {
    // Known content types mapping
    const types: Record<string, string> = {
      'SERMON': 'Sermons',
      'ARTICLE': 'Articles',
      'ANNOUNCEMENT': 'Announcements',
      'TESTIMONY': 'Testimonies',
      'EVENT': 'Events',
      'DEVOTIONAL': 'Devotionals',
      'DISCIPLESHIP': 'Discipleship',
    };
    
    // Return mapped name or format the type string (handle custom admin-created types)
    if (types[type]) {
      return types[type];
    }
    
    // Format custom types: "CUSTOM_TYPE" -> "Custom Type"
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') + 's';
  };

  const clearAllFilters = () => {
    setFilters({ type: '', search: '' });
    setSearchValue('');
    setSortBy('newest');
  };

  const hasActiveFilters = () => {
    return filters.type !== '' || filters.search !== '';
  };

  const getActiveFilterSummary = (): string => {
    const parts: string[] = [];
    if (filters.type) parts.push(getTypeName(filters.type));
    if (filters.search) parts.push(`"${filters.search}"`);
    return parts.length > 0 ? parts.join(', ') : 'All Content';
  };

  // Persist view mode
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('contentLibrary_viewMode', mode);
  };

  // Render filter sidebar (desktop) or drawer (mobile)
  const renderFilterPanel = () => (
    <aside className="filter-panel">
      <div className="filter-panel-header">
        <h3>Filters</h3>
        {hasActiveFilters() && (
          <button className="text-button" onClick={clearAllFilters}>
            Clear All
          </button>
        )}
      </div>

      {/* Content Type Filter - Dynamic from Backend */}
      <div className="filter-section">
        <h4 className="filter-section-title">Content Type</h4>
        <div className="filter-options">
          <button
            className={`filter-option ${filters.type === '' ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
          >
            <span className="filter-option-label">All Content</span>
            <span className="filter-count">({posts.length})</span>
          </button>
          {availableContentTypes.map(({ type, count }) => (
            <button
              key={type}
              className={`filter-option ${filters.type === type ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, type }))}
            >
              <span className="filter-option-label">{getTypeName(type)}</span>
              <span className="filter-count">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div className="filter-section">
        <h4 className="filter-section-title">Sort By</h4>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-viewed">Most Viewed</option>
          <option value="most-commented">Most Commented</option>
          <option value="alphabetical">Alphabetical (A–Z)</option>
        </select>
      </div>
    </aside>
  );

  if (loading) {
    return (
      <div className="content-library-page">
        <Header />
        <div className="content-library-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading content library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-library-page">
      <Header />
      
      <div className="content-library-container">
        {/* Page Header */}
        <div className="library-header">
          <div className="library-title-section">
            <h1>Church Content</h1>
            <p className="library-subtitle">
              Sermons, articles, announcements, and discipleship resources from our church
            </p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="library-layout">
          {/* Left Column: Filter Sidebar (Desktop) */}
          <div className="desktop-filters">
            {renderFilterPanel()}
          </div>

          {/* Right Column: Content Area */}
          <div className="content-area">
            {/* Utility Bar */}
            <div className="utility-bar">
              <div className="utility-bar-left">
                {/* Search */}
                <div className="search-container">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by title or author..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  {searchValue && (
                    <button
                      className="search-clear"
                      onClick={() => setSearchValue('')}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  className="mobile-filter-toggle"
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  Filters
                </button>
              </div>

              <div className="utility-bar-right">
                {/* Active Filter Summary */}
                <div className="filter-summary">
                  <span className="filter-summary-label">Showing:</span>
                  <span className="filter-summary-value">{getActiveFilterSummary()}</span>
                  <span className="results-count">({filteredAndSortedPosts.length} results)</span>
                </div>

                {/* View Toggle */}
                <div className="view-toggle">
                  <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('grid')}
                    aria-label="Grid view"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('list')}
                    aria-label="List view"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={loadPosts}>Try Again</button>
              </div>
            )}

            {/* Empty State */}
            {!error && filteredAndSortedPosts.length === 0 && (
              <div className="empty-state">
                <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>No content matches your filters</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                {hasActiveFilters() && (
                  <button className="btn-primary" onClick={clearAllFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Content Grid View */}
            {!error && viewMode === 'grid' && filteredAndSortedPosts.length > 0 && (
              <div className="content-grid">
                {filteredAndSortedPosts.map((post) => (
                  <Link to={`/content/${post.id}`} key={post.id} className="content-card">
                    <div className="card-header">
                      <span className={`type-badge type-${post.post_type.toLowerCase()}`}>
                        {getTypeName(post.post_type)}
                      </span>
                    </div>
                    <h3 className="card-title">{post.title}</h3>
                    <div className="card-meta">
                      <span className="meta-author">By {post.author_name}</span>
                      <span className="meta-date">{formatDate(post.published_at)}</span>
                    </div>
                    <div className="card-stats">
                      <span className="stat-item">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {post.views_count}
                      </span>
                      <span className="stat-item">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {post.comments_count}
                      </span>
                      <span className="stat-item">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {post.reactions_count}
                      </span>
                    </div>
                    <div className="card-action">
                      <span className="action-link">Read More →</span>
                    </div>
                  </Link>
                ))}\n              </div>
            )}

            {/* Content List View */}
            {!error && viewMode === 'list' && filteredAndSortedPosts.length > 0 && (
              <div className="content-list">
                {filteredAndSortedPosts.map((post) => (
                  <Link to={`/content/${post.id}`} key={post.id} className="content-list-item">
                    <div className="list-item-main">
                      <span className={`type-badge type-${post.post_type.toLowerCase()}`}>
                        {getTypeName(post.post_type)}
                      </span>
                      <h3 className="list-item-title">{post.title}</h3>
                    </div>
                    <div className="list-item-meta">
                      <span className="meta-author">{post.author_name}</span>
                      <span className="meta-separator">•</span>
                      <span className="meta-date">{formatDate(post.published_at)}</span>
                    </div>
                    <div className="list-item-stats">
                      <span className="stat-item">{post.views_count} views</span>
                      <span className="stat-item">{post.comments_count} comments</span>
                      <span className="stat-item">{post.reactions_count} reactions</span>
                    </div>
                  </Link>
                ))}\n              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setFilterDrawerOpen(false)} />
          <div className="drawer-panel">
            <div className="drawer-header">
              <h3>Filters</h3>
              <button
                className="drawer-close"
                onClick={() => setFilterDrawerOpen(false)}
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
            <div className="drawer-content">
              {renderFilterPanel()}
            </div>
            <div className="drawer-footer">
              <button className="btn-secondary" onClick={() => setFilterDrawerOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentList;
