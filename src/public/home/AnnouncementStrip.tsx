/**
 * AnnouncementStrip Component
 * Compact list of latest announcements
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';

interface AnnouncementStripProps {
  announcements: HomePost[];
}

const AnnouncementStrip: React.FC<AnnouncementStripProps> = ({ announcements }) => {
  if (announcements.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="announcement-strip">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Latest Announcements</h2>
          <Link to="/content?type=ANNOUNCEMENT" className="section-view-all">
            View All
          </Link>
        </div>
        <div className="announcement-list">
          {announcements.map((announcement) => (
            <Link
              key={announcement.id}
              to={`/content/${announcement.id}`}
              className="announcement-item"
            >
              <span className="announcement-date">{formatDate(announcement.published_at)}</span>
              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-excerpt">{announcement.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementStrip;
