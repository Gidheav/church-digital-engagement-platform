/**
 * PublicNavigation Component - Enterprise Edition
 * 
 * Professional, sticky navigation with:
 * - Logo & brand
 * - Primary navigation with dropdowns
 * - Search overlay
 * - Member login
 * - Mobile hamburger menu
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types/auth.types';
import './PublicNavigation.css';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Sermons',
    href: '/content?type=SERMON',
    children: [
      { label: 'All Sermons', href: '/content?type=SERMON', description: 'Browse all messages' },
      { label: 'Series', href: '/content?type=SERMON&view=series', description: 'Sermon collections' },
      { label: 'Topics', href: '/content?type=SERMON&view=topics', description: 'Browse by theme' },
      { label: 'Speakers', href: '/content?type=SERMON&view=speakers', description: 'Our pastors' },
    ]
  },
  {
    label: 'Articles',
    href: '/content?type=ARTICLE',
    children: [
      { label: 'All Articles', href: '/content?type=ARTICLE', description: 'Read all articles' },
      { label: 'Faith', href: '/content?type=ARTICLE&category=faith', description: 'Spiritual growth' },
      { label: 'Family', href: '/content?type=ARTICLE&category=family', description: 'Family resources' },
      { label: 'Community', href: '/content?type=ARTICLE&category=community', description: 'Church life' },
    ]
  },
  {
    label: 'Testimonies',
    href: '/content?type=TESTIMONY',
  },
  {
    label: 'Events',
    href: '/events',
  },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about', description: 'Who we are' },
      { label: 'Leadership', href: '/about/leadership', description: 'Meet our team' },
      { label: 'Beliefs', href: '/about/beliefs', description: 'What we believe' },
      { label: 'Contact', href: '/contact', description: 'Get in touch' },
    ]
  },
];

const PublicNavigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setIsUserMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const canAccessAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

  return (
    <>
      <header className={`public-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Mobile: Hamburger + Church Portal + Dropdown */}
          <div className="mobile-header">
            {/* Hamburger - Top Left */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            {/* Church Portal Title */}
            <Link to="/" className="mobile-brand">
              <span className="mobile-brand-text">Church Portal</span>
            </Link>

            {/* User Dropdown (Mobile) */}
            {isAuthenticated && (
              <div className="mobile-user-wrapper">
                <button
                  className="mobile-user-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  aria-label="User menu"
                >
                  <div className="user-avatar-sm">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Mobile User Dropdown */}
                {isUserMenuOpen && (
                  <div className="user-dropdown mobile-user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-lg">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="user-info">
                        <span className="user-fullname">{user?.firstName} {user?.lastName}</span>
                        <span className="user-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/member" className="user-dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      My Dashboard
                    </Link>
                    {canAccessAdmin && (
                      <Link to="/admin" className="user-dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="user-dropdown-item logout">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="currentColor"/>
                <path d="M20 8L20 32M12 16L28 16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">Church Digital</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                className="nav-item-wrapper"
                onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={item.href}
                  className={`nav-item ${location.pathname === item.href ? 'active' : ''}`}
                >
                  {item.label}
                  {item.children && (
                    <svg className="dropdown-chevron" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.label && (
                  <div className="nav-dropdown">
                    <div className="dropdown-content">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="dropdown-item"
                        >
                          <span className="dropdown-item-label">{child.label}</span>
                          {child.description && (
                            <span className="dropdown-item-desc">{child.description}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions - Desktop Only */}
          <div className="nav-actions">
            {/* Search Button */}
            <button
              className="nav-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchOpen(true);
              }}
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {/* Auth Section */}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="nav-link-auth">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="user-menu-wrapper desktop-only" onClick={(e) => e.stopPropagation()}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="user-avatar">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="user-name-nav">{user?.firstName}</span>
                  <svg className="dropdown-chevron" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-lg">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="user-info">
                        <span className="user-fullname">{user?.firstName} {user?.lastName}</span>
                        <span className="user-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/member" className="user-dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      My Dashboard
                    </Link>
                    {canAccessAdmin && (
                      <Link to="/admin" className="user-dropdown-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="user-dropdown-item logout">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer - Slides from Left */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <nav 
          className="mobile-nav" 
          onClick={(e) => e.stopPropagation()}
        >
          {navigationItems.map((item) => (
            <div key={item.label} className="mobile-nav-group">
              <Link to={item.href} className="mobile-nav-item">
                {item.label}
              </Link>
              {item.children && (
                <div className="mobile-nav-children">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className="mobile-nav-child"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {!isAuthenticated && (
            <div className="mobile-auth-section">
              <Link to="/login" className="btn btn-secondary btn-lg mobile-auth-btn">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-lg mobile-auth-btn">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="search-overlay-content">
          <button
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sermons, articles, events..."
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search
            </button>
          </form>

          <div className="search-suggestions">
            <h4>Popular Searches</h4>
            <div className="suggestion-tags">
              <button onClick={() => setSearchQuery('faith')}>Faith</button>
              <button onClick={() => setSearchQuery('prayer')}>Prayer</button>
              <button onClick={() => setSearchQuery('family')}>Family</button>
              <button onClick={() => setSearchQuery('worship')}>Worship</button>
              <button onClick={() => setSearchQuery('hope')}>Hope</button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="nav-spacer" />
    </>
  );
};

export default PublicNavigation;
