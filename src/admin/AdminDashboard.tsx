/**
 * Admin Dashboard - Enterprise Edition
 * Production-ready professional admin interface
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/auth.types';
import { adminContentService } from '../services/admin-content.service';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Page Components
import ContentManager from './ContentManager';
import UserManager from './UserManager';
import InteractionModeration from './InteractionModeration';
import InteractionDetailModal from './InteractionDetailModal';
import EmailCampaigns from './EmailCampaigns';
import ModerationReports from './ModerationReports';
import AppSettings from './AppSettings';

// UI Components
import { Card } from './components/Card';
import {
  ContentIcon,
  UsersIcon,
  MessageCircleIcon,
  MailIcon,
  ChartBarIcon,
  ArrowRightIcon
} from './components/Icons';

// Styles
import './styles/theme.modern.css';
import './styles/AdminDashboard.pro.css';

import { Interaction } from '../services/interaction.service';

type AdminView = 'overview' | 'content' | 'users' | 'moderation' | 'email' | 'reports' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewChange = (view: string) => {
    const adminView = view as AdminView;
    
    // Role-based access control
    if (adminView === 'settings' && user?.role !== UserRole.ADMIN) {
      alert('Access Denied – Admins Only');
      return;
    }
    
    if (adminView === 'users' && user?.role !== UserRole.ADMIN) {
      alert('Access Denied – Admins Only');
      return;
    }
    
    setActiveView(adminView);
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

  const renderView = () => {
    switch (activeView) {
      case 'content':
        return <ContentManager />;
        
      case 'users':
        if (user?.role !== UserRole.ADMIN) {
          return (
            <div className="access-denied-pro">
              <Card>
                <div className="denied-content">
                  <div className="denied-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <h3>Access Denied</h3>
                  <p>This section is only accessible to administrators.</p>
                </div>
              </Card>
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
        if (user?.role !== UserRole.ADMIN) {
          return (
            <div className="access-denied-pro">
              <Card>
                <div className="denied-content">
                  <div className="denied-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <h3>Access Denied</h3>
                  <p>App Settings are only accessible to administrators.</p>
                </div>
              </Card>
            </div>
          );
        }
        return <AppSettings />;
        
      default:
        return <DashboardOverview userRole={user?.role || UserRole.MEMBER} onNavigate={handleViewChange} />;
    }
  };

  return (
    <AdminLayout activeView={activeView} onViewChange={handleViewChange}>
      {renderView()}
      
      {selectedInteraction && (
        <InteractionDetailModal
          interactionId={selectedInteraction.id}
          onClose={handleCloseModal}
          onUpdate={handleModalUpdate}
        />
      )}
    </AdminLayout>
  );
};

// Dashboard Overview Component
interface DashboardOverviewProps {
  userRole: UserRole;
  onNavigate: (view: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userRole, onNavigate }) => {
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
            <Card key={action.id} className="action-card-pro" onClick={() => onNavigate(action.id)}>
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
    </div>
  );
};

export default AdminDashboard;
