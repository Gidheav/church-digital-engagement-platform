/**
 * Interaction Moderation - Enterprise Edition
 * Professional moderation interface matching Dashboard quality
 */

import React, { useState, useEffect, useMemo } from 'react';
import interactionService, { Interaction, InteractionStats } from '../services/interaction.service';
import { useConfirm } from '../contexts/ConfirmContext';
import DataTable, { Column, StatusBadge, ActionMenu } from './components/DataTable';
import { Card } from './components/Card';
import InteractionDetailModal from './InteractionDetailModal';
import {
  MessageCircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FilterIcon,
  RefreshIcon,
  EyeIcon,
  CheckIcon,
  EyeOffIcon,
  XIcon,
  DeleteIcon,
  DownloadIcon,
} from './components/Icons';
import './styles/InteractionModeration.pro.css';
import './styles/ContentManager.css';

type TabType = 'questions' | 'comments' | 'flagged';
type StatusFilterType = '' | 'OPEN' | 'ANSWERED' | 'CLOSED' | 'PENDING' | 'REVIEWED';

const InteractionModeration: React.FC = () => {
  const { confirm } = useConfirm();
  
  // Data state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filter state
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter, refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsData = await interactionService.getStats();
      setStats(statsData);

      // Load interactions based on active tab
      let filters: any = {};
      
      if (activeTab === 'questions') {
        filters = { is_question: true };
      } else if (activeTab === 'flagged') {
        filters = { is_flagged: true };
      } else {
        filters = { type: 'COMMENT' };
      }

      if (statusFilter) {
        filters.status = statusFilter;
      }

      const data = await interactionService.getAll(filters);
      setInteractions(data.results || []);
    } catch (err: any) {
      console.error('Failed to load interactions:', err);
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleApprove = async (interaction: Interaction) => {
    try {
      await interactionService.markReviewed(interaction.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleHide = async (interaction: Interaction) => {
    confirm({
      title: 'Hide Interaction',
      message: 'Are you sure you want to hide this interaction from public view?',
      confirmLabel: 'Hide',
      cancelLabel: 'Cancel',
      variant: 'primary',
      onConfirm: async () => {
        try {
          await interactionService.hide(interaction.id);
          await loadData();
        } catch (err: any) {
          alert(err.response?.data?.error || 'Failed to hide');
        }
      },
    });
  };

  const handleDelete = async (interaction: Interaction) => {
    confirm({
      title: 'Delete Interaction',
      message: 'Are you sure you want to delete this interaction? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await interactionService.delete(interaction.id);
          await loadData();
        } catch (err: any) {
          alert(err.response?.data?.error || 'Failed to delete');
        }
      },
    });
  };

  const handleClose = async (interaction: Interaction) => {
    try {
      await interactionService.close(interaction.id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close');
    }
  };


  // Calculate tab stats
  const tabStats = useMemo(() => {
    if (!stats) return { questions: 0, comments: 0, flagged: 0 };
    return {
      questions: stats.unanswered_questions + stats.answered_questions,
      comments: stats.total_comments,
      flagged: stats.flagged_pending + stats.flagged_reviewed,
    };
  }, [stats]);

  // DataTable columns
  const columns: Column<Interaction>[] = [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '10%',
      render: (value) => {
        const typeMap: Record<string, { variant: any; label: string }> = {
          QUESTION: { variant: 'info', label: 'Question' },
          COMMENT: { variant: 'default', label: 'Comment' },
          FLAGGED: { variant: 'danger', label: 'Flagged' },
        };
        const typeInfo = typeMap[value] || { variant: 'default', label: value };
        return <StatusBadge status={typeInfo.label} variant={typeInfo.variant} />;
      },
    },
    {
      key: 'content',
      label: 'Content',
      sortable: false,
      width: '30%',
      render: (value) => {
        const truncated = value.length > 100 ? value.substring(0, 100) + '...' : value;
        return (
          <div className="content-preview-cell">
            <p className="content-text">{truncated}</p>
          </div>
        );
      },
    },
    {
      key: 'user',
      label: 'Raised By',
      sortable: true,
      width: '15%',
      render: (value) => (
        <div className="user-cell-pro">
          <div className="user-name">{value.first_name} {value.last_name}</div>
          <div className="user-email">{value.email}</div>
        </div>
      ),
    },
    {
      key: 'post',
      label: 'Post',
      sortable: false,
      width: '20%',
      render: (value) => (
        <div className="post-cell">
          <div className="post-title">{value.title}</div>
          <div className="post-author">by {value.author_name}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '12%',
      align: 'center',
      render: (value) => {
        const statusMap: Record<string, { variant: any; label: string }> = {
          OPEN: { variant: 'warning', label: 'Pending' },
          PENDING: { variant: 'warning', label: 'Pending' },
          ANSWERED: { variant: 'success', label: 'Answered' },
          REVIEWED: { variant: 'success', label: 'Reviewed' },
          CLOSED: { variant: 'default', label: 'Closed' },
          ACTIONED: { variant: 'success', label: 'Actioned' },
        };
        const status = statusMap[value] || { variant: 'default', label: value };
        return <StatusBadge status={status.label} variant={status.variant} />;
      },
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      width: '13%',
      render: (value) => {
        const date = new Date(value);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        
        return date.toLocaleDateString();
      },
    },
  ];

  const renderActions = (row: Interaction) => {
    const actions = [
      {
        label: 'View Details',
        icon: <EyeIcon size={16} />,
        onClick: () => setSelectedInteraction(row),
      },
      {
        label: 'Approve',
        icon: <CheckIcon size={16} />,
        onClick: () => handleApprove(row),
      },
      {
        label: row.is_hidden ? 'Unhide' : 'Hide',
        icon: <EyeOffIcon size={16} />,
        onClick: () => handleHide(row),
      },
    ];

    if (row.is_question) {
      actions.push({
        label: 'Close',
        icon: <XIcon size={16} />,
        onClick: () => handleClose(row),
      });
    }

    actions.push({
      label: 'Delete',
      icon: <DeleteIcon size={16} />,
      onClick: () => handleDelete(row),
    });

    return <ActionMenu actions={actions} />;
  };

  return (
    <div className="content-manager-pro">
      {/* Page Header */}
      <div className="page-header-pro">
        <div className="page-title-section">
          <h1 className="page-title">Interaction Moderation</h1>
          <p className="page-subtitle">
            Moderate comments, questions, and flagged content
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-pro" onClick={handleRefresh}>
            <RefreshIcon size={18} />
            <span>Refresh</span>
          </button>
          <button className="btn-secondary-pro">
            <DownloadIcon size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="stats-row-pro">
        <Card 
          className={`stat-mini-card ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <div className="stat-mini-icon questions">
            <MessageCircleIcon size={20} />
          </div>
          <div className="stat-mini-content">
            <div className="stat-mini-label">Questions</div>
            <div className="stat-mini-value">{stats?.unanswered_questions || 0}</div>
            <div className="stat-mini-sublabel">pending</div>
          </div>
        </Card>
        
        <Card 
          className={`stat-mini-card ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <div className="stat-mini-icon answered">
            <CheckCircleIcon size={20} />
          </div>
          <div className="stat-mini-content">
            <div className="stat-mini-label">Answered</div>
            <div className="stat-mini-value">{stats?.answered_questions || 0}</div>
            <div className="stat-mini-sublabel">questions</div>
          </div>
        </Card>
        
        <Card 
          className={`stat-mini-card ${activeTab === 'flagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('flagged')}
        >
          <div className="stat-mini-icon flagged">
            <AlertCircleIcon size={20} />
          </div>
          <div className="stat-mini-content">
            <div className="stat-mini-label">Flagged</div>
            <div className="stat-mini-value">{stats?.flagged_pending || 0}</div>
            <div className="stat-mini-sublabel">pending</div>
          </div>
        </Card>
        
        <Card 
          className={`stat-mini-card ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <div className="stat-mini-icon comments">
            <MessageCircleIcon size={20} />
          </div>
          <div className="stat-mini-content">
            <div className="stat-mini-label">Comments</div>
            <div className="stat-mini-value">{stats?.total_comments || 0}</div>
            <div className="stat-mini-sublabel">total</div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="tabs-pro">
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions ({tabStats.questions})
        </button>
        <button
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments ({tabStats.comments})
        </button>
        <button
          className={`tab-btn ${activeTab === 'flagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('flagged')}
        >
          Flagged Content ({tabStats.flagged})
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row-pro">
        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="OPEN">Pending</option>
            <option value="ANSWERED">Answered</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={interactions}
        columns={columns}
        actions={renderActions}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search by content, user, or post..."
        emptyMessage="No interactions found"
      />

      {/* Interaction Detail Modal */}
      {selectedInteraction && (
        <InteractionDetailModal
          interactionId={selectedInteraction.id}
          onClose={() => setSelectedInteraction(null)}
          onUpdate={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default InteractionModeration;
