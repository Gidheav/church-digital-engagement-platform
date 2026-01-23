/**
 * InteractionDetailModal Component
 * Modal for viewing and responding to interactions
 */

import React, { useState, useEffect } from 'react';
import interactionService, { InteractionDetail } from '../services/interaction.service';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/auth.types';
import './InteractionDetailModal.css';

interface InteractionDetailModalProps {
  interactionId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const InteractionDetailModal: React.FC<InteractionDetailModalProps> = ({
  interactionId,
  onClose,
  onUpdate
}) => {
  const { user } = useAuth();
  const [interaction, setInteraction] = useState<InteractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInteraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactionId]);

  const loadInteraction = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await interactionService.getById(interactionId);
      setInteraction(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interaction');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setSubmitting(true);
      await interactionService.respond(interactionId, responseText);
      setResponseText('');
      loadInteraction();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReviewed = async () => {
    try {
      await interactionService.markReviewed(interactionId);
      loadInteraction();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark as reviewed');
    }
  };

  const handleHide = async () => {
    if (!window.confirm('Hide this interaction from public view?')) return;
    
    try {
      await interactionService.hide(interactionId);
      loadInteraction();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to hide interaction');
    }
  };

  const handleUnhide = async () => {
    if (!window.confirm('Make this interaction visible to the public?')) return;
    
    try {
      await interactionService.unhide(interactionId);
      loadInteraction();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unhide interaction');
    }
  };

  const handleClose = async () => {
    try {
      await interactionService.close(interactionId);
      loadInteraction();
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close interaction');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content interaction-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">Loading interaction...</div>
        </div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content interaction-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">{error || 'Interaction not found'}</div>
          <button className="btn-modal-close" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content interaction-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header - Fixed */}
        <div className="modal-header">
          <h2>Interaction Details</h2>
          <button className="btn-close-x" onClick={onClose}>&times;</button>
        </div>

        {/* Content - Scrollable Area */}
        <div className="modal-body-wrapper">
          {/* Post Info */}
          <div className="post-info-card">
            <div className="post-info-label">Related Post:</div>
            <div className="post-info-title">{interaction.post.title}</div>
            <div className="post-info-author">by {interaction.post.author_name}</div>
          </div>

          {/* Main Interaction */}
          <div className={`interaction-card main-interaction ${interaction.is_question ? 'question' : ''} ${interaction.is_flagged ? 'flagged' : ''}`}>
            <div className="interaction-meta">
              <span className={`badge ${getTypeBadgeClass(interaction.type)}`}>
                {interaction.type_display}
              </span>
              <span className={`badge ${getStatusBadgeClass(interaction.status)}`}>
                {interaction.status_display}
              </span>
              {interaction.is_hidden && (
                <span className="badge status-hidden">Hidden</span>
              )}
            </div>

            <div className="interaction-user">
              <strong>{interaction.user.first_name} {interaction.user.last_name}</strong>
              <span className="user-email">({interaction.user.email})</span>
              <span className="interaction-date">{formatDate(interaction.created_at)}</span>
            </div>

            <div className="interaction-content">
              {interaction.content}
            </div>

            {interaction.is_flagged && interaction.flag_reason && (
              <div className="flag-info">
                <strong>Flag Reason:</strong> {interaction.flag_reason}
                <div className="flag-meta">
                  Flagged by {interaction.flagged_by?.email} on {interaction.flagged_at && formatDate(interaction.flagged_at)}
                </div>
              </div>
            )}

            {interaction.responded_by && (
              <div className="response-info">
                <strong>Responded by:</strong> {interaction.responded_by.email} on {interaction.responded_at && formatDate(interaction.responded_at)}
              </div>
            )}
          </div>

          {/* Replies Thread */}
          {interaction.replies && interaction.replies.length > 0 && (
            <div className="replies-section">
              <h3>Responses</h3>
              {interaction.replies.map((reply) => (
                <div key={reply.id} className="interaction-card reply">
                  <div className="interaction-user">
                    <strong>{reply.user.first_name} {reply.user.last_name}</strong>
                    <span className="user-email">({reply.user.email})</span>
                    <span className="interaction-date">{formatDate(reply.created_at)}</span>
                  </div>
                  <div className="interaction-content">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Response Form (if can respond) */}
          {interaction.can_respond && interaction.status === 'OPEN' && (
            <form onSubmit={handleSubmitResponse} className="response-form">
              <h3>Your Response</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                disabled={submitting}
                required
              />
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          )}

          {/* Read-Only Message */}
          {!interaction.can_respond && interaction.is_question && (
            <div className="read-only-notice">
              You do not have permission to respond to this question.
              {user?.role === UserRole.MODERATOR && ' (You can only answer questions on your own posts)'}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="modal-actions">
          {interaction.can_respond && interaction.status === 'OPEN' && (
            <button className="btn-modal btn-close-interaction" onClick={handleClose}>
              Close Interaction
            </button>
          )}

          {user?.role === UserRole.ADMIN && (
            <>
              {interaction.is_flagged && interaction.status === 'PENDING' && (
                <button className="btn-modal btn-reviewed" onClick={handleMarkReviewed}>
                  Mark as Reviewed
                </button>
              )}

              {!interaction.is_hidden ? (
                <button className="btn-modal btn-hide" onClick={handleHide}>
                  Hide from Public
                </button>
              ) : (
                <button className="btn-modal btn-unhide" onClick={handleUnhide}>
                  Unhide / Make Visible
                </button>
              )}
            </>
          )}

          <button className="btn-modal-close" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractionDetailModal;
