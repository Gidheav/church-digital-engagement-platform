/**
 * Dashboard Overview Component
 * Main dashboard view with stats and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/auth.types';
import { adminContentService } from '../services/admin-content.service';
import { Card } from './components/Card';
import {
  ContentIcon,
  UsersIcon,
  MessageCircleIcon,
  MailIcon,
  ChartBarIcon,
  ArrowRightIcon
} from './components/Icons';
import DraftsWidget from '../components/DraftsWidget';
import './styles/theme.modern.css';
import './styles/AdminDashboard.pro.css';

interface DashboardOverviewProps {
  userRole: UserRole;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const postsData = await adminContentService.getPosts();
        
        // Handle paginated response (results array) or direct array
        let postCount = 0;
        if (Array.isArray(postsData)) {
          postCount = postsData.length;
        } else if (postsData && typeof postsData === 'object') {
          // Check if it's a paginated response
          if ('results' in postsData) {
            postCount = (postsData as any).results.length;
          } else if ('count' in postsData) {
            postCount = (postsData as any).count;
          } else {
            console.warn('Unexpected response structure:', postsData);
          }
        }
        
        setTotalPosts(postCount);
        console.log('Total posts fetched:', postCount);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { id: 1, label: 'Total Posts', value: loading ? '...' : String(totalPosts), change: '+0%', icon: <ContentIcon size={24} />, color: '#2268f5' },
    { id: 2, label: 'Active Members', value: '0', change: '+0%', icon: <UsersIcon size={24} />, color: '#10b981' },
    { id: 3, label: 'Pending Questions', value: '0', change: '+0%', icon: <MessageCircleIcon size={24} />, color: '#f59e0b' },
    { id: 4, label: 'Email Campaigns', value: '0', change: '+0%', icon: <MailIcon size={24} />, color: '#2268f5' },
  ];

  const quickActions = [
    { 
      id: 'content', 
      label: 'Content Management', 
      icon: <ContentIcon size={24} />, 
      description: 'Create and manage sermons, articles, and announcements', 
      roles: [UserRole.ADMIN, UserRole.MODERATOR] 
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <UsersIcon size={24} />, 
      description: 'Manage member accounts, roles, and permissions', 
      roles: [UserRole.ADMIN] 
    },
    { 
      id: 'moderation', 
      label: 'Interaction Moderation', 
      icon: <MessageCircleIcon size={24} />, 
      description: 'Moderate comments, questions, and flags', 
      roles: [UserRole.ADMIN, UserRole.MODERATOR] 
    },
    { 
      id: 'email', 
      label: 'Email Campaigns', 
      icon: <MailIcon size={24} />, 
      description: 'Create and send bulk email campaigns', 
      roles: [UserRole.ADMIN, UserRole.MODERATOR] 
    },
    { 
      id: 'reports', 
      label: 'Reports & Audit Logs', 
      icon: <ChartBarIcon size={24} />, 
      description: 'View user reports and system activity', 
      roles: [UserRole.ADMIN, UserRole.MODERATOR] 
    },
  ];

  const handleNavigate = (actionId: string) => {
    navigate(`/admin/${actionId}`);
  };

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
          {quickActions.filter(action => action.roles.includes(userRole)).map(action => (
            <Card key={action.id} className="action-card-pro" onClick={() => handleNavigate(action.id)}>
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

      {/* Recent Drafts Widget */}
      <div className="section-pro">
        <DraftsWidget />
      </div>
    </div>
  );
};

export default DashboardOverview;
