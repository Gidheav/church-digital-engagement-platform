/**
 * Member Profile View
 * View and manage personal profile
 */

import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../shared/components/Card';

const MemberProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="welcome-section-pro">
        <h1 className="welcome-title">My Profile</h1>
        <p className="welcome-subtitle">View and manage your personal information</p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <Card title="Personal Information">
          <div className="info-grid-pro">
            <div className="info-item-pro">
              <span className="info-label">First Name</span>
              <span className="info-value">{user?.firstName}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Last Name</span>
              <span className="info-value">{user?.lastName}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Role</span>
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>
        </Card>

        <Card title="Account Status">
          <div className="info-grid-pro">
            <div className="info-item-pro">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Account Status</span>
              <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default MemberProfile;
