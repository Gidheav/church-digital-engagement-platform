/**
 * Series Manager Component - Enterprise Edition
 * Professional series management with DataTable
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { UserRole } from '../types/auth.types';
import seriesService from '../services/series.service';
import { Series, SeriesVisibility } from '../types/series.types';
import DataTable, { Column, StatusBadge, ActionMenu } from './components/DataTable';
import { Card } from './components/Card';
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  FilterIcon,
  FolderIcon,
} from './components/Icons';
import SeriesCreate from './SeriesCreate';
import SeriesEdit from './SeriesEdit';
import './styles/SeriesManager.css';

type ViewMode = 'list' | 'create' | 'edit';

const SeriesManager: React.FC = () => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [filterSearch, setFilterSearch] = useState<string>('');

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const data = await seriesService.getAllSeries();
      setSeriesList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load series:', err);
      setSeriesList([]);
    } finally {
      setLoading(false);
    }
  };

  const canModifySeries = (series: Series): boolean => {
    if (user?.role === UserRole.ADMIN) return true;
    if (user?.role === UserRole.MODERATOR) {
      return series.author === user.id;
    }
    return false;
  };

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleEdit = (series: Series) => {
    if (!canModifySeries(series)) {
      alert('You do not have permission to edit this series');
      return;
    }
    setSelectedSeries(series);
    setViewMode('edit');
  };

  const handleDelete = async (series: Series) => {
    if (!canModifySeries(series)) {
      alert('You do not have permission to delete this series');
      return;
    }

    confirm({
      title: 'Delete Series',
      message: `Are you sure you want to delete "${series.title}"? Posts will remain but be removed from this series.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await seriesService.deleteSeries(series.id);
          await loadSeries();
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to delete series');
        }
      },
    });
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedSeries(null);
    loadSeries();
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedSeries(null);
  };

  // Filter series based on user role and filters
  const filteredSeries = seriesList.filter(series => {
    // Role-based filtering
    if (user?.role === UserRole.MODERATOR) {
      const seriesAuthorId = String(series.author);
      const currentUserId = String(user.id);
      if (seriesAuthorId !== currentUserId) {
        return false;
      }
    }
    
    // Visibility filter
    if (filterVisibility && series.visibility !== filterVisibility) {
      return false;
    }

    // Featured filter
    if (filterFeatured !== null && series.is_featured !== filterFeatured) {
      return false;
    }

    // Search filter
    if (filterSearch) {
      const searchLower = filterSearch.toLowerCase();
      return (
        series.title.toLowerCase().includes(searchLower) ||
        (series.description && series.description.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const getVisibilityBadge = (visibility: SeriesVisibility) => {
    const map: Record<SeriesVisibility, { variant: any; label: string }> = {
      PUBLIC: { variant: 'success', label: 'Public' },
      MEMBERS_ONLY: { variant: 'warning', label: 'Members Only' },
      HIDDEN: { variant: 'default', label: 'Hidden' },
    };
    const config = map[visibility];
    return <StatusBadge status={config.label} variant={config.variant} />;
  };

  // DataTable columns
  const columns: Column<Series>[] = [
    {
      key: 'title',
      label: 'Series',
      sortable: true,
      width: '35%',
      render: (value, row) => (
        <div className="series-title-cell">
          <div className="series-icon">
            <FolderIcon size={20} />
          </div>
          <div className="series-info">
            <div className="series-title-text">{value}</div>
            {row.description && (
              <div className="series-description-preview">
                {row.description.substring(0, 80)}
                {row.description.length > 80 ? '...' : ''}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'author_name',
      label: 'Author',
      sortable: true,
      width: '15%',
    },
    {
      key: 'visibility',
      label: 'Visibility',
      sortable: true,
      width: '12%',
      align: 'center',
      render: (value) => getVisibilityBadge(value as SeriesVisibility),
    },
    {
      key: 'post_count',
      label: 'Posts',
      sortable: true,
      width: '8%',
      align: 'center',
      render: (value) => (
        <span className="series-post-count">{value || 0}</span>
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      sortable: true,
      width: '10%',
      align: 'center',
      render: (value) => value ? '⭐' : '—',
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      width: '12%',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  if (viewMode === 'create') {
    return (
      <div className="series-manager">
        <SeriesCreate onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  if (viewMode === 'edit' && selectedSeries) {
    return (
      <div className="series-manager">
        <SeriesEdit series={selectedSeries} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="series-manager">
      <Card>
        <div className="series-manager-header">
          <div className="header-left">
            <h2>
              <FolderIcon size={24} style={{ marginRight: '8px' }} />
              Series Management
            </h2>
            <p className="header-subtitle">
              Organize related content into series
            </p>
          </div>
          <button className="btn-primary" onClick={handleCreateNew}>
            <PlusIcon size={20} />
            <span>Create Series</span>
          </button>
        </div>

        {/* Filters */}
        <div className="series-filters">
          <div className="filter-group">
            <label>
              <FilterIcon size={16} />
              <span>Visibility</span>
            </label>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS_ONLY">Members Only</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <span>Featured</span>
            </label>
            <select
              value={filterFeatured === null ? '' : String(filterFeatured)}
              onChange={(e) => {
                const value = e.target.value;
                setFilterFeatured(value === '' ? null : value === 'true');
              }}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          <div className="filter-group filter-search">
            <input
              type="text"
              placeholder="Search series..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredSeries}
          loading={loading}
          onRowClick={(series) => {
            if (canModifySeries(series)) {
              handleEdit(series);
            }
          }}
          actions={(series) => (
            <ActionMenu
              actions={[
                {
                  icon: <EditIcon size={16} />,
                  label: 'Edit',
                  onClick: () => handleEdit(series),
                },
                {
                  icon: <DeleteIcon size={16} />,
                  label: 'Delete',
                  onClick: () => handleDelete(series),
                  danger: true,
                },
              ].filter(() => {
                // Only show actions for series the user can modify
                return canModifySeries(series);
              })}
            />
          )}
        />

        {filteredSeries.length === 0 && !loading && (
          <div className="empty-state">
            <FolderIcon size={48} />
            <h3>No Series Found</h3>
            <p>
              {filterSearch || filterVisibility || filterFeatured !== null
                ? 'No series match your filters. Try adjusting your search.'
                : 'Get started by creating your first series.'}
            </p>
            {!filterSearch && !filterVisibility && filterFeatured === null && (
              <button className="btn-primary" onClick={handleCreateNew}>
                <PlusIcon size={20} />
                <span>Create First Series</span>
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SeriesManager;
