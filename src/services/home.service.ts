/**
 * Home Page Service
 * Fetches aggregate editorial content for homepage
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/public';

export interface HomePost {
  id: string;
  title: string;
  excerpt: string;
  type: 'SERMON' | 'ANNOUNCEMENT' | 'ARTICLE' | 'DEVOTIONAL' | 'TESTIMONY';
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
  featured_image?: string;
  views_count: number;
}

export interface HomeContent {
  featured: HomePost | null;
  announcements: HomePost[];
  sermons: HomePost[];
  articles: HomePost[];
  latest: HomePost[];
}

class HomeService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  });

  /**
   * Fetch aggregate homepage content
   * Single optimized API call
   */
  async getHomeContent(): Promise<HomeContent> {
    const response = await this.api.get<HomeContent>('/home/');
    return response.data;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get type display name
   */
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      SERMON: 'Sermon',
      ANNOUNCEMENT: 'Announcement',
      ARTICLE: 'Article',
      DEVOTIONAL: 'Devotional'
    };
    return labels[type] || type;
  }

  /**
   * Get type color (Sky Blue theme)
   */
  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      SERMON: '#87CEEB',      // Sky Blue
      ANNOUNCEMENT: '#FF8C42', // Orange
      ARTICLE: '#4CAF50',     // Green
      DEVOTIONAL: '#9B59B6'   // Purple
    };
    return colors[type] || '#87CEEB';
  }
}

const homeService = new HomeService();
export default homeService;
