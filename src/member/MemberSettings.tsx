/**
 * Member Settings Page - Enterprise Edition
 * Professional settings interface matching Admin Dashboard design
 * 
 * Features:
 * - Email verification with cooldown timer
 * - Persistent cooldown state with localStorage
 * - Toast notifications for user feedback
 * - Conditional rendering based on verification status
 * - Auto-refresh user data after verification
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../contexts/ToastContext';
import emailVerificationService from '../services/emailVerification.service';
import { Card } from '../shared/components/Card';
import { MailIcon } from '../shared/components/Icons';
import '../shared/styles/theme.css';
import './styles/MemberSettings.css';

const VERIFICATION_COOLDOWN_KEY = 'email_verification_cooldown';
const COOLDOWN_DURATION = 60; // seconds

const MemberSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  let cooldownInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    refreshUser();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshUser]);

  // Initialize cooldown from localStorage
  useEffect(() => {
    const storedCooldown = localStorage.getItem(VERIFICATION_COOLDOWN_KEY);
    if (storedCooldown) {
      const expiresAt = parseInt(storedCooldown, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      
      if (remaining > 0) {
        setCooldownSeconds(remaining);
      } else {
        localStorage.removeItem(VERIFICATION_COOLDOWN_KEY);
      }
    }
  }, []);

  // Handle cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (cooldownInterval) clearInterval(cooldownInterval);
      localStorage.removeItem(VERIFICATION_COOLDOWN_KEY);
      return;
    }

    cooldownInterval = setInterval(() => {
      setCooldownSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          localStorage.removeItem(VERIFICATION_COOLDOWN_KEY);
          if (cooldownInterval) clearInterval(cooldownInterval);
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  }, [cooldownSeconds]);

  const startCooldown = (duration: number = COOLDOWN_DURATION) => {
    const expiresAt = Date.now() + duration * 1000;
    localStorage.setItem(VERIFICATION_COOLDOWN_KEY, expiresAt.toString());
    setCooldownSeconds(duration);
  };

  const handleSendVerificationEmail = async () => {
    if (cooldownSeconds > 0) {
      showError(`Please wait ${cooldownSeconds} seconds before requesting again`);
      return;
    }

    setVerificationLoading(true);

    try {
      console.log('[DEBUG] SENDING VERIFICATION EMAIL...');
      const result = await emailVerificationService.initiateVerification();
      console.log('[SUCCESS] VERIFICATION RESPONSE:', result);
      
      showSuccess(
        `Verification email sent successfully! The link will expire in ${result.expires_in_minutes} minutes.`
      );
      
      startCooldown();
      
    } catch (error: any) {
      console.error('[ERROR] VERIFICATION FAILED:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      const errorMessage = 
        error.message || 
        error.response?.data?.error || 
        error.response?.data?.detail ||
        'Failed to send verification email';
      
      const retryAfter = error.response?.data?.retry_after_seconds;
      
      showError(errorMessage);

      if (retryAfter) {
        startCooldown(retryAfter);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="settings-page-wrapper">
      {/* Page Header */}
      <div className="settings-page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p className="subtitle">Manage your account details, verification, and security</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="settings-content">
        {/* Account Information */}
        <Card title="Account Information" subtitle="Your personal details">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="role-badge">{user?.role}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        {/* Security & Verification */}
        <Card title="Security & Verification" subtitle="Manage email verification and password">
          <div className="security-sections">
            {/* Email Verification Section */}
            <div className="security-section">
              <div className="section-header">
                <h4 className="section-title">Email Verification</h4>
              </div>
              {user?.emailVerified ? (
                <div className="status-box status-success">
                  <div className="status-icon">
                    <MailIcon size={32} />
                  </div>
                  <div className="status-content">
                    <h3 className="status-heading">Email Verified</h3>
                    <p className="status-text">
                      Your email address <strong>{user?.email}</strong> is verified.
                    </p>
                    {user.emailVerifiedAt && (
                      <p className="status-date">
                        Verified on {new Date(user.emailVerifiedAt).toLocaleDateString()} at{' '}
                        {new Date(user.emailVerifiedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="status-box status-warning">
                  <div className="status-icon">
                    <MailIcon size={32} />
                  </div>
                  <div className="status-content">
                    <h3 className="status-heading">Email Not Verified</h3>
                    <p className="status-text">
                      Your email address <strong>{user?.email}</strong> has not been verified yet.
                    </p>
                    <p className="status-description">
                      We'll send you a verification email. Click the link to complete verification. Valid for 30 minutes.
                    </p>
                    
                    <div className="status-actions">
                      <button
                        onClick={handleSendVerificationEmail}
                        disabled={verificationLoading || cooldownSeconds > 0}
                        className="btn-primary"
                        aria-label="Send verification email"
                      >
                        {verificationLoading ? (
                          <>
                            <span className="spinner-mini"></span>
                            Sending...
                          </>
                        ) : cooldownSeconds > 0 ? (
                          `Wait ${cooldownSeconds}s`
                        ) : (
                          'Send Verification Email'
                        )}
                      </button>
                    </div>
                    
                    {cooldownSeconds > 0 && (
                      <p className="status-note">
                        Please wait {cooldownSeconds} seconds before requesting again.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="security-section">
              <div className="section-header">
                <h4 className="section-title">Password</h4>
              </div>
              <p className="section-description">
                Keep your account secure by regularly updating your password.
              </p>
              <button className="btn-secondary">Change Password</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemberSettings;
