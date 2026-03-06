/**
 * PostsTab - Manage posts in the series with drag-to-reorder
 */
import React, { useCallback, useMemo } from 'react';
import { SeriesPost } from '../../../../services/series.service';
import Icon from '../../../../components/common/Icon';
import { fmtDate } from '../helpers/series-detail.helpers';

interface PostsTabProps {
  posts: SeriesPost[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddPost: () => void;
  onSaveOrder: () => void;
  onRemovePost: (postId: string) => void;
  onMovePost: (postId: string, direction: 'up' | 'down') => void;
  onDragStart: (postId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (targetId: string) => void;
  draggedId: string | null;
  removingId: string | null;
  savingOrder: boolean;
}

const PostsTab: React.FC<PostsTabProps> = React.memo(({
  posts,
  searchTerm,
  onSearchChange,
  onAddPost,
  onSaveOrder,
  onRemovePost,
  onMovePost,
  onDragStart,
  onDragOver,
  onDrop,
  draggedId,
  removingId,
  savingOrder,
}) => {
  const filteredPosts = useMemo(
    () => posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [posts, searchTerm]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" size={18} />
          </span>
          <input
            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddPost}
            className="border border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Icon name="add" size={14} />
            Add Post
          </button>
          <button
            onClick={onSaveOrder}
            disabled={savingOrder}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
          >
            <Icon name={savingOrder ? 'hourglass_empty' : 'save'} size={14} />
            {savingOrder ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Icon name="article" size={48} className="text-slate-300" />
          <p className="mt-2 font-semibold">No posts in this series yet</p>
          <p className="text-xs mt-1 text-slate-400 mb-4">Add posts to this series to get started</p>
          <button
            onClick={onAddPost}
            className="border border-primary text-primary hover:bg-primary/5 px-5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Icon name="add" size={14} />
            Add Post
          </button>
        </div>
      )}

      {/* Post rows */}
      {filteredPosts.length > 0 && (
        <div className="flex flex-col gap-2">
          {filteredPosts.map((post, idx) => (
            <div
              key={post.id}
              draggable
              onDragStart={() => onDragStart(post.id)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(post.id)}
              className={[
                'bg-white rounded-xl p-4 flex items-center gap-4 border transition-all select-none',
                post.is_published ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-70',
                draggedId === post.id ? 'opacity-40 scale-[0.98]' : '',
              ].join(' ')}
            >
              <div className="text-slate-300 cursor-grab active:cursor-grabbing">
                <Icon name="drag_indicator" />
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onMovePost(post.id, 'up')}
                  disabled={idx === 0}
                  className="p-0.5 text-slate-300 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-default"
                  title="Move up"
                >
                  <Icon name="keyboard_arrow_up" size={16} className="leading-none" />
                </button>
                <button
                  onClick={() => onMovePost(post.id, 'down')}
                  disabled={idx === filteredPosts.length - 1}
                  className="p-0.5 text-slate-300 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-default"
                  title="Move down"
                >
                  <Icon name="keyboard_arrow_down" size={16} className="leading-none" />
                </button>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                {post.featured_image ? (
                  <img src={post.featured_image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Icon name="article" size={18} className="text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  Part {idx + 1}: {post.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                  {post.author_name && <span>{post.author_name}</span>}
                  {post.author_name && post.published_at && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                  {post.published_at && <span>{fmtDate(post.published_at)}</span>}
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{(post.views_count || 0).toLocaleString()} views</span>
                  {post.content_type_name && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{post.content_type_name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {post.is_published ? (
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                    Published
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Draft
                  </span>
                )}
                <button
                  onClick={() => onRemovePost(post.id)}
                  disabled={removingId === post.id}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remove from series"
                >
                  <Icon name={removingId === post.id ? 'hourglass_empty' : 'delete'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

PostsTab.displayName = 'PostsTab';
export default PostsTab;
