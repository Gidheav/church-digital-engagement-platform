/**
 * Series Detail Manager - Enterprise Command Hub
 * Full series detail view: metrics, tabs, posts table, resources, notes
 * Renders inside AdminLayout (sidebar + topbar provided by layout)
 */

import React, { useState } from 'react';

interface SeriesPost {
  id: number;
  order: number;
  title: string;
  sermonId: string;
  date: string;
  duration: string;
  tags: string[];
  engagement: { views: number | string; comments: number | string };
  status: 'Published' | 'Draft';
  isActive?: boolean;
}

interface Resource {
  id: number;
  name: string;
  type: 'pdf' | 'doc';
  dateAdded: string;
  size: string;
}

const SeriesDetailManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkEdit, setBulkEdit] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const posts: SeriesPost[] = [
    {
      id: 1, order: 1, title: 'The Foundation of Quiet', sermonId: '#8291',
      date: 'Oct 12, 2023', duration: '42 mins', tags: ['Peace'],
      engagement: { views: 4200, comments: 32 }, status: 'Published',
    },
    {
      id: 2, order: 2, title: 'Building Internal Bridges', sermonId: '#8292',
      date: 'Oct 19, 2023', duration: '38 mins', tags: ['Connection'],
      engagement: { views: 3100, comments: 18 }, status: 'Published', isActive: true,
    },
    {
      id: 3, order: 3, title: 'Maintaining the Structure', sermonId: '#8293',
      date: 'Oct 26, 2023', duration: '45 mins', tags: ['Discipline'],
      engagement: { views: '--', comments: '--' }, status: 'Draft',
    },
    {
      id: 4, order: 4, title: 'The Roof of Reconciliation', sermonId: '#8294',
      date: 'Nov 02, 2023', duration: '40 mins', tags: ['Healing'],
      engagement: { views: '--', comments: '--' }, status: 'Draft',
    },
  ];

  const resources: Resource[] = [
    { id: 1, name: 'Discussion Guide.pdf', type: 'pdf', dateAdded: 'Oct 10', size: '2.4 MB' },
    { id: 2, name: 'Series_Overview.docx', type: 'doc', dateAdded: 'Oct 11', size: '450 KB' },
  ];

  const getStatusBadge = (status: SeriesPost['status']) =>
    status === 'Published' ? (
      <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
    ) : (
      <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full border border-slate-200 text-slate-500">Draft</span>
    );

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      Peace: 'bg-blue-50 text-blue-700', Connection: 'bg-blue-50 text-blue-700',
      Discipline: 'bg-blue-50 text-blue-700', Healing: 'bg-blue-50 text-blue-700',
    };
    return colors[tag] || 'bg-slate-100 text-slate-600';
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
            <span>Series Management</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-slate-900">The Architecture of Peace</span>
          </nav>

          <div className="flex items-start justify-between gap-6">
            <div className="flex gap-5">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-3xl">account_tree</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">The Architecture of Peace</h2>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">Active</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  {([
                    { icon: 'person', label: 'Author', value: 'Pastor James' },
                    { icon: 'calendar_today', label: 'Created', value: 'Oct 10, 2023' },
                    { icon: 'schedule', label: 'Duration', value: '2h 45m' },
                    { icon: 'group', label: 'Audience', value: 'General' },
                  ] as const).map((m, i) => (
                    <React.Fragment key={m.label}>
                      {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                        {m.label}: <strong>{m.value}</strong>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View as Congregation
              </button>
              <button className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-100 pt-4">
            {[
              { icon: 'visibility', bg: 'bg-blue-50 text-blue-600', label: 'Total Views', value: '12.4k', badge: '↑ 12%' },
              { icon: 'donut_large', bg: 'bg-purple-50 text-purple-600', label: 'Avg. Completion', value: '68%', badge: null },
              { icon: 'share', bg: 'bg-orange-50 text-orange-600', label: 'Shares', value: '842', badge: null },
              { icon: 'bookmark', bg: 'bg-teal-50 text-teal-600', label: 'Saves', value: '156', badge: null },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${m.bg}`}>
                  <span className="material-symbols-outlined text-lg">{m.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{m.label}</p>
                  <p className="text-sm font-bold text-slate-900">
                    {m.value}
                    {m.badge && <span className="text-green-600 text-[10px] font-normal ml-1">{m.badge}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <nav className="flex -mb-px space-x-8">
            <button className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">list_alt</span>
              Posts
              <span className="bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs ml-1">4</span>
            </button>
            {(['settings', 'analytics', 'folder_open', 'share_reviews'] as const).map((icon, i) => (
              <button key={icon} className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-lg">{icon}</span>
                {['Settings', 'Analytics', 'Resources', 'SEO/Sharing'][i]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Scrollable Content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto flex gap-6">

          {/* Left — Posts table */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Search posts in series..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={bulkEdit} onChange={(e) => setBulkEdit(e.target.checked)} />
                  <div className="relative w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  <span className="ms-2 text-xs font-medium text-slate-600">Bulk Edit</span>
                </label>
                <button className="text-slate-500 hover:text-primary p-2">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-8 px-4 py-3" />
                    {['Order', 'Post Title', 'Date/Time', 'Tags', 'Engagement', 'Status', 'Action'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 6 ? 'text-right' : 'text-left'} ${i === 1 ? 'w-1/3' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className={`group transition-colors hover:bg-slate-50 ${post.isActive ? 'bg-primary/5 border-l-4 border-primary' : ''} ${post.status === 'Draft' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <span className="material-symbols-outlined text-slate-400 text-lg" style={{ cursor: 'grab' }}>drag_indicator</span>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${post.isActive ? 'text-primary font-bold' : 'text-slate-500'}`}>
                        {post.order.toString().padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-slate-900">{post.title}</div>
                        <div className="text-xs text-slate-500">Sermon ID: {post.sermonId}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-900">{post.date}</div>
                        <div className="text-xs text-slate-500">{post.duration}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(post.tags[0])}`}>{post.tags[0]}</span>
                        {post.tags.length > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 ml-1">+{post.tags.length - 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">visibility</span>{post.engagement.views}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span>{post.engagement.comments}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(post.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="group flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-white rounded-lg transition-all w-full">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <div className="text-left">
                <span className="block text-sm font-semibold text-slate-600 group-hover:text-primary">Add Post to Series</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-tighter">Select from existing sermons or create new</span>
              </div>
            </button>
          </div>

          {/* Right — Resources + Notes */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Series Resources</h3>
                <button className="text-primary hover:opacity-80 p-1"><span className="material-symbols-outlined text-lg">add_circle</span></button>
              </div>
              <ul className="space-y-3">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer group">
                    <span className={`material-symbols-outlined text-2xl mt-0.5 ${resource.type === 'pdf' ? 'text-red-500' : 'text-blue-500'}`}>
                      {resource.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary">{resource.name}</p>
                      <p className="text-[10px] text-slate-500">Added {resource.dateAdded} · {resource.size}</p>
                    </div>
                    <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-slate-50 rounded transition-colors border border-dashed border-slate-300">
                  + Attach File
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Admin Notes</h3>
              <textarea
                className="w-full h-32 text-xs p-2 border border-slate-200 rounded-md bg-slate-50 focus:ring-primary focus:border-primary resize-none"
                placeholder="Add internal notes for other admins..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button className="text-xs text-primary font-medium hover:underline">Save Note</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeriesDetailManager;
