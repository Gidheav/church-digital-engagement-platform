/**
 * PublicNavigation Component - Public Facing
 *
 * Static, client-rendered global header for non-member users.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './PublicNavigation.css';

const navItems = [
  'Sermons',
  'Articles',
  'Discipleship',
  'Events',
  'Announcements',
];

const PublicNavigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(navItems[0]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDashboard = () => {
    navigate('/member');
    setIsUserMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isMoreMenuOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen, isUserMenuOpen]);

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

  const handleNavClick = (label: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveItem(label);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="public-navigation-wrapper">
      <header className="public-nav" role="banner">
        <nav className="nav-shell" aria-label="Primary">
          <Link className="nav-brand-fixed" to="/" aria-label="Home">
            <span className="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="currentColor" />
                <path d="M20 8L20 32M12 16L28 16" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </Link>

          <div className="nav-links">
            {navItems.slice(0, 2).map((item: string) => (
              <a
                key={item}
                href="#"
                className={`nav-link nav-priority-${navItems.indexOf(item) + 1} ${activeItem === item ? 'active' : ''}`}
                onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(item, event)}
              >
                {item}
              </a>
            ))}
            {navItems.slice(2, 3).map((item: string) => (
              <a
                key={item}
                href="#"
                className={`nav-link nav-priority-3 ${activeItem === item ? 'active' : ''}`}
                onClick={(event) => handleNavClick(item, event)}
              >
                {item}
              </a>
            ))}
            {navItems.slice(3).map((item) => (
              <a
                key={item}
                href="#"
                className={`nav-link nav-priority-4 ${activeItem === item ? 'active' : ''}`}
                onClick={(event) => handleNavClick(item, event)}
              >
                {item}
              </a>
            ))}
            <div className="more-menu" ref={moreMenuRef}>
              <button
                className="more-button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                aria-label="More menu"
                aria-expanded={isMoreMenuOpen}
              >
                More
                <svg className="more-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {isMoreMenuOpen && (
                <div className="more-dropdown">
                  {navItems.slice(2).map((item) => (
                    <a
                      key={item}
                      href="#"
                      className={`more-dropdown-item ${activeItem === item ? 'active' : ''}`}
                      onClick={(event) => {
                        handleNavClick(item, event);
                        setIsMoreMenuOpen(false);
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="nav-right">
            <div className="nav-actions">
              <div className="search-box" role="search">
                <svg className="search-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search"
                  className="search-box-input"
                  aria-label="Search resources"
                />
              </div>
            </div>

          {isAuthenticated && user ? (
            <div className="user-menu-fixed" ref={userMenuRef}>
              <button
                className="user-avatar"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="avatar-initials">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item" onClick={handleDashboard}>
                    Dashboard
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-login-fixed">
              Login
            </Link>
          )}

            <button
              className={`nav-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="nav-toggle-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`nav-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      >
        <aside className="nav-drawer" onClick={(event) => event.stopPropagation()}>
          <div className="drawer-header">
            <span className="drawer-title">Menu</span>
          </div>

          <div className="drawer-search" role="search">
            <svg className="drawer-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="search" placeholder="Search sermons, articles, events" aria-label="Search resources" />
          </div>

          <div className="drawer-links">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className={`drawer-link ${activeItem === item ? 'active' : ''}`}
                onClick={(event) => {
                  handleNavClick(item, event);
                  closeMobileMenu();
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </aside>
      </div>

      <div className="nav-spacer" />
    </div>
  );
};

export default PublicNavigation;
