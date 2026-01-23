/**
 * Comment Service
 * API client for comment operations (public read, authenticated write)
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface CommentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface Comment {
  id: string;
  post: string;
  user: CommentUser;
  content: string;
  parent: string | null;
  is_deleted: boolean;
  is_question: boolean;
  question_status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  answered_by: CommentUser | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  replies: Comment[];
  reply_count: number;
}

export interface CreateCommentData {
  content: string;
  post: string;
  parent?: string;
  is_question?: boolean;
}

class CommentService {
  private api = axios.create({
    baseURL: API_BASE_URL,
  });

  constructor() {
    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get JWT access token from localStorage
   */
  private getToken(): string | null {
    const tokensStr = localStorage.getItem('auth_tokens');
    if (!tokensStr) return null;

    try {
      const tokens = JSON.parse(tokensStr);
      return tokens?.access || null;
    } catch {
      return null;
    }
  }

  /**
   * Get all comments for a post (public - no auth required)
   */
  async getComments(postId: string): Promise<Comment[]> {
    const response = await this.api.get(`/public/comments/`, {
      params: { post_id: postId }
    });
    // Handle both paginated and non-paginated responses
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Create a new comment (authenticated members only)
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    const response = await this.api.post<Comment>('/comments/', data);
    return response.data;
  }

  /**
   * Reply to a comment (authenticated members only)
   */
  async replyToComment(parentId: string, content: string, postId: string, isQuestion?: boolean): Promise<Comment> {
    const response = await this.api.post<Comment>(`/comments/${parentId}/reply/`, {
      content,
      post: postId,
      is_question: isQuestion || false
    });
    return response.data;
  }

  /**
   * Delete a comment (admin only)
   */
  async deleteComment(commentId: string): Promise<void> {
    await this.api.delete(`/admin/comments/${commentId}/`);
  }

  /**
   * Restore a deleted comment (admin only)
   */
  async restoreComment(commentId: string): Promise<Comment> {
    const response = await this.api.patch<Comment>(`/admin/comments/${commentId}/restore/`);
    return response.data;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get user initials for avatar
   */
  getUserInitials(user: CommentUser): string {
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  }
}

const commentService = new CommentService();
export default commentService;
