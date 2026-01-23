/**
 * Admin Sidebar Component
 * Professional enterprise sidebar navigation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types/auth.types';
import './AdminSidebar.css';

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { id: 'content', label: 'Content', icon: '📝', roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { id: 'users', label: 'Users', icon: '👥', roles: [UserRole.ADMIN] },
    { id: 'moderation', label: 'Moderation', icon: '🛡️', roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { id: 'email', label: 'Email Campaigns', icon: '📧', roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { id: 'reports', label: 'Reports', icon: '📈', roles: [UserRole.ADMIN, UserRole.MODERATOR] },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: [UserRole.ADMIN] },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar-modern">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">✝</div>
        <div className="brand-text">
          <div className="brand-name">Church Admin</div>
          <div className="brand-subtitle">Management Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">
        <div className="nav-section">
          <div className="nav-section-label">Main</div>
          {navigationItems.filter(item => item.roles.includes(user?.role as UserRole)).map(item => (
            <button
              key={item.id}
              className={`nav-button ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-button-icon">{item.icon}</span>
              <span className="nav-button-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer-modern">
        {/* Context Switcher */}
        <div className="context-switcher">
          <button
            className="context-link"
            onClick={() => navigate('/')}
            title="Public Site"
          >
            <span className="context-icon">🌐</span>
            <span className="context-label">Public Site</span>
          </button>
          <button
            className="context-link"
            onClick={() => navigate('/member')}
            title="Member Dashboard"
          >
            <span className="context-icon">🏠</span>
            <span className="context-label">Member Area</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button className="btn-logout-modern" onClick={handleLogout}>
          <span>Logout</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
