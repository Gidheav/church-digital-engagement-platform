/**
 * Enhanced Home Page Service - Premium Edition
 * Fetches rich, enterprise-grade content for homepage
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/public';

// Enhanced interfaces matching backend models
export interface Author {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
}

export interface ContentType {
  id: string;
  slug: string;
  name: string;
  is_system: boolean;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  author: Author;
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'HIDDEN';
  is_featured: boolean;
  featured_priority: number;
  total_views: number;
  post_count?: number;
  published_post_count?: number;
  created_at: string;
  updated_at: string;
}

export interface HomePost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  
  // Content type information
  content_type?: ContentType;
  content_type_name: string;
  content_type_slug: string;
  post_type: 'SERMON' | 'ANNOUNCEMENT' | 'ARTICLE' | 'DEVOTIONAL';
  
  // Author information
  author: Author;
  
  // Series information
  series?: Series;
  series_order: number;
  series_title?: string;
  series_slug?: string;
  
  // Publishing info
  is_published: boolean;
  published_at: string;
  status: 'DRAFT' | 'PUBLISHED';
  
  // Feature flags
  is_featured: boolean;
  featured_priority: number;
  
  // Interaction settings
  comments_enabled: boolean;
  reactions_enabled: boolean;
  
  // Media
  featured_image?: string;
  video_url?: string;
  audio_url?: string;
  
  // Analytics
  views_count: number;
  comments_count: number;
  reactions_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface HomeContent {
  // Primary featured content
  featured: HomePost | null;
  
  // Content by type
  announcements: HomePost[];
  sermons: HomePost[];
  articles: HomePost[];
  devotionals: HomePost[];
  
  // Mixed latest content
  latest: HomePost[];
  
  // Featured series
  featured_series: Series[];
  
  // Content type statistics
  content_types: Array<{
    name: string;
    slug: string;
    count: number;
  }>;
  
  // Summary statistics
  stats: {
    total_posts: number;
    total_series: number;
    total_views: number;
    active_content_types: number;
  };
}

// API Response interfaces for type safety
export interface APIHomeContent {
  featured: any;
  announcements: any[];
  sermons: any[];
  articles: any[];
  latest: any[];
}

class HomeService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    }
  });

  /**
   * Fetch comprehensive homepage content
   * Single optimized API call with rich data
   */
  async getHomeContent(): Promise<HomeContent> {
    try {
      const response = await this.api.get<APIHomeContent>('/home/');
      
      // Transform API response to match our enhanced interface
      return this.transformHomeContent(response.data);
    } catch (error: any) {
      console.error('Home service error:', error);
      
      // Enhanced error handling
      if (error.response?.status === 404) {
        throw new Error('Homepage content not found. Please check your API configuration.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to load homepage content');
    }
  }

  /**
   * Get featured series for homepage
   */
  async getFeaturedSeries(): Promise<Series[]> {
    try {
      const response = await this.api.get<Series[]>('/series/featured/');
      return response.data;
    } catch (error: any) {
      console.error('Featured series error:', error);
      return []; // Graceful degradation
    }
  }

  /**
   * Get content types with post counts
   */
  async getContentTypes(): Promise<ContentType[]> {
    try {
      const response = await this.api.get<ContentType[]>('/content-types/');
      return response.data;
    } catch (error: any) {
      console.error('Content types error:', error);
      return [];
    }
  }

  /**
   * Transform API response to enhanced format
   */
  private transformHomeContent(apiData: APIHomeContent): HomeContent {
    return {
      featured: apiData.featured ? this.transformPost(apiData.featured) : null,
      announcements: apiData.announcements?.map(post => this.transformPost(post)) || [],
      sermons: apiData.sermons?.map(post => this.transformPost(post)) || [],
      articles: apiData.articles?.map(post => this.transformPost(post)) || [],
      devotionals: [], // Will be extracted from latest if available
      latest: apiData.latest?.map(post => this.transformPost(post)) || [],
      featured_series: [], // Populated by separate call if needed
      content_types: [],
      stats: {
        total_posts: 0,
        total_series: 0,
        total_views: 0,
        active_content_types: 0
      }
    };
  }

  /**
   * Transform individual post from API format
   */
  private transformPost(apiPost: any): HomePost {
    return {
      id: apiPost.id || '',
      title: apiPost.title || '',
      content: apiPost.content || '',
      excerpt: apiPost.excerpt || this.generateExcerpt(apiPost.content || apiPost.title || ''),
      
      // Content type
      content_type_name: apiPost.content_type_name || this.getTypeLabel(apiPost.post_type || ''),
      content_type_slug: apiPost.content_type_slug || (apiPost.post_type || '').toLowerCase(),
      post_type: apiPost.post_type || 'ARTICLE',
      
      // Author
      author: {
        id: apiPost.author?.id || '',
        first_name: apiPost.author?.first_name || apiPost.author_name?.split(' ')[0] || 'Unknown',
        last_name: apiPost.author?.last_name || apiPost.author_name?.split(' ').slice(1).join(' ') || '',
        email: apiPost.author?.email || apiPost.author_email || '',
        profile_picture: apiPost.author?.profile_picture
      },
      
      // Series
      series_order: apiPost.series_order || 0,
      series_title: apiPost.series_title,
      series_slug: apiPost.series_slug,
      
      // Publishing
      is_published: apiPost.is_published ?? true,
      published_at: apiPost.published_at || apiPost.created_at || new Date().toISOString(),
      status: apiPost.status || 'PUBLISHED',
      
      // Features
      is_featured: apiPost.is_featured || false,
      featured_priority: apiPost.featured_priority || 0,
      
      // Interactions
      comments_enabled: apiPost.comments_enabled ?? true,
      reactions_enabled: apiPost.reactions_enabled ?? true,
      
      // Media
      featured_image: apiPost.featured_image,
      video_url: apiPost.video_url,
      audio_url: apiPost.audio_url,
      
      // Analytics
      views_count: apiPost.views_count || 0,
      comments_count: apiPost.comments_count || 0,
      reactions_count: apiPost.reactions_count || 0,
      
      // Metadata
      created_at: apiPost.created_at || new Date().toISOString(),
      updated_at: apiPost.updated_at || apiPost.created_at || new Date().toISOString()
    };
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 160): string {
    if (!content) return '';
    
    // Strip HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    // Cut at word boundary
    const truncated = textContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Enhanced date formatting with relative dates
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format view counts with K/M suffixes
   */
  formatViews(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    if (count === 1) {
      return '1 view';
    }
    return `${count} views`;
  }

  /**
   * Enhanced type labels matching backend content types
   */
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'SERMON': 'Sermon',
      'ANNOUNCEMENT': 'Announcement', 
      'ARTICLE': 'Article',
      'DEVOTIONAL': 'Devotional',
      'TESTIMONY': 'Testimony',
      'DISCIPLESHIP': 'Discipleship',
      'sermon': 'Sermon',
      'announcement': 'Announcement',
      'article': 'Article',
      'devotional': 'Devotional'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  /**
   * Get content type icon
   */
  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'SERMON': '🎙️',
      'ANNOUNCEMENT': '📢',
      'ARTICLE': '📝',
      'DEVOTIONAL': '🙏',
      'TESTIMONY': '💬',
      'DISCIPLESHIP': '📚',
      'sermon': '🎙️',
      'announcement': '📢',
      'article': '📝',
      'devotional': '🙏'
    };
    return icons[type.toLowerCase()] || '📄';
  }

  /**
   * Enhanced type colors matching admin theme
   */
  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'SERMON': '#2268f5',      // Primary blue
      'ANNOUNCEMENT': '#f59e0b', // Warning orange
      'ARTICLE': '#10b981',     // Success green
      'DEVOTIONAL': '#8b5cf6',  // Purple
      'TESTIMONY': '#f97316',   // Orange
      'DISCIPLESHIP': '#0891b2' // Cyan
    };
    return colors[type.toUpperCase()] || '#2268f5';
  }

  /**
   * Check if content has video
   */
  hasVideo(post: HomePost): boolean {
    return !!(post.video_url || post.featured_image?.includes('video'));
  }

  /**
   * Check if content has audio
   */
  hasAudio(post: HomePost): boolean {
    return !!(post.audio_url);
  }

  /**
   * Get engagement summary
   */
  getEngagementSummary(post: HomePost): string {
    const parts: string[] = [];
    
    if (post.views_count > 0) {
      parts.push(this.formatViews(post.views_count));
    }
    
    if (post.reactions_count > 0) {
      parts.push(`${post.reactions_count} reaction${post.reactions_count !== 1 ? 's' : ''}`);
    }
    
    if (post.comments_count > 0) {
      parts.push(`${post.comments_count} comment${post.comments_count !== 1 ? 's' : ''}`);
    }
    
    return parts.join(' • ') || 'No engagement yet';
  }
}

const homeService = new HomeService();
export default homeService;
