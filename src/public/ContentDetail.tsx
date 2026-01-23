/**
 * ContentDetail Component
 * Public page displaying single post detail
 * Shows comments/reactions only to authenticated users
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import PostContent from '../components/PostContent';
import contentService, { PublicPost } from '../services/content.service';
import CommentList from '../components/comments/CommentList';
import ReactionButtons from '../components/reactions/ReactionButtons';
import './ContentDetail.css';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPost = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const data = await contentService.getPost(id);
      setPost(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Content not found or has been removed.');
      } else {
        setError('Failed to load content.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SERMON':
        return '#87CEEB';
      case 'ANNOUNCEMENT':
        return '#FFB347';
      case 'ARTICLE':
        return '#90EE90';
      default:
        return '#87CEEB';
    }
  };

  if (loading) {
    return (
      <div className="content-detail-page">
        <Header />
        <div className="content-detail-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="content-detail-page">
        <Header />
        <div className="content-detail-container">
          <div className="error-page">
            <h1>404</h1>
            <p>{error || 'Content not found'}</p>
            <Link to="/content" className="btn-back">
              Back to Content List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-detail-page">
      <Header />
      <div className="content-detail-container">
      <div className="content-detail-header">
        <Link to="/content" className="btn-back-link">
          &larr; Back to all content
        </Link>
      </div>

      <article className="content-detail">
        <div className="content-meta-top">
          <span
            className="content-type-badge"
            style={{ backgroundColor: getTypeColor(post.post_type) }}
          >
            {post.post_type}
          </span>
          <span className="content-views">{post.views_count} views</span>
        </div>

        <h1 className="content-title">{post.title}</h1>

        <div className="content-author-date">
          <span className="content-author">By {post.author_name}</span>
          <span className="content-separator">•</span>
          <span className="content-date">{formatDate(post.published_at)}</span>
        </div>

        {post.featured_image && (
          <div className="content-featured-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}

        <PostContent content={post.content} className="content-body" />

        {post.video_url && (
          <div className="content-media">
            <h3>Video</h3>
            <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="media-link">
              Watch Video
            </a>
          </div>
        )}

        {post.audio_url && (
          <div className="content-media">
            <h3>Audio</h3>
            <a href={post.audio_url} target="_blank" rel="noopener noreferrer" className="media-link">
              Listen to Audio
            </a>
          </div>
        )}

        <div className="content-stats">
          <span>{post.comments_count} comments</span>
          <span>{post.reactions_count} reactions</span>
        </div>

        {/* Reaction Buttons - only if enabled */}
        {post.reactions_enabled ? (
          <ReactionButtons postId={post.id} reactionsEnabled={true} />
        ) : (
          <ReactionButtons postId={post.id} reactionsEnabled={false} />
        )}

        {/* Comment System - only if enabled */}
        {post.comments_enabled ? (
          <CommentList postId={post.id} commentsEnabled={true} />
        ) : (
          <CommentList postId={post.id} commentsEnabled={false} />
        )}
      </article>
      </div>
    </div>
  );
};

export default ContentDetail;
