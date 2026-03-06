/**
 * SeriesManager helper functions
 */

export const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const getVisibilityBadgeClass = (visibility: string): string => {
  switch (visibility) {
    case 'PUBLIC':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'MEMBERS_ONLY':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};
