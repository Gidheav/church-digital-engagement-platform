/**
 * Member Sidebar Component
 * Professional navigation sidebar for church members
 * Matches Admin design but with member-specific menu items
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types/auth.types';
import {
  DashboardIcon,
  BookIcon,
  CalendarIcon,
  MessageCircleIcon,
  HeartIcon,
  UserIcon,
  SettingsIcon,
  GlobeIcon,
  HomeIcon,
  LogoutIcon,
  XIcon,
} from '../../shared/components/Icons';
import './MemberSidebar.css';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const memberNavigationItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: DashboardIcon },
  { id: 'sermons', label: 'Sermons & Teachings', icon: BookIcon },
  { id: 'events', label: 'Events & Activities', icon: CalendarIcon },
  { id: 'community', label: 'Community', icon: MessageCircleIcon },
  { id: 'prayer', label: 'Prayer Requests', icon: HeartIcon },
  { id: 'profile', label: 'My Profile', icon: UserIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const MemberSidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (view: string) => {
    onViewChange(view);
    onClose(); // Close mobile drawer after navigation
  };

  const getUserInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'M';
  };

  const canAccessAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="member-sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`member-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        <button className="sidebar-close-mobile" onClick={onClose} aria-label="Close menu">
          <XIcon size={20} />
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L3 9L16 16L29 9L16 2Z"
                fill="currentColor"
                opacity="0.8"
              />
              <path
                d="M16 30L3 23V9L16 16V30Z"
                fill="currentColor"
              />
              <path
                d="M16 30L29 23V9L16 16V30Z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
          </div>
          <div className="brand-info">
            <div className="brand-name">Member Portal</div>
            <div className="brand-subtitle">Church Community</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Navigation</div>
            {memberNavigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Context Switcher */}
          <div className="context-switcher">
            <button
              className="context-btn"
              onClick={() => navigate('/')}
              title="Public Site"
            >
              <GlobeIcon size={16} />
              <span>Public Site</span>
            </button>
            {canAccessAdmin && (
              <button
                className="context-btn"
                onClick={() => navigate('/admin')}
                title="Admin Dashboard"
              >
                <HomeIcon size={16} />
                <span>Admin Area</span>
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="sidebar-user">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">Member</div>
            </div>
            <button
              className="user-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MemberSidebar;
