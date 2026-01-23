/**
 * SermonList Component
 * Recent sermons display
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';

interface SermonListProps {
  sermons: HomePost[];
}

const SermonList: React.FC<SermonListProps> = ({ sermons }) => {
  if (sermons.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="sermon-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Recent Sermons</h2>
          <Link to="/content?type=SERMON" className="section-view-all">
            View All
          </Link>
        </div>
        <div className="sermon-grid">
          {sermons.map((sermon) => (
            <Link
              key={sermon.id}
              to={`/content/${sermon.id}`}
              className="sermon-card"
            >
              {sermon.featured_image && (
                <div className="sermon-image">
                  <img src={sermon.featured_image} alt={sermon.title} />
                </div>
              )}
              <div className="sermon-content">
                <h3 className="sermon-title">{sermon.title}</h3>
                <p className="sermon-preacher">
                  {sermon.author.first_name} {sermon.author.last_name}
                </p>
                <p className="sermon-date">{formatDate(sermon.published_at)}</p>
                <p className="sermon-excerpt">{sermon.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SermonList;
