/**
 * Series Manager - Post Organizer
 * Drag-and-drop post ordering for a series. Renders inside AdminLayout.
 */
import React, { useState } from 'react';

interface SeriesPost {
  id: number;
  part: number;
  title: string;
  date: string;
  duration: string;
  status: 'Published' | 'Draft';
  isActive?: boolean;
}

const SeriesManager: React.FC = () => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const [posts, setPosts] = useState<SeriesPost[]>([
    { id: 1, part: 1, title: 'The Foundation of Quiet', date: 'Oct 12, 2023', duration: '42 min', status: 'Published' },
    { id: 2, part: 2, title: 'Building Internal Bridges', date: 'Oct 19, 2023', duration: '38 min', status: 'Published', isActive: true },
    { id: 3, part: 3, title: 'Maintaining the Structure', date: 'Oct 26, 2023', duration: '45 min', status: 'Draft' },
    { id: 4, part: 4, title: 'The Roof of Reconciliation', date: 'Nov 02, 2023', duration: '40 min', status: 'Draft' },
  ]);

  const handleDragStart = (id: number) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: number) => {
    if (draggedItem === null) return;
    const draggedIndex = posts.findIndex(p => p.id === draggedItem);
    const targetIndex = posts.findIndex(p => p.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newPosts = [...posts];
    const [dragged] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, dragged);
    setPosts(newPosts);
    setDraggedItem(null);
  };
  const handleRemovePost = (id: number) => setPosts(posts.filter(p => p.id !== id));

  const getStatusBadge = (status: SeriesPost['status']) =>
    status === 'Published' ? (
      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">Published</span>
    ) : (
      <span className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">Draft</span>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Series Management</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-slate-900">The Architecture of Peace</span>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">account_tree</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Architecture of Peace</h2>
            </div>
            <button className="bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">save</span>
              Save Order
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable post list */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              draggable
              onDragStart={() => handleDragStart(post.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(post.id)}
              className={[
                'bg-white rounded-xl p-4 flex items-center gap-4 transition-all',
                post.isActive
                  ? 'border-2 border-primary ring-4 ring-primary/5 shadow-xl'
                  : 'border border-slate-200 hover:border-slate-300',
                post.status === 'Draft' && !post.isActive ? 'opacity-50' : '',
              ].join(' ')}
            >
              <div className="text-slate-400 p-1 flex items-center" style={{ cursor: 'grab' }}>
                <span className="material-symbols-outlined">drag_indicator</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Part {post.part}: {post.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>{post.date}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>{post.duration}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(post.status)}
                <button
                  onClick={() => handleRemovePost(post.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove from Series"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}

          <button className="mt-4 group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/20 transition-colors mb-2">
              <span className="material-symbols-outlined text-2xl">add</span>
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-primary">Add Post to Series</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">Select from existing sermons or create new</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesManager;
