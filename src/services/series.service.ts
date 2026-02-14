/**
 * Series Service
 * Admin API for managing series
 */

import axios, { AxiosInstance } from 'axios';
import {
  Series,
  SeriesDetail,
  SeriesPost,
  SeriesCreateData,
  SeriesUpdateData,
  AddPostToSeriesData,
  RemovePostFromSeriesData,
  ReorderSeriesPostsData,
} from '../types/series.types';

const API_URL = 'http://localhost:8000/api/v1/admin/series';
const PUBLIC_API_URL = 'http://localhost:8000/api/v1/public/series';

class SeriesService {
  private api: AxiosInstance;
  private publicApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.publicApi = axios.create({
      baseURL: PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('auth_tokens');
        if (token) {
          if (token.startsWith('{')) {
            try {
              const tokens = JSON.parse(token);
              config.headers.Authorization = `Bearer ${tokens.access}`;
            } catch {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } else {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all series (admin)
   */
  async getAllSeries(filters?: {
    visibility?: string;
    is_featured?: boolean;
    search?: string;
  }): Promise<Series[]> {
    const params = new URLSearchParams();
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters?.search) params.append('search', filters.search);

    const response = await this.api.get(`/?${params.toString()}`);
    
    // Handle both paginated and non-paginated responses
    if (response.data.results !== undefined) {
      return response.data.results;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get single series by ID (admin)
   */
  async getSeries(id: string): Promise<SeriesDetail> {
    const response = await this.api.get(`/${id}/`);
    return response.data;
  }

  /**
   * Create new series
   */
  async createSeries(data: SeriesCreateData): Promise<Series> {
    const response = await this.api.post('/', data);
    return response.data;
  }

  /**
   * Update existing series
   */
  async updateSeries(id: string, data: SeriesUpdateData): Promise<Series> {
    const response = await this.api.patch(`/${id}/`, data);
    return response.data;
  }

  /**
   * Delete series (soft delete)
   */
  async deleteSeries(id: string): Promise<void> {
    await this.api.delete(`/${id}/`);
  }

  /**
   * Get all posts in a series
   */
  async getSeriesPosts(id: string): Promise<SeriesPost[]> {
    const response = await this.api.get(`/${id}/posts/`);
    return response.data;
  }

  /**
   * Add a post to a series
   */
  async addPostToSeries(id: string, data: AddPostToSeriesData): Promise<{ message: string; series_order: number }> {
    const response = await this.api.post(`/${id}/add_post/`, data);
    return response.data;
  }

  /**
   * Remove a post from a series
   */
  async removePostFromSeries(id: string, data: RemovePostFromSeriesData): Promise<{ message: string }> {
    const response = await this.api.post(`/${id}/remove_post/`, data);
    return response.data;
  }

  /**
   * Reorder posts in a series
   */
  async reorderSeriesPosts(id: string, data: ReorderSeriesPostsData): Promise<{ message: string }> {
    const response = await this.api.post(`/${id}/reorder/`, data);
    return response.data;
  }

  // PUBLIC ENDPOINTS

  /**
   * Get public series list
   */
  async getPublicSeries(filters?: {
    visibility?: string;
    is_featured?: boolean;
    search?: string;
  }): Promise<Series[]> {
    const params = new URLSearchParams();
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.is_featured !== undefined) params.append('is_featured', String(filters.is_featured));
    if (filters?.search) params.append('search', filters.search);

    const response = await this.publicApi.get(`/?${params.toString()}`);
    
    // Handle both paginated and non-paginated responses
    if (response.data.results !== undefined) {
      return response.data.results;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get single public series by slug
   */
  async getPublicSeriesBySlug(slug: string): Promise<SeriesDetail> {
    const response = await this.publicApi.get(`/${slug}/`);
    return response.data;
  }

  /**
   * Get featured series for homepage
   */
  async getFeaturedSeries(): Promise<Series[]> {
    const response = await this.publicApi.get('/featured/');
    
    // Handle both paginated and non-paginated responses
    if (response.data.results !== undefined) {
      return response.data.results;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }
}

export default new SeriesService();
