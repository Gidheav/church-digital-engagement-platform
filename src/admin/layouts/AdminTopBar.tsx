/**
 * Admin Top Bar - Enterprise Edition
 * Professional header with mobile hamburger, breadcrumbs, theme toggle, user menu
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  BellIcon,
  SearchIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  ChevronDownIcon
} from '../components/Icons';
import './AdminTopBar.css';

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface TopBarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  onMenuClick?: () => void; // Mobile hamburger
}

const AdminTopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onMenuClick
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    localStorage.setItem('admin-theme', themeValue);
    document.documentElement.setAttribute('data-theme', themeValue);
  };

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <header className="admin-topbar-pro">
      <div className="topbar-left">
        {/* Mobile Hamburger */}
        {onMenuClick && (
          <button
            className="topbar-hamburger"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <MenuIcon size={24} />
          </button>
        )}

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="topbar-breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {crumb.onClick ? (
                  <button className="breadcrumb-link" onClick={crumb.onClick}>
                    {crumb.label}
                  </button>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title */}
        {title && (
          <div className="topbar-title-block">
            <h1 className="topbar-title">{title}</h1>
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="topbar-right">
        {/* Custom Actions */}
        {actions && <div className="topbar-custom-actions">{actions}</div>}

        {/* Search Button */}
        <button
          className="topbar-icon-btn"
          aria-label="Search"
          title="Search (Cmd+K)"
        >
          <SearchIcon size={20} />
        </button>

        {/* Notifications */}
        <div className="topbar-dropdown" ref={notifMenuRef}>
          <button
            className="topbar-icon-btn topbar-notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <BellIcon size={20} />
            <span className="notif-badge">3</span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu dropdown-notif">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="link-btn-sm">Mark all read</button>
              </div>
              <div className="notif-list">
                <div className="notif-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-content">
                    <p className="notif-title">New comment awaiting moderation</p>
                    <p className="notif-time">5 minutes ago</p>
                  </div>
                </div>
                <div className="notif-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-content">
                    <p className="notif-title">New member registration</p>
                    <p className="notif-time">1 hour ago</p>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-content">
                    <p className="notif-title">System backup completed</p>
                    <p className="notif-time">3 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="dropdown-footer">
                <button className="link-btn-block">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>

        {/* User Menu */}
        <div className="topbar-dropdown" ref={userMenuRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="user-avatar-sm">{getUserInitials()}</div>
            <span className="user-name-desktop">{user?.firstName || 'User'}</span>
            <ChevronDownIcon size={16} />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu dropdown-user">
              <div className="dropdown-user-info">
                <div className="user-avatar-lg">{getUserInitials()}</div>
                <div className="user-details">
                  <p className="user-name">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || 'User'}</p>
                  <p className="user-email">{user?.email || 'user@example.com'}</p>
                  <p className="user-role-badge">{user?.role || 'User'}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => navigate('/admin/profile')}>
                <UserIcon size={16} />
                <span>Profile</span>
              </button>
              <button className="dropdown-item" onClick={() => navigate('/admin/settings')}>
                <SettingsIcon size={16} />
                <span>Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOutIcon size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
