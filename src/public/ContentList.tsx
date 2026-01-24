/**
 * Church Content Library
 * Professional content discovery and archive page
 * Two-column layout: Filter sidebar + Content area
 * Accessible to all users (no authentication required)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import contentService, { PublicPostListItem, ContentType } from '../services/content.service';
import './ContentList.css';

type ViewMode = 'table' | 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'most-commented' | 'alphabetical';
type TableSortColumn = 'title' | 'published' | 'views' | null;
type TableSortDirection = 'asc' | 'desc';

interface Filters {
  type: string;
  search: string;
  // TODO: Add date range, tags, author when backend supports them
}

const ContentList: React.FC = () => {
  const [posts, setPosts] = useState<PublicPostListItem[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
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
    return (saved as ViewMode) || 'table';
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Table-specific sort state
  const [tableSortColumn, setTableSortColumn] = useState<TableSortColumn>('published');
  const [tableSortDirection, setTableSortDirection] = useState<TableSortDirection>('desc');

  // Load content types on mount
  useEffect(() => {
    loadContentTypes();
  }, []);

  // Refresh content types when page becomes visible (handles admin changes in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadContentTypes();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

  const loadContentTypes = async () => {
    try {
      const types = await contentService.getContentTypes();
      setContentTypes(types);
    } catch (err: any) {
      console.error('Failed to load content types:', err);
      // Don't show error to user - just use empty array
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const apiFilters: any = {};
      if (filters.type) apiFilters.type = filters.type;

      const data = await contentService.getAllPosts(apiFilters);
      setPosts(data);
      
      // Refresh content types to get updated counts after posts load
      loadContentTypes();
    } catch (err: any) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

    // Apply sorting (for table view, use table sort; for grid/list use sortBy)
    if (viewMode === 'table' && tableSortColumn) {
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (tableSortColumn) {
          case 'title':
            comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
            break;
          case 'published':
            comparison = new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
            break;
          case 'views':
            comparison = a.views_count - b.views_count;
            break;
        }
        
        return tableSortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
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
            return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
          default:
            return 0;
        }
      });
    }

    return result;
  }, [posts, filters.search, sortBy, viewMode, tableSortColumn, tableSortDirection]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeName = (slug: string): string => {
    // Find the content type by slug from the dynamically loaded types
    const contentType = contentTypes.find(ct => ct.slug === slug.toLowerCase());
    if (contentType) {
      return contentType.name;
    }
    
    // Fallback: Format the slug if not found (shouldn't happen in normal operation)
    return slug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const getTypeAbbreviation = (slug: string): string => {
    const typeMap: Record<string, string> = {
      'article': 'ART',
      'announcement': 'ANN',
      'sermon': 'SER',
      'discipleship': 'DISC',
      'testimony': 'TEST',
      'devotion': 'DEV',
    };
    
    return typeMap[slug.toLowerCase()] || slug.substring(0, 3).toUpperCase();
  };
  
  const handleTableSort = (column: TableSortColumn) => {
    if (tableSortColumn === column) {
      // Toggle direction if same column
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending (newest/most first)
      setTableSortColumn(column);
      setTableSortDirection('desc');
    }
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
    if (filters.type) {
      const contentType = contentTypes.find(ct => ct.slug === filters.type);
      parts.push(contentType ? contentType.name : filters.type);
    }
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
          {contentTypes.map((contentType) => (
            <button
              key={contentType.id}
              className={`filter-option ${filters.type === contentType.slug ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, type: contentType.slug }))}
            >
              <span className="filter-option-label">{contentType.name}</span>
              <span className="filter-count">({contentType.count})</span>
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
          <div className="library-header">
            <div className="library-title-section">
              <h1>Church Content</h1>
              <p className="library-subtitle">
                Sermons, articles, announcements, and discipleship resources from our church
              </p>
            </div>
          </div>
          <div className="library-layout">
            <div className="desktop-filters">
              <div className="filter-panel">
                <div className="filter-panel-header">
                  <h3>Filters</h3>
                </div>
                <div className="filter-section">
                  <div className="skeleton-cell" style={{ height: '40px', marginBottom: '8px' }}></div>
                  <div className="skeleton-cell" style={{ height: '40px', marginBottom: '8px' }}></div>
                  <div className="skeleton-cell" style={{ height: '40px' }}></div>
                </div>
              </div>
            </div>
            <div className="content-area">
              <div className="content-table-wrapper">
                <table className="content-table table-skeleton">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th className="col-type">Type</th>
                      <th className="col-author">Author</th>
                      <th className="col-published">Published</th>
                      <th className="col-views">Views</th>
                      <th className="col-comments">Comments</th>
                      <th className="col-reactions">Reactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(8)].map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton-cell" style={{ height: '20px', width: '80%' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '24px', width: '50px' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '18px', width: '100px' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '18px', width: '90px' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '18px', width: '40px', marginLeft: 'auto' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '18px', width: '40px', marginLeft: 'auto' }}></div></td>
                        <td><div className="skeleton-cell" style={{ height: '18px', width: '40px', marginLeft: 'auto' }}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                    className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('table')}
                    aria-label="Table view"
                    title="Table view"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('grid')}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('list')}
                    aria-label="List view"
                    title="List view"
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

            {/* Content Table View */}
            {!error && viewMode === 'table' && filteredAndSortedPosts.length > 0 && (
              <div className="content-table-wrapper">
                <table className="content-table">
                  <thead>
                    <tr>
                      <th 
                        className={`sortable ${tableSortColumn === 'title' ? 'active' : ''}`}
                        onClick={() => handleTableSort('title')}
                      >
                        <div className="th-content">
                          <span>Title</span>
                          {tableSortColumn === 'title' && (
                            <svg 
                              className={`sort-icon ${tableSortDirection}`} 
                              width="16" 
                              height="16" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="col-type">Type</th>
                      <th className="col-author">Author</th>
                      <th 
                        className={`col-published sortable ${tableSortColumn === 'published' ? 'active' : ''}`}
                        onClick={() => handleTableSort('published')}
                      >
                        <div className="th-content">
                          <span>Published</span>
                          {tableSortColumn === 'published' && (
                            <svg 
                              className={`sort-icon ${tableSortDirection}`} 
                              width="16" 
                              height="16" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className={`col-views sortable ${tableSortColumn === 'views' ? 'active' : ''}`}
                        onClick={() => handleTableSort('views')}
                      >
                        <div className="th-content">
                          <span>Views</span>
                          {tableSortColumn === 'views' && (
                            <svg 
                              className={`sort-icon ${tableSortDirection}`} 
                              width="16" 
                              height="16" 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="col-comments">Comments</th>
                      <th className="col-reactions">Reactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPosts.map((post) => (
                      <tr 
                        key={post.id}
                        onClick={() => window.location.href = `/content/${post.id}`}
                        className="table-row"
                      >
                        <td className="col-title">
                          <div className="title-cell">
                            <span className="title-text">{post.title}</span>
                          </div>
                        </td>
                        <td className="col-type">
                          <span 
                            className={`type-badge badge-${post.post_type.toLowerCase()}`}
                            title={getTypeName(post.post_type)}
                          >
                            {getTypeAbbreviation(post.post_type)}
                          </span>
                        </td>
                        <td className="col-author">
                          <span className="author-name">{post.author_name}</span>
                        </td>
                        <td className="col-published">
                          <span className="date-text">{formatDate(post.published_at)}</span>
                        </td>
                        <td className="col-views">
                          <span className="stat-number">{post.views_count.toLocaleString()}</span>
                        </td>
                        <td className="col-comments">
                          <span className="stat-number">{post.comments_count.toLocaleString()}</span>
                        </td>
                        <td className="col-reactions">
                          <span className="stat-number">{post.reactions_count.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Mobile Card View for Table */}
                <div className="content-table-mobile">
                  {filteredAndSortedPosts.map((post) => (
                    <Link to={`/content/${post.id}`} key={post.id} className="mobile-table-card">
                      <div className="mobile-card-header">
                        <span 
                          className={`type-badge badge-${post.post_type.toLowerCase()}`}
                          title={getTypeName(post.post_type)}
                        >
                          {getTypeAbbreviation(post.post_type)}
                        </span>
                        <span className="mobile-date">{formatDate(post.published_at)}</span>
                      </div>
                      <h3 className="mobile-title">{post.title}</h3>
                      <div className="mobile-author">By {post.author_name}</div>
                      <div className="mobile-stats">
                        <span className="mobile-stat">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {post.views_count}
                        </span>
                        <span className="mobile-stat">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          {post.comments_count}
                        </span>
                        <span className="mobile-stat">
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {post.reactions_count}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
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
