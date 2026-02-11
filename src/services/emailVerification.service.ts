/**
 * Email Verification API Service
 * 
 * Handles all email verification related API calls.
 */

import { AxiosResponse } from 'axios';
import api from './api.service';

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  expires_in_minutes?: number;
  verified_at?: string;
}

export interface RateLimitError {
  error: string;
  retry_after_seconds?: number;
}

class EmailVerificationService {
  /**
   * Initiate email verification process
   * Sends a verification email to the authenticated user
   */
  async initiateVerification(): Promise<EmailVerificationResponse> {
    try {
      const response: AxiosResponse<EmailVerificationResponse> = await api.post(
        '/users/auth/verify-email/initiate/'
      );
      return response.data;
    } catch (error: any) {
      // LOG THE COMPLETE ERROR OBJECT FOR DEBUGGING
      console.log('========== COMPLETE ERROR OBJECT ==========');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Headers:', error.response?.headers);
      console.log('Data:', error.response?.data);
      console.log('Config URL:', error.config?.url);
      console.log('Config Method:', error.config?.method);
      console.log('Config Headers:', error.config?.headers);
      console.log('Message:', error.message);
      console.log('==========================================');
      
      // Extract the actual error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message ||
                          'Failed to send verification email';
      
      // Create a new error with the actual message
      const enhancedError: any = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.status = error.response?.status;
      throw enhancedError;
    }
  }

  /**
   * Resend verification email
   * Rate-limited to prevent abuse
   */
  async resendVerification(): Promise<EmailVerificationResponse> {
    const response: AxiosResponse<EmailVerificationResponse> = await api.post(
      '/users/auth/verify-email/resend/'
    );
    return response.data;
  }

  /**
   * Verify email with token from email link
   */
  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response: AxiosResponse<EmailVerificationResponse> = await api.post(
      '/users/auth/verify-email/verify/',
      { token }
    );
    return response.data;
  }
}

export default new EmailVerificationService();
