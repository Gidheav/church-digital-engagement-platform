/**
 * App Settings - Content Types Management
 * 
 * Admin-only page for managing content types (system + custom)
 * System types (announcement, sermon, article) are immutable.
 * Custom types can be created, edited, enabled/disabled, and deleted.
 */

import React, { useEffect, useState } from 'react';
import contentTypeService, { ContentType, CreateContentTypeData, UpdateContentTypeData } from '../services/contentType.service';
import { useConfirm } from '../contexts/ConfirmContext';
import '../styles/AppSettings.css';

const AppSettings: React.FC = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState<ContentType | null>(null);
  const { confirm } = useConfirm();

  // Form state for create
  const [createForm, setCreateForm] = useState<CreateContentTypeData>({
    slug: '',
    name: '',
    description: '',
    sort_order: 100,
  });

  // Form state for edit
  const [editForm, setEditForm] = useState<UpdateContentTypeData>({
    name: '',
    description: '',
    is_enabled: true,
    sort_order: 100,
  });

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await contentTypeService.getAll();
      setContentTypes(types);
    } catch (err: any) {
      // Handle 403 Forbidden (not admin)
      if (err.response?.status === 403) {
        setError('Access Denied: Only administrators can manage content types');
      } else {
        setError(err.response?.data?.error || 'Failed to load content types');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContentTypes();
  }, []);

  const handleCreateOpen = () => {
    setCreateForm({
      slug: '',
      name: '',
      description: '',
      sort_order: 100,
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contentTypeService.create(createForm);
      setShowCreateModal(false);
      loadContentTypes();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Access Denied: Only administrators can create content types');
      } else {
        alert(err.response?.data?.error || err.response?.data?.slug?.[0] || 'Failed to create content type');
      }
    }
  };

  const handleEditOpen = (type: ContentType) => {
    if (type.is_system) {
      alert('System content types cannot be edited');
      return;
    }
    setEditingType(type);
    setEditForm({
      name: type.name,
      description: type.description,
      is_enabled: type.is_enabled,
      sort_order: type.sort_order,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      await contentTypeService.update(editingType.id, editForm);
      setShowEditModal(false);
      setEditingType(null);
      loadContentTypes();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Access Denied: Only administrators can update content types');
      } else {
        alert(err.response?.data?.error || 'Failed to update content type');
      }
    }
  };

  const handleToggleEnabled = async (type: ContentType) => {
    if (type.is_system) {
      alert('System content types cannot be disabled');
      return;
    }

    const action = type.is_enabled ? 'disable' : 'enable';
    confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Content Type`,
      message: `Are you sure you want to ${action} "${type.name}"? ${
        !type.is_enabled ? 'It will appear in post creation dropdowns.' : 'It will be hidden from post creation.'
      }`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      variant: 'neutral',
      onConfirm: async () => {
        try {
          await contentTypeService.toggleEnabled(type.id);
          loadContentTypes();
        } catch (err: any) {
          if (err.response?.status === 403) {
            alert('Access Denied: Only administrators can modify content types');
          } else {
            alert(err.response?.data?.error || `Failed to ${action} content type`);
          }
        }
      },
    });
  };

  const handleDelete = (type: ContentType) => {
    if (type.is_system) {
      alert('System content types cannot be deleted');
      return;
    }

    if (!type.can_delete) {
      alert(`Cannot delete "${type.name}" because it is used by ${type.posts_count} post(s)`);
      return;
    }

    confirm({
      title: 'Delete Content Type',
      message: `Are you sure you want to delete "${type.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await contentTypeService.delete(type.id);
          loadContentTypes();
        } catch (err: any) {
          if (err.response?.status === 403) {
            alert('Access Denied: Only administrators can delete content types');
          } else {
            alert(err.response?.data?.error || 'Failed to delete content type');
          }
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="app-settings">
        <div className="loading">Loading content types...</div>
      </div>
    );
  }

  return (
    <div className="app-settings">
      <div className="settings-header">
        <div>
          <h2>App Settings</h2>
          <p className="subtitle">Manage content types and system configuration</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h3>Content Types</h3>
          <button className="btn-primary" onClick={handleCreateOpen}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
            Add Custom Type
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="content-types-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Type</th>
                <th>Status</th>
                <th>Posts</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentTypes.map((type) => (
                <tr key={type.id} className={type.is_system ? 'system-type' : 'custom-type'}>
                  <td>
                    <strong>{type.name}</strong>
                    {type.description && (
                      <div className="type-description">{type.description}</div>
                    )}
                  </td>
                  <td>
                    <code>{type.slug}</code>
                  </td>
                  <td>
                    <span className={`badge badge-${type.is_system ? 'system' : 'custom'}`}>
                      {type.is_system ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                          </svg>
                          System
                        </>
                      ) : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${type.is_enabled ? 'enabled' : 'disabled'}`}>
                      {type.is_enabled ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                          </svg>
                          Enabled
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                          </svg>
                          Disabled
                        </>
                      )}
                    </span>
                  </td>
                  <td>{type.posts_count}</td>
                  <td>{type.sort_order}</td>
                  <td className="actions-cell">
                    {type.is_system ? (
                      <span className="locked-indicator" title="System types cannot be modified">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                        </svg>
                        Locked
                      </span>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditOpen(type)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-toggle"
                          onClick={() => handleToggleEnabled(type)}
                          title={type.is_enabled ? 'Disable' : 'Enable'}
                        >
                          {type.is_enabled ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                              <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                              <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(type)}
                          disabled={!type.can_delete}
                          title={type.can_delete ? 'Delete' : `Cannot delete (${type.posts_count} posts)`}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {contentTypes.length === 0 && (
            <div className="empty-state">
              <p>No content types found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Custom Content Type</h3>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase() })}
                  placeholder="e.g., devotion, hymn"
                  pattern="[a-z0-9_-]+"
                  required
                />
                <small>Lowercase letters, numbers, hyphens, and underscores only. Cannot be changed later.</small>
              </div>
              <div className="form-group">
                <label htmlFor="name">Display Name *</label>
                <input
                  type="text"
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Devotion, Hymn"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Optional description for administrators"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sort_order">Sort Order</label>
                <input
                  type="number"
                  id="sort_order"
                  value={createForm.sort_order}
                  onChange={(e) => setCreateForm({ ...createForm, sort_order: parseInt(e.target.value) })}
                  min="0"
                />
                <small>Lower numbers appear first in dropdowns</small>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingType && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Content Type</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={editingType.slug}
                  disabled
                  className="input-disabled"
                />
                <small>Slug cannot be changed after creation</small>
              </div>
              <div className="form-group">
                <label htmlFor="edit-name">Display Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-sort-order">Sort Order</label>
                <input
                  type="number"
                  id="edit-sort-order"
                  value={editForm.sort_order}
                  onChange={(e) => setEditForm({ ...editForm, sort_order: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.is_enabled}
                    onChange={(e) => setEditForm({ ...editForm, is_enabled: e.target.checked })}
                  />
                  <span>Enabled (appears in post creation)</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSettings;
