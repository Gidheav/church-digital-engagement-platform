/**
 * Member Top Bar Component
 * Professional header with mobile hamburger, theme toggle, user menu
 * Matches Admin design but with member-specific actions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  SunIcon,
  MoonIcon,
  MenuIcon,
  BellIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  ChevronDownIcon
} from '../../shared/components/Icons';
import './MemberTopBar.css';

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

const MemberTopBar: React.FC<TopBarProps> = ({
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
    const savedTheme = localStorage.getItem('member-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const themeValue = newTheme ? 'dark' : 'light';
    localStorage.setItem('member-theme', themeValue);
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
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user) return 'M';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return 'M';
  };

  return (
    <header className="member-topbar">
      <div className="topbar-container">
        {/* Left Side */}
        <div className="topbar-left">
          {/* Mobile Menu Button */}
          <button 
            className="topbar-menu-btn" 
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <MenuIcon size={20} />
          </button>

          {/* Title/Breadcrumbs */}
          <div className="topbar-title-section">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="breadcrumbs" aria-label="Breadcrumb">
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
            ) : (
              <>
                {title && <h1 className="topbar-title">{title}</h1>}
                {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
              </>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="topbar-right">
          {/* Custom Actions */}
          {actions && <div className="topbar-actions">{actions}</div>}

          {/* Theme Toggle */}
          <button 
            className="topbar-icon-btn" 
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {/* Notifications */}
          <div className="topbar-dropdown" ref={notifMenuRef}>
            <button 
              className="topbar-icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <BellIcon size={18} />
            </button>

            {showNotifications && (
              <div className="dropdown-menu notifications-menu">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notifications-list">
                  <div className="notification-empty">
                    <BellIcon size={32} />
                    <p>No new notifications</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="topbar-dropdown" ref={userMenuRef}>
            <button
              className="topbar-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-small">
                {getUserInitials()}
              </div>
              <span className="user-name-desktop">{user?.firstName}</span>
              <ChevronDownIcon size={16} />
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                <div className="user-menu-header">
                  <div className="user-avatar-large">
                    {getUserInitials()}
                  </div>
                  <div className="user-menu-info">
                    <div className="user-menu-name">{user?.firstName} {user?.lastName}</div>
                    <div className="user-menu-email">{user?.email}</div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item" onClick={() => navigate('/member')}>
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </button>

                <button className="dropdown-item" onClick={() => navigate('/member')}>
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
      </div>
    </header>
  );
};

export default MemberTopBar;
