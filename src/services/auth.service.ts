/**
 * Authentication Service
 * 
 * Handles user authentication operations:
 * - Login
 * - Registration
 * - Logout
 * - Token management
 */

import { apiService } from './api.service';
import { 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest 
} from '../types/auth.types';

class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    // Fetch CSRF token before login
    await apiService.fetchCsrfToken();
    
    const response = await apiService.post('/auth/login/', credentials);
    
    // Store tokens
    if (response.access && response.refresh) {
      localStorage.setItem('auth_tokens', JSON.stringify({
        access: response.access,
        refresh: response.refresh
      }));
    }
    
    return {
      user: response.user,
      tokens: {
        access: response.access,
        refresh: response.refresh
      }
    };
  }

  /**
   * User registration
   */
  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    // Fetch CSRF token before registration
    await apiService.fetchCsrfToken();
    
    console.log('Registration data being sent:', data);
    const response = await apiService.post('/auth/register/', data);
    
    // Store tokens
    if (response.access && response.refresh) {
      localStorage.setItem('auth_tokens', JSON.stringify({
        access: response.access,
        refresh: response.refresh
      }));
    }
    
    return {
      user: response.user,
      tokens: {
        access: response.access,
        refresh: response.refresh
      }
    };
  }

  /**
   * User logout
   */
  async logout(): Promise<void> {
    const tokensStr = localStorage.getItem('auth_tokens');
    if (tokensStr) {
      const tokens = JSON.parse(tokensStr);
      try {
        await apiService.post('/auth/logout/', { refresh: tokens.refresh });
      } catch (error) {
        // Ignore error, clear tokens anyway
      }
    }
    localStorage.removeItem('auth_tokens');
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return await apiService.get('/auth/me/');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const tokensStr = localStorage.getItem('auth_tokens');
    return !!tokensStr;
  }
}

export const authService = new AuthService();
export default authService;

/**
 * Admin Authentication Service
 * Separate endpoints for admin registration and login
 */

const API_URL = 'http://localhost:8000/api/v1';

interface AdminRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const adminAuthService = {
  async register(data: AdminRegisterData): Promise<AuthResponse> {
    const url = `${API_URL}/admin-auth/register/`;
    console.log('Register URL:', url);
    
    try {
      // First check with a simple OPTIONS request
      const testResponse = await fetch(url, { method: 'OPTIONS' });
      console.log('OPTIONS Response:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries())
      });
      
      // Now try the POST
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',  // Add this
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });

      console.log('POST Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url  // Check if URL changed
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Registration error:', error);
        throw new Error(error || 'Registration failed');
      }

      return response.json();
      
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const url = `${API_URL}/admin-auth/login/`;
    console.log('Login URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login Response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Login error:', error);
        throw new Error(error || 'Login failed');
      }

      return response.json();
      
    } catch (error) {
      console.error('Login network error:', error);
      throw error;
    }
  },
};
