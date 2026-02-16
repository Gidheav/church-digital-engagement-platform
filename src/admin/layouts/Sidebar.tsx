/**
 * Professional Admin Sidebar
 * Enterprise-grade navigation with mobile drawer
 * NO EMOJIS - Professional SVG icons only
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types/auth.types';
import {
  DashboardIcon,
  ContentIcon,
  UsersIcon,
  ModerationIcon,
  EmailIcon,
  ReportsIcon,
  SettingsIcon,
  GlobeIcon,
  HomeIcon,
  LogoutIcon,
  XIcon,
  FolderIcon,
} from '../components/Icons';
import './Sidebar.css';
import '../styles/theme.modern.css';

interface SidebarProps {
  activeView: string;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: DashboardIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'content', label: 'Content', icon: ContentIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'series', label: 'Series', icon: FolderIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'users', label: 'Users', icon: UsersIcon, roles: [UserRole.ADMIN] },
  { id: 'moderation', label: 'Moderation', icon: ModerationIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'email', label: 'Email Campaigns', icon: EmailIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'reports', label: 'Reports', icon: ReportsIcon, roles: [UserRole.ADMIN, UserRole.MODERATOR] },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: [UserRole.ADMIN] },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (view: string) => {
    // Navigate to the admin sub-route
    const path = view === 'overview' ? '/admin' : `/admin/${view}`;
    navigate(path);
    onClose(); // Close mobile drawer after navigation
  };

  const getUserInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar-pro ${isOpen ? 'open' : ''}`}>
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
            <div className="brand-name">Church Admin</div>
            <div className="brand-subtitle">Management Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Navigation</div>
            {navigationItems
              .filter(item => item.roles.includes(user?.role as UserRole))
              .map(item => {
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
            <button
              className="context-btn"
              onClick={() => navigate('/member')}
              title="Member Area"
            >
              <HomeIcon size={16} />
              <span>Member Area</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="sidebar-user">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>

          {/* Logout */}
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIcon size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
