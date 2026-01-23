/**
 * UserManager - Enterprise Edition
 * Professional user management interface
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import { useConfirm } from '../contexts/ConfirmContext';
import DataTable, { Column } from './components/DataTable';
import {
  UsersIcon,
  ShieldIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XIcon,
  SaveIcon,
  FilterIcon,
  CalendarIcon,
  ActivityIcon,
} from './components/Icons';
import './styles/UserManager.pro.css';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'MEMBER' | 'MODERATOR';
  is_suspended: boolean;
  email_verified: boolean;
  email_subscribed: boolean;
  date_joined: string;
  last_login: string | null;
}

interface UserDetail extends User {
  phone_number: string | null;
  profile_picture: string | null;
  bio: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspended_by_email: string | null;
  suspension_reason: string | null;
  suspension_expires_at: string | null;
  activity: {
    posts_count: number;
    comments_count: number;
    reactions_count: number;
  };
}

const UserManager: React.FC = () => {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');

  // Edit states
  const [newRole, setNewRole] = useState<'MEMBER' | 'MODERATOR'>('MEMBER');
  const [editedStatus, setEditedStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.get('/admin/users/');
      // Handle both array response and object with results/users property
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data?.results && Array.isArray(data.results)) {
        setUsers(data.results);
      } else if (data?.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error('Unexpected data format:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const data = await apiService.get(`/admin/users/${userId}/`);
      setSelectedUser(data);
      setNewRole(data.role);
      setEditedStatus(data.is_suspended ? 'SUSPENDED' : 'ACTIVE');
      setActionReason('');
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      alert('Failed to load user details');
    }
  };

  const resetActionForm = () => {
    setNewRole('MEMBER');
    setEditedStatus('ACTIVE');
    setActionReason('');
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    const willSuspend = editedStatus === 'SUSPENDED' && !selectedUser.is_suspended;
    
    const performSave = async () => {
      try {
        const payload: any = {};
        
        if (newRole !== selectedUser.role) {
          payload.role = newRole;
        }

        if (editedStatus === 'SUSPENDED' && !selectedUser.is_suspended) {
          payload.action = 'suspend';
          if (actionReason) payload.reason = actionReason;
        } else if (editedStatus === 'ACTIVE' && selectedUser.is_suspended) {
          payload.action = 'unsuspend';
        }

        await apiService.put(`/admin/users/${selectedUser.id}/`, payload);
        await fetchUsers();
        setShowDetailModal(false);
        resetActionForm();
        alert('User updated successfully');
      } catch (error: any) {
        console.error('Error updating user:', error);
        alert(error?.response?.data?.detail || 'Failed to update user');
      }
    };

    if (willSuspend) {
      confirm({
        title: 'Suspend User',
        message: `Are you sure you want to suspend ${selectedUser.full_name}? They will no longer be able to access the platform.`,
        confirmLabel: 'Suspend',
        cancelLabel: 'Cancel',
        variant: 'danger',
        onConfirm: performSave,
      });
    } else {
      performSave();
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter === 'active' && user.is_suspended) return false;
    if (statusFilter === 'suspended' && !user.is_suspended) return false;
    if (verifiedFilter === 'verified' && !user.email_verified) return false;
    if (verifiedFilter === 'unverified' && user.email_verified) return false;
    return true;
  }) : [];

  const stats = {
    total: Array.isArray(users) ? users.length : 0,
    members: Array.isArray(users) ? users.filter((u) => u.role === 'MEMBER').length : 0,
    moderators: Array.isArray(users) ? users.filter((u) => u.role === 'MODERATOR').length : 0,
    suspended: Array.isArray(users) ? users.filter((u) => u.is_suspended).length : 0,
  };

  const columns: Column<User>[] = [
    {
      key: 'full_name',
      label: 'User',
      sortable: true,
      render: (row) => (
        <div className="user-cell-pro">
          <span className="user-name-text">{row.full_name}</span>
          <span className="user-email-text">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => {
        if (value === 'MODERATOR') {
          return (
            <span className="badge-role moderator">
              <ShieldIcon />
              Moderator
            </span>
          );
        } else {
          return (
            <span className="badge-role member">
              <UsersIcon />
              Member
            </span>
          );
        }
      },
    },
    {
      key: 'is_suspended',
      label: 'Status',
      sortable: true,
      render: (value) => {
        if (value) {
          return (
            <span className="badge-status suspended">
              <AlertCircleIcon />
              Suspended
            </span>
          );
        } else {
          return (
            <span className="badge-status active">
              <CheckCircleIcon />
              Active
            </span>
          );
        }
      },
    },
    {
      key: 'email_verified',
      label: 'Email Status',
      sortable: true,
      render: (value) => {
        if (value) {
          return (
            <span className="badge-verified verified">
              <CheckCircleIcon />
              Verified
            </span>
          );
        } else {
          return (
            <span className="badge-verified unverified">
              <AlertCircleIcon />
              Unverified
            </span>
          );
        }
      },
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (value) => (
        <span className="text-date">
          {value
            ? new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Never'}
        </span>
      ),
    },
  ];

  const renderActions = (user: User) => (
    <button
      onClick={() => {
        handleViewUser(user.id);
      }}
      className="btn-view-user"
    >
      View Details
    </button>
  );

  return (
    <div className="content-manager-pro">
      {/* Stats Cards */}
      <div className="stats-row-pro">
        <div className="stat-mini-card">
          <div className="stat-mini-label">Total Users</div>
          <div className="stat-mini-value">{stats.total}</div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-label">Members</div>
          <div className="stat-mini-value">{stats.members}</div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-label">Moderators</div>
          <div className="stat-mini-value">{stats.moderators}</div>
        </div>
        <div className="stat-mini-card">
          <div className="stat-mini-label">Suspended</div>
          <div className="stat-mini-value">{stats.suspended}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row-pro">
        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="MEMBER">Members Only</option>
            <option value="MODERATOR">Moderators Only</option>
          </select>
        </div>

        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>

        <div className="filter-group">
          <FilterIcon size={16} />
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Email Status</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={renderActions}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search users by name or email..."
        emptyMessage="No users found"
      />

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-group">
                <UsersIcon />
                <div>
                  <h2 className="modal-title">User Details</h2>
                  <p className="modal-subtitle">{selectedUser.full_name}</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Account Information Section */}
              <div className="modal-section">
                <h3 className="section-title">
                  <UsersIcon />
                  Account Information
                </h3>
                <div className="info-grid">
                  <div className="info-field">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{selectedUser.full_name}</div>
                  </div>
                  <div className="info-field">
                    <div className="info-label">Email</div>
                    <div className="info-value">{selectedUser.email}</div>
                  </div>
                  <div className="info-field">
                    <div className="info-label">Email Status</div>
                    <div className="info-value">
                      {selectedUser.email_verified ? (
                        <span className="badge-verified verified">
                          <CheckCircleIcon />
                          Verified
                        </span>
                      ) : (
                        <span className="badge-verified unverified">
                          <AlertCircleIcon />
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="info-field">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{selectedUser.phone_number || '—'}</div>
                  </div>
                  <div className="info-field">
                    <div className="info-label">Joined</div>
                    <div className="info-value">
                      <CalendarIcon />
                      {selectedUser.date_joined
                        ? new Date(selectedUser.date_joined).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="info-field">
                    <div className="info-label">Last Login</div>
                    <div className="info-value">
                      <CalendarIcon />
                      {selectedUser.last_login
                        ? new Date(selectedUser.last_login).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Section */}
              <div className="modal-section">
                <h3 className="section-title">
                  <ShieldIcon />
                  User Controls
                </h3>
                <div className="controls-grid">
                  <div className="control-field">
                    <label className="control-label">User Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'MEMBER' | 'MODERATOR')}
                      className="control-select"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MODERATOR">Moderator</option>
                    </select>
                  </div>

                  <div className="control-field">
                    <label className="control-label">Account Status</label>
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')}
                      className="control-select"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                {editedStatus === 'SUSPENDED' && (
                  <div className="control-field full-width">
                    <label className="control-label">Suspension Reason</label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="control-textarea"
                      rows={3}
                      placeholder="Reason for suspension (optional)..."
                    />
                  </div>
                )}
              </div>

              {/* Suspension Info (if applicable) */}
              {selectedUser.is_suspended && selectedUser.suspension_reason && (
                <div className="modal-section suspension-section">
                  <h3 className="section-title">
                    <AlertCircleIcon />
                    Suspension Information
                  </h3>
                  <div className="info-grid">
                    <div className="info-field">
                      <div className="info-label">Suspended At</div>
                      <div className="info-value">
                        {selectedUser.suspended_at
                          ? new Date(selectedUser.suspended_at).toLocaleString()
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="info-field">
                      <div className="info-label">Suspended By</div>
                      <div className="info-value">{selectedUser.suspended_by_email || 'N/A'}</div>
                    </div>
                    <div className="info-field full-width">
                      <div className="info-label">Reason</div>
                      <div className="suspension-reason-text">{selectedUser.suspension_reason}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Stats */}
              <div className="modal-section">
                <h3 className="section-title">
                  <ActivityIcon />
                  Activity Statistics
                </h3>
                <div className="activity-grid">
                  <div className="activity-item">
                    <div className="activity-number">{selectedUser.activity.posts_count}</div>
                    <div className="activity-text">Posts</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-number">{selectedUser.activity.comments_count}</div>
                    <div className="activity-text">Comments</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-number">{selectedUser.activity.reactions_count}</div>
                    <div className="activity-text">Reactions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowDetailModal(false);
                  resetActionForm();
                }}
              >
                <XIcon />
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveChanges}
                disabled={
                  newRole === selectedUser.role &&
                  editedStatus === (selectedUser.is_suspended ? 'SUSPENDED' : 'ACTIVE')
                }
              >
                <SaveIcon />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
