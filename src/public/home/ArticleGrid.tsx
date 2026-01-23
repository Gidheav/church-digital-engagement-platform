/**
 * ArticleGrid Component
 * Featured articles in grid layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { HomePost } from '../../services/home.service';

interface ArticleGridProps {
  articles: HomePost[];
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles }) => {
  if (articles.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="article-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Articles</h2>
          <Link to="/content?type=ARTICLE" className="section-view-all">
            View All
          </Link>
        </div>
        <div className="article-grid">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/content/${article.id}`}
              className="article-card"
            >
              {article.featured_image && (
                <div className="article-image">
                  <img src={article.featured_image} alt={article.title} />
                </div>
              )}
              <div className="article-content">
                <h3 className="article-title">{article.title}</h3>
                <div className="article-meta">
                  <span className="article-author">
                    {article.author.first_name} {article.author.last_name}
                  </span>
                  <span className="article-date">{formatDate(article.published_at)}</span>
                </div>
                <p className="article-excerpt">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticleGrid;
