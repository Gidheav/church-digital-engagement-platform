/**
 * FeaturedSection Component
 * Large hero section showcasing featured content
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';

interface FeaturedSectionProps {
  post: HomePost | null;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ post }) => {
  if (!post) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="featured-section">
      <div className="featured-container">
        {post.featured_image && (
          <div className="featured-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}
        <div className="featured-content">
          <span className="featured-label">Featured</span>
          <h1 className="featured-title">{post.title}</h1>
          <div className="featured-meta">
            <span className="featured-author">
              {post.author.first_name} {post.author.last_name}
            </span>
            <span className="featured-date">{formatDate(post.published_at)}</span>
          </div>
          <p className="featured-excerpt">{post.excerpt}</p>
          <Link to={`/content/${post.id}`} className="featured-read-more">
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
