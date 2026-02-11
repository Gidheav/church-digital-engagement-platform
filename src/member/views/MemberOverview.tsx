/**
 * Member Overview View
 * Main dashboard home page for members
 */

import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../shared/components/Card';
import {
  BookIcon,
  CalendarIcon,
  MessageCircleIcon,
  HeartIcon,
  ArrowRightIcon,
} from '../../shared/components/Icons';

interface MemberOverviewProps {
  onViewChange: (view: string) => void;
}

const MemberOverview: React.FC<MemberOverviewProps> = ({ onViewChange }) => {
  const { user } = useAuth();

  const stats = [
    { id: 1, label: 'New Sermons', value: '3', change: '+2 this week', icon: <BookIcon size={24} />, color: '#2268f5' },
    { id: 2, label: 'Upcoming Events', value: '5', change: '+1 this month', icon: <CalendarIcon size={24} />, color: '#10b981' },
    { id: 3, label: 'Unread Messages', value: '2', change: 'New today', icon: <MessageCircleIcon size={24} />, color: '#f59e0b' },
    { id: 4, label: 'Prayer Requests', value: '8', change: '3 this week', icon: <HeartIcon size={24} />, color: '#ef4444' },
  ];

  const quickActions = [
    {
      id: 'sermons',
      label: 'Sermons & Teachings',
      description: 'Browse recent messages, watch videos, and grow spiritually',
      icon: <BookIcon size={24} />,
    },
    {
      id: 'events',
      label: 'Events & Activities',
      description: 'Stay updated with church events and register for activities',
      icon: <CalendarIcon size={24} />,
    },
    {
      id: 'community',
      label: 'Community Discussion',
      description: 'Engage with fellow members and join conversations',
      icon: <MessageCircleIcon size={24} />,
    },
    {
      id: 'prayer',
      label: 'Prayer Requests',
      description: 'Share your prayer needs and pray for others',
      icon: <HeartIcon size={24} />,
    },
  ];

  return (
    <div className="dashboard-pro">
      {/* Stats Grid */}
      <div className="stats-grid-pro">
        {stats.map(stat => (
          <Card key={stat.id} className="stat-card-pro">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change positive">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-pro">
        <h2 className="section-title-pro">Quick Actions</h2>
        <div className="actions-grid-pro">
          {quickActions.map(action => (
            <Card key={action.id} className="action-card-pro" onClick={() => onViewChange(action.id)}>
              <div className="action-icon-pro">{action.icon}</div>
              <h3 className="action-title-pro">{action.label}</h3>
              <p className="action-desc-pro">{action.description}</p>
              <div className="action-arrow-pro">
                <ArrowRightIcon size={20} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Account Information */}
      <div className="section-pro">
        <Card title="Your Account Information" subtitle="Manage your profile and preferences">
          <div className="info-grid-pro">
            <div className="info-item-pro">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Role</span>
              <span className="role-badge">{user?.role}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Status</span>
              <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemberOverview;
