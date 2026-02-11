/**
 * Member Settings Page - Enterprise Edition
 * Professional settings interface matching Admin Dashboard design
 */

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import emailVerificationService from '../services/emailVerification.service';
import { Card } from '../shared/components/Card';
import { MailIcon } from '../shared/components/Icons';
import '../shared/styles/theme.css';
import './styles/MemberSettings.css';

const MemberSettings: React.FC = () => {
  const { user } = useAuth();
  
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleSendVerificationEmail = async () => {
    setVerificationLoading(true);
    setVerificationMessage(null);

    try {
      console.log('[DEBUG] SENDING VERIFICATION EMAIL...');
      const result = await emailVerificationService.initiateVerification();
      console.log('[SUCCESS] VERIFICATION RESPONSE:', result);
      setVerificationMessage({
        type: 'success',
        text: `${result.message}. The link will expire in ${result.expires_in_minutes} minutes.`,
      });
      
      // Start cooldown
      setCooldownSeconds(60);
      const interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('[ERROR] VERIFICATION FAILED:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        fullError: error,
      });
      // Display the actual error message from backend or error object
      const errorMessage = error.message || error.response?.data?.error || 'Failed to send verification email';
      const retryAfter = error.response?.data?.retry_after_seconds;
      
      setVerificationMessage({
        type: 'error',
        text: errorMessage,
      });

      if (retryAfter) {
        setCooldownSeconds(retryAfter);
        const interval = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setVerificationLoading(true);
    setVerificationMessage(null);

    try {
      const result = await emailVerificationService.resendVerification();
      setVerificationMessage({
        type: 'success',
        text: `${result.message}. The link will expire in ${result.expires_in_minutes} minutes.`,
      });
      
      // Start cooldown
      setCooldownSeconds(60);
      const interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend verification email';
      const retryAfter = error.response?.data?.retry_after_seconds;
      
      setVerificationMessage({
        type: 'error',
        text: errorMessage,
      });

      if (retryAfter) {
        setCooldownSeconds(retryAfter);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <div className="dashboard-pro">
      {/* Account Information */}
      <div className="section-pro">
        <Card title="Account Information" subtitle="Your personal details">
          <div className="info-grid-pro">
            <div className="info-item-pro">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Name</span>
              <span className="info-value">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Role</span>
              <span className="role-badge">{user?.role}</span>
            </div>
            <div className="info-item-pro">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.dateJoined ? new Date(user.dateJoined).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Verification */}
      <div className="section-pro">
        <Card title="Email Verification" subtitle="Verify your email address for full access">
          {user?.emailVerified ? (
            <div className="status-box status-success">
              <div className="status-icon">
                <MailIcon size={24} />
              </div>
              <div className="status-content">
                <h3 className="status-heading">Email Verified</h3>
                <p className="status-text">
                  Your email address was verified on{' '}
                  {user.emailVerifiedAt
                    ? new Date(user.emailVerifiedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <div className="status-box status-warning">
              <div className="status-icon">
                <MailIcon size={24} />
              </div>
              <div className="status-content">
                <h3 className="status-heading">Email Not Verified</h3>
                <p className="status-text">
                  Your email address has not been verified. Please click the button below to
                  receive a verification link.
                </p>
                
                {verificationMessage && (
                  <div className={`alert alert-${verificationMessage.type}`}>
                    {verificationMessage.text}
                  </div>
                )}
                
                <div className="status-actions">
                  <button
                    onClick={handleSendVerificationEmail}
                    disabled={verificationLoading || cooldownSeconds > 0}
                    className="btn-primary"
                  >
                    {verificationLoading ? (
                      'Sending...'
                    ) : cooldownSeconds > 0 ? (
                      `Wait ${cooldownSeconds}s`
                    ) : (
                      'Send Verification Email'
                    )}
                  </button>
                  
                  {verificationMessage?.type === 'success' && (
                    <button
                      onClick={handleResendVerificationEmail}
                      disabled={verificationLoading || cooldownSeconds > 0}
                      className="btn-secondary"
                    >
                      {cooldownSeconds > 0 ? `Resend (${cooldownSeconds}s)` : 'Resend Email'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Security Settings */}
      <div className="section-pro">
        <Card title="Security" subtitle="Manage your account security">
          <div className="settings-content">
            <p className="settings-description">
              Keep your account secure by regularly updating your password.
            </p>
            <button className="btn-secondary">Change Password</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemberSettings;
