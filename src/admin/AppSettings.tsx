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
            + Add Custom Type
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
                      {type.is_system ? '🔒 System' : 'Custom'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${type.is_enabled ? 'enabled' : 'disabled'}`}>
                      {type.is_enabled ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </td>
                  <td>{type.posts_count}</td>
                  <td>{type.sort_order}</td>
                  <td className="actions-cell">
                    {type.is_system ? (
                      <span className="locked-indicator" title="System types cannot be modified">
                        🔒 Locked
                      </span>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditOpen(type)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-toggle"
                          onClick={() => handleToggleEnabled(type)}
                          title={type.is_enabled ? 'Disable' : 'Enable'}
                        >
                          {type.is_enabled ? '👁️' : '🚫'}
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(type)}
                          disabled={!type.can_delete}
                          title={type.can_delete ? 'Delete' : `Cannot delete (${type.posts_count} posts)`}
                        >
                          🗑️
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
