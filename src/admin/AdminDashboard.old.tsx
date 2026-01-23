/**
 * Admin Dashboard
 * 
 * Main dashboard for church administrators with navigation to all admin features.
 */

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/auth.types';
import ContentManager from './ContentManager';
import UserManager from './UserManager';
import InteractionModeration from './InteractionModeration';
import InteractionDetailModal from './InteractionDetailModal';
import { Interaction } from '../services/interaction.service';
import EmailCampaigns from './EmailCampaigns';
import ModerationReports from './ModerationReports';
import AppSettings from './AppSettings';
import '../styles/Dashboard.css';
import '../styles/AdminDashboard.css';

type AdminView = 'overview' | 'content' | 'users' | 'moderation' | 'email' | 'reports' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewInteraction = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
  };

  const handleCloseModal = () => {
    setSelectedInteraction(null);
  };

  const handleModalUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle view navigation with role checking
  const handleViewChange = (view: AdminView) => {
    // Check if trying to access settings without admin role
    if (view === 'settings' && user?.role !== UserRole.ADMIN) {
      alert('Access Denied – Admins Only');
      return;
    }
    
    // Check if trying to access users without admin role
    if (view === 'users' && user?.role !== UserRole.ADMIN) {
      alert('Access Denied – Admins Only');
      return;
    }
    
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'content':
        return <ContentManager />;
      case 'users':
        // Double-check role before rendering (defensive)
        if (user?.role !== UserRole.ADMIN) {
          return (
            <div className="access-denied">
              <h3>Access Denied</h3>
              <p>This section is only accessible to administrators.</p>
            </div>
          );
        }
        return <UserManager />;
      case 'moderation':
        return <InteractionModeration key={refreshTrigger} onViewDetails={handleViewInteraction} />;
      case 'email':
        return <EmailCampaigns />;
      case 'reports':
        return <ModerationReports />;
      case 'settings':
        // Double-check role before rendering (defensive)
        if (user?.role !== UserRole.ADMIN) {
          return (
            <div className="access-denied">
              <h3>Access Denied</h3>
              <p>App Settings are only accessible to administrators.</p>
            </div>
          );
        }
        return <AppSettings />;
      default:
        return (
          <div className="admin-overview">
            <section className="welcome-section">
              <h2>Administrator Dashboard</h2>
              <p className="subtitle">Manage your church platform</p>
            </section>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Total Posts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Pending Questions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Email Campaigns</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => handleViewChange('content')}>
                <div className="card-icon">📄</div>
                <h3>Content Management</h3>
                <p>Create and manage sermons, articles, and announcements</p>
                <button className="btn-card">Manage Content</button>
              </div>

              {user?.role === UserRole.ADMIN && (
                <div className="dashboard-card" onClick={() => handleViewChange('users')}>
                  <div className="card-icon">👥</div>
                  <h3>User Management</h3>
                  <p>Manage member accounts, roles, and permissions</p>
                  <button className="btn-card">Manage Users</button>
                </div>
              )}

              <div className="dashboard-card" onClick={() => handleViewChange('moderation')}>
                <div className="card-icon">💬</div>
                <h3>Interaction Moderation</h3>
                <p>Moderate comments, reactions, and questions</p>
                <button className="btn-card">View Moderation</button>
              </div>

              <div className="dashboard-card" onClick={() => handleViewChange('email')}>
                <div className="card-icon">✉️</div>
                <h3>Email Campaigns</h3>
                <p>Create and send bulk email campaigns</p>
                <button className="btn-card">Manage Emails</button>
              </div>

              <div className="dashboard-card" onClick={() => handleViewChange('reports')}>
                <div className="card-icon">🛡️</div>
                <h3>Reports & Audit Logs</h3>
                <p>View user reports and system activity logs</p>
                <button className="btn-card">View Reports</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1>Admin Portal</h1>
          <span className="admin-badge">{user?.role || 'ADMIN'}</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => handleViewChange('overview')}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${activeView === 'content' ? 'active' : ''}`}
            onClick={() => handleViewChange('content')}
          >
            <span className="nav-icon">📄</span>
            Content
          </button>
          {user?.role === UserRole.ADMIN && (
            <button
              className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => handleViewChange('users')}
            >
              <span className="nav-icon">👥</span>
              Users
            </button>
          )}
          <button
            className={`nav-item ${activeView === 'moderation' ? 'active' : ''}`}
            onClick={() => handleViewChange('moderation')}
          >
            <span className="nav-icon">💬</span>
            Moderation
          </button>
          <button
            className={`nav-item ${activeView === 'email' ? 'active' : ''}`}
            onClick={() => handleViewChange('email')}
          >
            <span className="nav-icon">✉️</span>
            Email Campaigns
          </button>
          <button
            className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => handleViewChange('reports')}
          >
            <span className="nav-icon">🛡️</span>
            Reports
          </button>
          {user?.role === UserRole.ADMIN && (
            <button
              className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => handleViewChange('settings')}
            >
              <span className="nav-icon">⚙️</span>
              App Settings
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="context-switch-section">
            <button 
              onClick={() => navigate('/')}
              className="context-switch-link"
              title="Go to Public Site"
            >
              <span className="context-icon">🌐</span>
              <span>Public Site</span>
            </button>
            <button 
              onClick={() => navigate('/member')}
              className="context-switch-link"
              title="Go to Member Dashboard"
            >
              <span className="context-icon">🏠</span>
              <span>Member Dashboard</span>
            </button>
          </div>
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        {renderView()}
      </main>

      {/* Interaction Detail Modal */}
      {selectedInteraction && (
        <InteractionDetailModal
          interactionId={selectedInteraction.id}
          onClose={handleCloseModal}
          onUpdate={handleModalUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
