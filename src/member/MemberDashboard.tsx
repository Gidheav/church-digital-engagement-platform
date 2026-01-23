/**
 * Member Dashboard
 * 
 * Main dashboard for church members.
 */

import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/auth.types';
import '../styles/Dashboard.css';

const MemberDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const canAccessAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <h1>Member Portal</h1>
          <div className="nav-actions">
            {canAccessAdmin ? (
              <button 
                onClick={() => navigate('/admin')}
                className="btn-admin-switch"
                title="Switch to Admin Dashboard"
              >
                🔧 Admin Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="btn-admin-switch"
                title="Go to Public Site"
              >
                🌐 Public Site
              </button>
            )}
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="welcome-section">
            <h2>Welcome, {user?.firstName}!</h2>
            <p className="subtitle">Good to see you today</p>
          </section>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">📖</div>
              <h3>Latest Sermons</h3>
              <p>Browse recent messages and teachings</p>
              <button className="btn-card">View Sermons</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">📅</div>
              <h3>Upcoming Events</h3>
              <p>Stay updated with church activities</p>
              <button className="btn-card">View Events</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">💬</div>
              <h3>Community</h3>
              <p>Engage with fellow members</p>
              <button className="btn-card">Join Discussions</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">👤</div>
              <h3>My Profile</h3>
              <p>Update your information</p>
              <button className="btn-card">Edit Profile</button>
            </div>
          </div>

          <section className="info-section">
            <h3>Your Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{user?.role}</span>
              </div>
              <div className="info-item">
                <label>Member Since:</label>
                <span>{user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
