/**
 * InteractionModeration Component
 * Displays and manages member interactions (comments, questions, flags)
 * Access: Moderators and Admins only
 */

import React, { useState, useEffect } from 'react';
import interactionService, { Interaction, InteractionStats } from '../services/interaction.service';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/auth.types';
import './InteractionModeration.css';

interface InteractionModerationProps {
  onViewDetails: (interaction: Interaction) => void;
}

const InteractionModeration: React.FC<InteractionModerationProps> = ({ onViewDetails }) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'flagged' | 'comments'>('questions');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load stats
      const statsData = await interactionService.getStats();
      setStats(statsData);

      // Load interactions based on active tab
      let filters = {};
      
      if (activeTab === 'questions') {
        filters = { is_question: true };
      } else if (activeTab === 'flagged') {
        filters = { is_flagged: true };
      } else {
        filters = { type: 'COMMENT' };
      }

      const data = await interactionService.getAll(filters);
      setInteractions(data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interactions');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id: string) => {
    try {
      await interactionService.markReviewed(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark as reviewed');
    }
  };

  const handleHide = async (id: string) => {
    if (!window.confirm('Hide this interaction from public view?')) return;
    
    try {
      await interactionService.hide(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to hide interaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this interaction? This action cannot be undone.')) return;
    
    try {
      await interactionService.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete interaction');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await interactionService.close(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close interaction');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'hide' | 'delete' | 'mark_reviewed') => {
    if (selectedIds.size === 0) {
      alert('Please select interactions first');
      return;
    }

    const actionNames = {
      hide: 'hide',
      delete: 'delete',
      mark_reviewed: 'mark as reviewed'
    };

    if (!window.confirm(`${actionNames[action]} ${selectedIds.size} interaction(s)?`)) return;

    try {
      await interactionService.bulkAction(Array.from(selectedIds), action);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${actionNames[action]} interactions`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPEN': return 'status-open';
      case 'ANSWERED': return 'status-answered';
      case 'CLOSED': return 'status-closed';
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'ACTIONED': return 'status-actioned';
      default: return 'status-default';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'QUESTION': return 'type-question';
      case 'FLAGGED': return 'type-flagged';
      case 'COMMENT': return 'type-comment';
      default: return 'type-default';
    }
  };

  const canModifyInteraction = (interaction: Interaction): boolean => {
    if (!user) return false;
    
    // Admin has full access
    if (user.role === UserRole.ADMIN) return true;
    
    // Moderator can only respond to questions on their own posts
    if (user.role === UserRole.MODERATOR) {
      return interaction.is_question && interaction.post.author === Number(user.id);
    }
    
    return false;
  };

  if (loading) {
    return <div className="loading">Loading interactions...</div>;
  }

  return (
    <div className="interaction-moderation">
      <div className="moderation-header">
        <h2>Interaction Moderation</h2>
        <button className="btn-refresh" onClick={loadData}>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-label">Unanswered Questions</div>
            <div className="stat-value">{stats.unanswered_questions}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Answered Questions</div>
            <div className="stat-value">{stats.answered_questions}</div>
          </div>
          {user?.role === UserRole.ADMIN && (
            <>
              <div className="stat-card flagged">
                <div className="stat-label">Flagged (Pending)</div>
                <div className="stat-value">{stats.flagged_pending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Comments</div>
                <div className="stat-value">{stats.total_comments}</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="moderation-tabs">
        <button
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions ({stats?.unanswered_questions || 0})
        </button>
        {user?.role === UserRole.ADMIN && (
          <button
            className={`tab ${activeTab === 'flagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('flagged')}
          >
            Flagged ({stats?.flagged_pending || 0})
          </button>
        )}
        <button
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          All Comments
        </button>
      </div>

      {/* Bulk Actions (Admin only) */}
      {user?.role === UserRole.ADMIN && selectedIds.size > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedIds.size} selected</span>
          <button className="btn-bulk" onClick={() => handleBulkAction('mark_reviewed')}>
            Mark Reviewed
          </button>
          <button className="btn-bulk" onClick={() => handleBulkAction('hide')}>
            Hide
          </button>
          <button className="btn-bulk btn-danger" onClick={() => handleBulkAction('delete')}>
            Delete
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Interactions Table */}
      {interactions.length === 0 ? (
        <div className="no-interactions">No interactions found</div>
      ) : (
        <div className="interactions-table">
          <table>
            <thead>
              <tr>
                {user?.role === UserRole.ADMIN && (
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === interactions.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(interactions.map(i => i.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                )}
                <th>Type</th>
                <th>Content</th>
                <th>Raised By</th>
                <th>Post</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interactions.map((interaction) => {
                const canModify = canModifyInteraction(interaction);
                
                return (
                  <tr key={interaction.id} className={interaction.is_hidden ? 'hidden-row' : ''}>
                    {user?.role === UserRole.ADMIN && (
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(interaction.id)}
                          onChange={() => toggleSelect(interaction.id)}
                        />
                      </td>
                    )}
                    <td>
                      <span className={`badge ${getTypeBadgeClass(interaction.type)}`}>
                        {interaction.type_display}
                      </span>
                    </td>
                    <td className="content-cell">
                      <div className="content-preview">
                        {interaction.content.substring(0, 100)}
                        {interaction.content.length > 100 && '...'}
                      </div>
                      {interaction.is_hidden && (
                        <span className="hidden-badge">Hidden</span>
                      )}
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">
                          {interaction.user.first_name} {interaction.user.last_name}
                        </div>
                        <div className="user-email">{interaction.user.email}</div>
                      </div>
                    </td>
                    <td className="post-cell">
                      <div className="post-title">{interaction.post.title}</div>
                      <div className="post-author">by {interaction.post.author_name}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(interaction.status)}`}>
                        {interaction.status_display}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(interaction.created_at)}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-view"
                        onClick={() => onViewDetails(interaction)}
                      >
                        View
                      </button>
                      
                      {interaction.is_question && canModify && interaction.status === 'OPEN' && (
                        <button
                          className="btn-action btn-respond"
                          onClick={() => onViewDetails(interaction)}
                        >
                          Answer
                        </button>
                      )}
                      
                      {canModify && interaction.status === 'OPEN' && (
                        <button
                          className="btn-action btn-close"
                          onClick={() => handleClose(interaction.id)}
                        >
                          Close
                        </button>
                      )}
                      
                      {user?.role === UserRole.ADMIN && (
                        <>
                          {interaction.is_flagged && interaction.status === 'PENDING' && (
                            <button
                              className="btn-action btn-reviewed"
                              onClick={() => handleMarkReviewed(interaction.id)}
                            >
                              Mark Reviewed
                            </button>
                          )}
                          
                          {!interaction.is_hidden && (
                            <button
                              className="btn-action btn-hide"
                              onClick={() => handleHide(interaction.id)}
                            >
                              Hide
                            </button>
                          )}
                          
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(interaction.id)}
                            >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InteractionModeration;
