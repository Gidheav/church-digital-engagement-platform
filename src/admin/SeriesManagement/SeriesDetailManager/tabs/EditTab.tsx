/**
 * EditTab - Create and edit series details (shared logic for both modes)
 */
import React, { useCallback } from 'react';
import ImageUploadInput from '../../../components/ImageUploadInput';
import { SERIES_VISIBILITY_OPTIONS } from '../../../../services/series.service';
import Icon from '../../../../components/common/Icon';
import { EditForm } from '../types/series-detail.types';

interface EditTabProps {
  isCreateMode: boolean;
  editForm: EditForm;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFormFieldChange: (field: keyof EditForm, value: any) => void;
  onSave: () => void;
  onDiscard: () => void;
  onNavigate?: (path: string) => void;
  editSaving?: boolean;
  editError?: string;
  editSuccess?: boolean;
  createSuccess?: boolean;
}

const EditTab: React.FC<EditTabProps> = React.memo(({
  isCreateMode,
  editForm,
  onFormChange,
  onFormFieldChange,
  onSave,
  onDiscard,
  onNavigate,
  editSaving = false,
  editError = '',
  editSuccess = false,
  createSuccess = false,
}) => {
  if (isCreateMode) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Success banner */}
        {createSuccess && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 text-sm font-medium">
            <Icon name="check_circle" size={18} className="text-green-500" />
            <div>
              <p className="font-semibold">Series created successfully!</p>
              <p className="text-xs text-green-600 mt-0.5">Redirecting to the new series page...</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {editError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
            <Icon name="error_outline" size={18} className="text-red-400" />
            {editError}
          </div>
        )}

        {/* Create Series Form */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Series Details</h3>
              <p className="text-sm text-slate-500 mb-6">Fill in the information below to create a new series.</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={onFormChange}
                disabled={editSaving || createSuccess}
                placeholder="e.g., The Divine Renovation: Rebuilding the Temple of Your Heart"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-colors font-semibold"
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">The public-facing name of the series</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={onFormChange}
                disabled={editSaving || createSuccess}
                placeholder="Describe what this series is about, its themes, and who it's for..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white resize-none transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">Shown on the public series page — helps members understand what to expect</p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Cover Image</label>
              <ImageUploadInput
                value={editForm.cover_image || ''}
                onChange={(url: string) => onFormFieldChange('cover_image', url)}
                disabled={editSaving || createSuccess}
              />
              <p className="text-xs text-slate-400 mt-2">Recommended: 1280 × 720 px (16:9), JPG or PNG</p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Visibility</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SERIES_VISIBILITY_OPTIONS.map((opt: any) => {
                  const icons: Record<string, string> = { PUBLIC: 'public', MEMBERS_ONLY: 'group', HIDDEN: 'visibility_off' };
                  const descs: Record<string, string> = {
                    PUBLIC: 'Anyone can discover and view',
                    MEMBERS_ONLY: 'Authenticated members only',
                    HIDDEN: 'Hidden from all listings',
                  };
                  const isActive = editForm.visibility === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={[
                        'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all',
                        isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={opt.value}
                        checked={isActive}
                        onChange={onFormChange}
                        disabled={editSaving || createSuccess}
                        className="sr-only"
                      />
                      <span className={`material-symbols-outlined text-xl ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                        {icons[opt.value]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-slate-700'}`}>{opt.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{descs[opt.value]}</p>
                      </div>
                      {isActive && <Icon name="check_circle" size={16} className="text-primary flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Featured */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Feature this series</p>
                  <p className="text-xs text-slate-400 mt-0.5">Shown prominently on the homepage</p>
                </div>
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={editForm.is_featured}
                    onChange={onFormChange}
                    disabled={editSaving || createSuccess}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors peer-disabled:opacity-50" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </div>

              {editForm.is_featured && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Display Priority</label>
                    <input
                      type="number"
                      name="featured_priority"
                      value={editForm.featured_priority}
                      onChange={onFormChange}
                      min={0}
                      max={100}
                      disabled={editSaving || createSuccess}
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Higher numbers appear earlier in featured lists</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-slate-100 pt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={editSaving || createSuccess || !editForm.title.trim()}
                className="flex-1 px-5 py-3 rounded-lg bg-primary hover:opacity-90 text-white text-sm font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Icon name={editSaving ? 'hourglass_empty' : 'add_circle'} size={14} />
                {editSaving ? 'Creating...' : 'Create Series'}
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('/admin/series')}
                disabled={editSaving}
                className="flex-1 px-5 py-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              After creating the series, you'll be able to add posts, upload resources, and configure advanced settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="flex flex-col gap-5">
      {/* Status banners */}
      {editSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 text-sm font-medium">
          <Icon name="check_circle" size={18} className="text-green-500" />
          Series updated successfully.
        </div>
      )}
      {editError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium">
          <Icon name="error_outline" size={18} className="text-red-400" />
          {editError}
        </div>
      )}

      {/* Main content area with left column and right sidebar */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Left column: Series Details Grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-5 w-full">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Title & Description */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={onFormChange}
                    disabled={editSaving}
                    placeholder="e.g., The Divine Renovation"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-colors font-semibold"
                  />
                  <p className="text-xs text-slate-400 mt-1">The public-facing name of the series</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={onFormChange}
                    disabled={editSaving}
                    placeholder="Describe what this series is about, its themes, and who it's for..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white resize-none transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">Shown on the public series page</p>
                </div>
              </div>

              {/* Right: Cover Image */}
              <div className="flex flex-col gap-4 items-center justify-center w-full">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 w-full">Cover Image</label>
                <div className="w-full flex flex-col items-center gap-3">
                  <ImageUploadInput
                    value={editForm.cover_image || ''}
                    onChange={(url: string) => onFormFieldChange('cover_image', url)}
                    disabled={editSaving}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      disabled={editSaving}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                      onClick={() => onFormFieldChange('cover_image', '')}
                      disabled={editSaving}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Recommended: 1280 × 720 px (16:9), JPG or PNG</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Settings sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
          {/* Card: Visibility */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <Icon name="lock_open" size={18} className="text-primary/70" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Visibility</h3>
                <p className="text-xs text-slate-400">Who can access this series</p>
              </div>
            </div>
            <div className="px-5 py-5 flex flex-col gap-3">
              {SERIES_VISIBILITY_OPTIONS.map((opt: any) => {
                const icons: Record<string, string> = { PUBLIC: 'public', MEMBERS_ONLY: 'group', HIDDEN: 'visibility_off' };
                const descs: Record<string, string> = {
                  PUBLIC: 'Anyone can discover and view',
                  MEMBERS_ONLY: 'Authenticated members only',
                  HIDDEN: 'Hidden from all listings',
                };
                const isActive = editForm.visibility === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={[
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={isActive}
                      onChange={onFormChange}
                      disabled={editSaving}
                      className="sr-only"
                    />
                    <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                      {icons[opt.value]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-slate-700'}`}>{opt.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{descs[opt.value]}</p>
                    </div>
                    {isActive && <Icon name="check_circle" size={16} className="text-primary" />}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card: Featured */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <Icon name="star" size={18} className="text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Featured</h3>
                <p className="text-xs text-slate-400">Promote on the homepage</p>
              </div>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Feature this series</p>
                  <p className="text-xs text-slate-400 mt-0.5">Shown prominently to all visitors</p>
                </div>
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={editForm.is_featured}
                    onChange={onFormChange}
                    disabled={editSaving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors peer-disabled:opacity-50" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>

              {editForm.is_featured && (
                <div className="pt-1 border-t border-slate-100 flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Display Priority</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      name="featured_priority"
                      value={editForm.featured_priority}
                      onChange={onFormChange}
                      min={0}
                      max={100}
                      disabled={editSaving}
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 transition-colors"
                    />
                    <p className="text-xs text-slate-400 leading-relaxed">Higher = appears earlier in featured lists</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save / Discard */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={editSaving || !editForm.title.trim()}
              className="w-full px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 text-white text-sm font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <Icon name={editSaving ? 'hourglass_empty' : 'check'} size={14} />
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onDiscard}
              disabled={editSaving}
              className="w-full px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EditTab.displayName = 'EditTab';
export default EditTab;
