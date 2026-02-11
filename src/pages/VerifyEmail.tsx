/**
 * Email Verification Page
 * 
 * Handles email verification via token from email link.
 * Route: /verify-email?token=TOKEN
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import emailVerificationService from '../services/emailVerification.service';
import './VerifyEmail.css';

type VerificationStatus = 'verifying' | 'success' | 'error';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const verifyToken = async () => {
      // Parse token from URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in URL.');
        return;
      }

      if (!user) {
        setStatus('error');
        setMessage('You must be logged in to verify your email.');
        return;
      }

      try {
        // Verify the email
        const result = await emailVerificationService.verifyEmail(token);
        
        setStatus('success');
        setMessage(result.message);
        
        // Refresh user data to update email_verified status
        await refreshUser();
        
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.error || 'Failed to verify email. Please try again.';
        setMessage(errorMessage);
      }
    };

    verifyToken();
  }, [location.search, user, refreshUser]);

  const handleContinue = () => {
    if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
      navigate('/admin');
    } else {
      navigate('/member');
    }
  };

  const handleGoToSettings = () => {
    navigate('/member/settings');
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="verify-email-card">
          {status === 'verifying' && (
            <>
              <div className="status-icon verifying">
                <span className="spinner">⏳</span>
              </div>
              <h1>Verifying Your Email</h1>
              <p>Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="status-icon success">
                <span>✓</span>
              </div>
              <h1>Email Verified Successfully!</h1>
              <p>{message}</p>
              <div className="action-buttons">
                <button onClick={handleContinue} className="btn-primary">
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="status-icon error">
                <span>✕</span>
              </div>
              <h1>Verification Failed</h1>
              <p className="error-message">{message}</p>
              
              <div className="error-help">
                <h3>Common Issues:</h3>
                <ul>
                  <li>The verification link may have expired (links are valid for 30 minutes)</li>
                  <li>Your email may already be verified</li>
                  <li>You may have used this link before</li>
                  <li>You need to be logged in to verify your email</li>
                </ul>
              </div>
              
              <div className="action-buttons">
                {user ? (
                  <>
                    <button onClick={handleGoToSettings} className="btn-primary">
                      Go to Settings
                    </button>
                    <button onClick={handleContinue} className="btn-secondary">
                      Back to Dashboard
                    </button>
                  </>
                ) : (
                  <button onClick={() => navigate('/')} className="btn-primary">
                    Go to Login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
