/**
 * WeeklyFlowPage — Production v2
 *
 * Rebuilt to match UserManager's design language:
 *   - Same header / stats / toolbar pattern
 *   - Two-column layout: LEFT = calendar grid, RIGHT = sliding detail panel
 *   - Same Avatar/RoleBadge/StatusBadge atom style
 *   - Same skeleton loading, empty states, error states
 *   - Mobile: detail panel slides up as bottom sheet
 */

import React, {
  useState, useEffect, useCallback, useMemo, memo,
} from 'react';
import Icon from '../components/common/Icon';
import { dailyWordService } from '../services/dailyWord.service';
import { DailyWord } from '../types/dailyWord.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type WordStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
type PanelTab   = 'preview' | 'edit' | 'history';

interface CalendarDay {
  date: string;           // 'YYYY-MM-DD'
  day: number;
  isCurrentMonth: boolean;
  word: DailyWord | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const STATUS_META: Record<WordStatus, { label: string; icon: string; pill: string; dot: string }> = {
  PUBLISHED: { label: 'Published', icon: 'check_circle',  pill: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400 animate-pulse' },
  SCHEDULED: { label: 'Scheduled', icon: 'schedule',      pill: 'bg-blue-50 text-blue-600 border-blue-200',          dot: 'bg-blue-400'                  },
  DRAFT:     { label: 'Draft',     icon: 'edit_note',     pill: 'bg-amber-50 text-amber-600 border-amber-200',       dot: 'bg-amber-400'                 },
};

const PANEL_W = 420;
const THIN: React.CSSProperties = { scrollbarWidth: 'thin' };

const PANEL_TABS: { key: PanelTab; icon: string; label: string }[] = [
  { key: 'preview', icon: 'visibility', label: 'Preview' },
  { key: 'edit',    icon: 'edit',       label: 'Edit'    },
  { key: 'history', icon: 'history',    label: 'History' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMonthYear = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtDT = (s: string | null) =>
  s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const toDateStr = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const isToday = (dateStr: string) =>
  dateStr === toDateStr(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

// ─── Atoms ────────────────────────────────────────────────────────────────────

const StatusBadge = memo(({ status }: { status: WordStatus }) => {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${m.pill}`}>
      <Icon name={m.icon} size={10} />{m.label}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

const StatusDot = memo(({ status }: { status: WordStatus }) => {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dot}`} />;
});
StatusDot.displayName = 'StatusDot';

// ─── Skeleton cell ────────────────────────────────────────────────────────────

const SkeletonCell = memo(() => (
  <div className="bg-white border border-slate-100 rounded-xl p-2 min-h-[88px] animate-pulse">
    <div className="h-5 w-5 bg-slate-100 rounded-lg mb-2" />
    <div className="h-2.5 w-full bg-slate-100 rounded mb-1.5" />
    <div className="h-2 w-3/4 bg-slate-50 rounded" />
  </div>
));
SkeletonCell.displayName = 'SkeletonCell';

// ─── Calendar cell ────────────────────────────────────────────────────────────

const CalendarCell = memo(({ cell, selected, panelOpen, onSelect }: {
  cell: CalendarDay;
  selected: boolean;
  panelOpen: boolean;
  onSelect: (cell: CalendarDay) => void;
}) => {
  const today  = isToday(cell.date);
  const status = cell.word?.status as WordStatus | undefined;
  const m      = status ? STATUS_META[status] : null;

  return (
    <div
      onClick={() => cell.isCurrentMonth && onSelect(cell)}
      className={`
        relative rounded-xl border p-2 min-h-[88px] flex flex-col gap-1 transition-all select-none
        ${!cell.isCurrentMonth ? 'bg-slate-50/40 border-slate-100 cursor-default' : 'cursor-pointer'}
        ${cell.isCurrentMonth && !selected ? 'bg-white border-slate-200 hover:border-primary/40 hover:bg-primary/5' : ''}
        ${selected ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : ''}
      `}
    >
      {/* Day number */}
      <div className={`
        w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0
        ${today    ? 'bg-primary text-white' : ''}
        ${!today && selected && cell.isCurrentMonth ? 'text-primary' : ''}
        ${!today && !selected && cell.isCurrentMonth ? 'text-slate-700' : ''}
        ${!cell.isCurrentMonth ? 'text-slate-300' : ''}
      `}>
        {cell.day}
      </div>

      {/* Word preview */}
      {cell.word && cell.isCurrentMonth && (
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-1 mb-0.5">
            {m && <StatusDot status={status!} />}
            <p className={`text-[10px] font-bold truncate leading-tight ${selected ? 'text-primary' : 'text-slate-700'}`}>
              {cell.word.title || 'Untitled'}
            </p>
          </div>
          {cell.word.scripture && (
            <p className="text-[9px] text-slate-400 truncate leading-tight">
              {cell.word.scripture}
            </p>
          )}
        </div>
      )}

      {/* Empty state dot */}
      {!cell.word && cell.isCurrentMonth && (
        <div className="flex-1 flex items-center justify-center">
          <Icon name="add" size={14} className="text-slate-200" />
        </div>
      )}
    </div>
  );
});
CalendarCell.displayName = 'CalendarCell';

// ─── Panel content ────────────────────────────────────────────────────────────

const PanelContent = memo(({
  cell, tab, setTab, onClose, onSaved,
}: {
  cell: CalendarDay;
  tab: PanelTab;
  setTab: (t: PanelTab) => void;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const word   = cell.word;
  const status = word?.status as WordStatus | undefined;
  const today  = isToday(cell.date);

  const [title,     setTitle]     = useState(word?.title || '');
  const [content,   setContent]   = useState(word?.content || '');
  const [scripture, setScripture] = useState(word?.scripture || '');
  const [prayer,    setPrayer]    = useState(word?.prayer || '');
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  // Reset form when cell changes
  useEffect(() => {
    setTitle(word?.title || '');
    setContent(word?.content || '');
    setScripture(word?.scripture || '');
    setPrayer(word?.prayer || '');
    setSuccess(false);
    setError('');
  }, [cell.date]);

  const hasChanges = useMemo(() => {
    if (!word) return title || content || scripture || prayer;
    return title !== word.title || content !== word.content
        || scripture !== (word.scripture || '') || prayer !== (word.prayer || '');
  }, [word, title, content, scripture, prayer]);

  const handleSave = useCallback(async (publishStatus?: WordStatus) => {
    setSaving(true); setError(''); setSuccess(false);
    try {
      const payload = {
        title, content, scripture, prayer,
        scheduled_date: cell.date,
        status: publishStatus ?? (word?.status || 'DRAFT'),
      };
      if (word?.id) {
        await dailyWordService.update(word.id, payload);
      } else {
        await dailyWordService.create(payload);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to save.');
    } finally { setSaving(false); }
  }, [word, title, content, scripture, prayer, cell.date, onSaved]);

  const displayDate = new Date(cell.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-slate-200">
        <div className="px-5 py-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-start justify-between mb-3">
            {/* Date icon */}
            <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm text-white
              ${today ? 'bg-primary' : 'bg-slate-700'}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none opacity-75">
                {new Date(cell.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-lg font-bold leading-tight">{cell.day}</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Icon name="close" size={17} />
            </button>
          </div>

          <h2 className="text-sm font-bold text-slate-900 truncate">{displayDate}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {today && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Today
              </span>
            )}
            {status
              ? <StatusBadge status={status} />
              : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200">
                  <Icon name="add_circle_outline" size={10} />No Entry
                </span>
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-slate-100">
          {PANEL_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
              <Icon name={t.icon} size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={THIN}>
        <div className="p-4 space-y-4">

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
              <Icon name="check_circle" size={14} className="text-emerald-500 flex-shrink-0" />Changes saved successfully.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              <Icon name="error_outline" size={14} className="text-red-400 flex-shrink-0" />{error}
            </div>
          )}

          {/* PREVIEW TAB */}
          {tab === 'preview' && (
            <>
              {word ? (
                <>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                      <Icon name="light_mode" size={13} className="text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Word</span>
                    </div>
                    <div className="px-4 py-4 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{word.title || 'Untitled'}</h3>
                      {word.scripture && (
                        <div className="flex items-start gap-2">
                          <Icon name="menu_book" size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-semibold text-primary italic">{word.scripture}</p>
                        </div>
                      )}
                      {word.content && (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{word.content}</p>
                      )}
                      {word.prayer && (
                        <div className="bg-primary/5 rounded-lg border border-primary/10 p-3 mt-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">Prayer</p>
                          <p className="text-xs text-slate-600 leading-relaxed italic">{word.prayer}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    {[
                      { icon: 'calendar_today', label: 'Scheduled', value: fmtDate(word.scheduled_date) },
                      { icon: 'schedule',       label: 'Created',   value: fmtDT(word.created_at)       },
                      { icon: 'update',         label: 'Updated',   value: fmtDT(word.updated_at)       },
                      { icon: 'person',         label: 'Author',    value: word.author || '—'           },
                    ].map(r => (
                      <div key={r.label} className="flex items-center gap-3 px-4 py-2.5">
                        <Icon name={r.icon} size={13} className="text-slate-300 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-400 w-20 flex-shrink-0">{r.label}</span>
                        <span className="text-xs text-slate-700 font-medium truncate flex-1">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Icon name="edit_note" size={26} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No entry yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Create a daily word for this date.</p>
                  <button onClick={() => setTab('edit')}
                    className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all">
                    <Icon name="add" size={14} />Create Entry
                  </button>
                </div>
              )}
            </>
          )}

          {/* EDIT TAB */}
          {tab === 'edit' && (
            <>
              {[
                { label: 'Title',     icon: 'title',     val: title,     set: setTitle,     rows: 1,  ph: 'Entry title…'         },
                { label: 'Scripture', icon: 'menu_book', val: scripture, set: setScripture, rows: 1,  ph: 'e.g. John 3:16'       },
                { label: 'Content',   icon: 'notes',     val: content,   set: setContent,   rows: 6,  ph: 'Write the daily word…' },
                { label: 'Prayer',    icon: 'volunteer_activism', val: prayer, set: setPrayer, rows: 3, ph: 'Closing prayer…' },
              ].map(f => (
                <div key={f.label}>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                    <Icon name={f.icon} size={11} className="text-slate-400" />{f.label}
                  </label>
                  {f.rows === 1 ? (
                    <input
                      type="text"
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      placeholder={f.ph}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                    />
                  ) : (
                    <textarea
                      value={f.val}
                      onChange={e => f.set(e.target.value)}
                      rows={f.rows}
                      placeholder={f.ph}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white resize-none"
                    />
                  )}
                </div>
              ))}

              {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Icon name="edit" size={12} className="text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">You have unsaved changes.</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleSave()}
                  disabled={saving || !hasChanges}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-all shadow-sm">
                  <Icon name={saving ? 'hourglass_empty' : 'save'} size={14} />
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button onClick={() => handleSave('PUBLISHED')}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-all shadow-sm">
                  <Icon name="publish" size={14} />Publish
                </button>
              </div>

              {word && (
                <button onClick={() => { setTitle(word.title || ''); setContent(word.content || ''); setScripture(word.scripture || ''); setPrayer(word.prayer || ''); }}
                  disabled={saving || !hasChanges}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
                  Reset Changes
                </button>
              )}
            </>
          )}

          {/* HISTORY TAB */}
          {tab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Icon name="history" size={30} className="text-slate-200 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 mt-3">Version history coming soon</p>
              <p className="text-xs text-slate-400 mt-1">Change logs and revision history will appear here.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
});
PanelContent.displayName = 'PanelContent';

// ─── Main component ────────────────────────────────────────────────────────────

const WeeklyFlowPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [cells,       setCells]       = useState<CalendarDay[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selected,    setSelected]    = useState<CalendarDay | null>(null);
  const [panelTab,    setPanelTab]    = useState<PanelTab>('preview');

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    setLoading(true);
    setError(null);
    try {
      const calendarData = await dailyWordService.getCalendarAdmin(month, year);
      const wordMap = new Map<string, DailyWord>();
      if (calendarData.days) {
        calendarData.days.forEach((day: any) => {
          if (day.has_post && day.id) {
            const dateStr = toDateStr(year, month, day.day);
            wordMap.set(dateStr, {
              id: day.id,
              title: day.title || '',
              content: day.content || '',
              scripture: day.scripture || '',
              prayer: day.prayer || '',
              author: day.author || 'Admin',
              scheduled_date: dateStr,
              status: day.status || 'DRAFT',
              is_deleted: false,
              created_at: day.created_at || new Date().toISOString(),
              updated_at: day.updated_at || new Date().toISOString(),
            } as DailyWord);
          }
        });
      }

      // Build 6-row grid
      const firstDow  = new Date(year, month - 1, 1).getDay();
      const daysInMon = new Date(year, month, 0).getDate();
      const prevLast  = new Date(year, month - 1, 0).getDate();
      const grid: CalendarDay[] = [];

      for (let i = firstDow - 1; i >= 0; i--) {
        const d = prevLast - i;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear  = month === 1 ? year - 1 : year;
        grid.push({ date: toDateStr(prevYear, prevMonth, d), day: d, isCurrentMonth: false, word: null });
      }
      for (let d = 1; d <= daysInMon; d++) {
        const dateStr = toDateStr(year, month, d);
        grid.push({ date: dateStr, day: d, isCurrentMonth: true, word: wordMap.get(dateStr) ?? null });
      }
      const remaining = 42 - grid.length;
      for (let d = 1; d <= remaining; d++) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear  = month === 12 ? year + 1 : year;
        grid.push({ date: toDateStr(nextYear, nextMonth, d), day: d, isCurrentMonth: false, word: null });
      }

      setCells(grid);

      // Refresh selected cell if it's in this month
      if (selected?.isCurrentMonth) {
        const refreshed = grid.find(c => c.date === selected.date);
        if (refreshed) setSelected(refreshed);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday   = () => {
    setCurrentDate(new Date());
    setSelected(null);
  };

  // ── Selection ──────────────────────────────────────────────────────────────

  const handleSelect = useCallback((cell: CalendarDay) => {
    if (selected?.date === cell.date) { setSelected(null); return; }
    setSelected(cell);
    setPanelTab('preview');
  }, [selected]);

  const closePanel = useCallback(() => setSelected(null), []);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const cur = cells.filter(c => c.isCurrentMonth);
    return {
      total:     cur.length,
      published: cur.filter(c => c.word?.status === 'PUBLISHED').length,
      scheduled: cur.filter(c => c.word?.status === 'SCHEDULED').length,
      drafts:    cur.filter(c => c.word?.status === 'DRAFT').length,
      empty:     cur.filter(c => !c.word).length,
    };
  }, [cells]);

  const panelOpen = !!selected;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Page header */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="calendar_month" size={17} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">Weekly Flow</h1>
                <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Manage daily words across the calendar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="hidden sm:flex items-center gap-1.5 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition-colors">
                <Icon name="today" size={14} />Today
              </button>
              <button
                onClick={() => {
                  const todayCell = cells.find(c => isToday(c.date) && c.isCurrentMonth);
                  if (todayCell) { setSelected(todayCell); setPanelTab('edit'); }
                }}
                className="flex items-center gap-1.5 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-all">
                <Icon name="add" size={14} />
                <span className="hidden sm:inline">New Entry</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={THIN}>
            {([
              { icon: 'grid_view',    label: 'Days',      val: stats.total,     color: 'text-slate-700', bg: 'bg-slate-100'  },
              { icon: 'check_circle', label: 'Published', val: stats.published, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: 'schedule',     label: 'Scheduled', val: stats.scheduled, color: 'text-blue-600',   bg: 'bg-blue-50'    },
              { icon: 'edit_note',    label: 'Drafts',    val: stats.drafts,    color: 'text-amber-600',  bg: 'bg-amber-50'   },
              { icon: 'radio_button_unchecked', label: 'Empty', val: stats.empty, color: 'text-slate-400', bg: 'bg-slate-50' },
            ] as const).map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white flex-shrink-0">
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} size={14} className={s.color} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">{s.label}</p>
                  <p className={`text-base font-bold ${s.color} leading-tight mt-0.5`}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Month navigation / toolbar */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex-shrink-0 flex items-center gap-3" style={THIN}>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <Icon name="chevron_left" size={18} />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
          <h2 className="text-sm font-bold text-slate-700 tracking-tight">{fmtMonthYear(currentDate)}</h2>
          <div className="ml-auto flex items-center gap-2">
            {error && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <Icon name="error_outline" size={12} />{error}
              </span>
            )}
            <button onClick={loadData} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary transition-colors">
              <Icon name="refresh" size={13} />Refresh
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={THIN}>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {loading
              ? Array.from({ length: 42 }).map((_, i) => <SkeletonCell key={i} />)
              : cells.map((cell, i) => (
                <CalendarCell
                  key={`${cell.date}-${i}`}
                  cell={cell}
                  selected={selected?.date === cell.date}
                  panelOpen={panelOpen}
                  onSelect={handleSelect}
                />
              ))
            }
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {Object.entries(STATUS_META).map(([status, m]) => (
              <div key={status} className="flex items-center gap-1.5">
                <StatusDot status={status as WordStatus} />
                <span className="text-[10px] font-semibold text-slate-400">{m.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <Icon name="add" size={11} className="text-slate-300" />
              <span className="text-[10px] font-semibold text-slate-400">Empty</span>
            </div>
          </div>

        </div>

      </div>{/* end LEFT COLUMN */}

      {/* ── RIGHT COLUMN — DESKTOP DETAIL PANEL ──────────────────── */}
      <div
        className="hidden md:flex flex-col flex-shrink-0 bg-white border-l border-slate-200 overflow-hidden"
        style={{
          width:      panelOpen ? PANEL_W : 0,
          minWidth:   panelOpen ? PANEL_W : 0,
          transition: 'width 300ms ease, min-width 300ms ease',
        }}
      >
        <div className="flex flex-col h-full" style={{ width: PANEL_W, minWidth: PANEL_W }}>
          {selected && (
            <PanelContent
              cell={selected}
              tab={panelTab}
              setTab={setPanelTab}
              onClose={closePanel}
              onSaved={loadData}
            />
          )}
        </div>
      </div>

      {/* ── MOBILE — fixed bottom sheet ───────────────────────────── */}
      <div
        onClick={closePanel}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl flex flex-col md:hidden transition-transform duration-300 ease-in-out ${panelOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '90dvh' }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        {selected && (
          <PanelContent
            cell={selected}
            tab={panelTab}
            setTab={setPanelTab}
            onClose={closePanel}
            onSaved={loadData}
          />
        )}
      </div>

    </div>
  );
};

export default WeeklyFlowPage;