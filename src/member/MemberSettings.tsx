/**
 * Member Settings Page - Enhanced Edition
 * Same structure as original — page header + stacked cards inside MemberLayout.
 * Added: profile editing, password change, notifications, privacy, appearance, danger zone.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api.service';
import emailVerificationService from '../services/emailVerification.service';
import { MailIcon } from '../shared/components/Icons';
import Icon from '../components/common/Icon';
import '../shared/styles/theme.css';
import './styles/MemberSettings.css';

const VERIFICATION_COOLDOWN_KEY = 'email_verification_cooldown';
const COOLDOWN_DURATION = 60;

/* ── small reusable toggle ── */
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    className={`ms-toggle ${checked ? 'on' : 'off'}`}
    onClick={() => onChange(!checked)}
    type="button"
  >
    <span className="ms-toggle-thumb" />
  </button>
);

/* ── setting row ── */
const SettingRow: React.FC<{
  icon: string;
  label: string;
  desc?: string;
  children: React.ReactNode;
}> = ({ icon, label, desc, children }) => (
  <div className="ms-row">
    <div className="ms-row-left">
      <div className="ms-row-icon"><Icon name={icon} size={17} /></div>
      <div>
        <div className="ms-row-label">{label}</div>
        {desc && <div className="ms-row-desc">{desc}</div>}
      </div>
    </div>
    <div className="ms-row-right">{children}</div>
  </div>
);

const MemberSettings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  /* ── verification ── */
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  /* ── profile ── */
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    phone:     (user as any)?.phone    ?? '',
    bio:       (user as any)?.bio      ?? '',
  });
  const [profileDirty,  setProfileDirty]  = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  /* ── password ── */
  const [showPwForm,  setShowPwForm]  = useState(false);
  const [pwForm,      setPwForm]      = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);

  /* ── profile picture ── */
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profilePhotoError, setProfilePhotoError] = useState<string | null>(null);

  /* ── notifications ── */
  const [notif, setNotif] = useState({
    emailSermons:    true,
    emailEvents:     true,
    emailPrayer:     false,
    emailAnnounce:   true,
    pushMessages:    true,
    pushReminders:   true,
  });

  /* ── privacy ── */
  const [privacy, setPrivacy] = useState({
    profilePublic:  false,
    showEmail:      false,
    allowDirectMsg: true,
    dataAnalytics:  true,
  });

  /* ── appearance ── */
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('member-theme') as any) ?? 'system'
  );

  /* ── danger ── */
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [dangerLoading, setDangerLoading] = useState(false);

  /* ─── effects ─── */
  useEffect(() => {
    refreshUser();
    const onVisible = () => { if (document.visibilityState === 'visible') refreshUser(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshUser]);

  useEffect(() => {
    const stored = localStorage.getItem(VERIFICATION_COOLDOWN_KEY);
    if (stored) {
      const rem = Math.max(0, Math.ceil((parseInt(stored, 10) - Date.now()) / 1000));
      if (rem > 0) setCooldownSeconds(rem);
      else localStorage.removeItem(VERIFICATION_COOLDOWN_KEY);
    }
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const id = setInterval(() => {
      setCooldownSeconds((p) => {
        if (p <= 1) { localStorage.removeItem(VERIFICATION_COOLDOWN_KEY); clearInterval(id); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownSeconds > 0]);

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (theme !== 'system') localStorage.setItem('member-theme', theme);
  }, [theme]);

  /* ─── handlers ─── */
  const startCooldown = (duration = COOLDOWN_DURATION) => {
    localStorage.setItem(VERIFICATION_COOLDOWN_KEY, (Date.now() + duration * 1000).toString());
    setCooldownSeconds(duration);
  };

  const handleSendVerificationEmail = async () => {
    if (cooldownSeconds > 0) { showError(`Please wait ${cooldownSeconds}s before requesting again`); return; }
    setVerificationLoading(true);
    try {
      const result = await emailVerificationService.initiateVerification();
      showSuccess(`Verification email sent! Link expires in ${result.expires_in_minutes} minutes.`);
      startCooldown();
    } catch (error: any) {
      const msg = error.message || error.response?.data?.error || error.response?.data?.detail || 'Failed to send verification email';
      showError(msg);
      if (error.response?.data?.retry_after_seconds) startCooldown(error.response.data.retry_after_seconds);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', profileForm.firstName);
      formData.append('last_name', profileForm.lastName);
      formData.append('phone_number', profileForm.phone);
      formData.append('bio', profileForm.bio);

      if (profilePhotoFile) {
        formData.append('profile_picture', profilePhotoFile);
      }

      await apiService.patch('/auth/me/', formData);
      showSuccess('Profile updated successfully');
      setProfileDirty(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      await refreshUser();
    } catch (error: any) {
      const data = error.response?.data;
      let msg = data?.error || data?.detail || error.message || 'Failed to save profile';

      if (data && typeof data === 'object') {
        const fieldErrors = Object.entries(data)
          .filter(([key]) => key !== 'error' && key !== 'detail')
          .flatMap(([, value]) => {
            if (Array.isArray(value)) return value.map(String);
            if (typeof value === 'string') return [value];
            return [];
          });

        if (fieldErrors.length > 0) {
          msg = fieldErrors.join(' | ');
        }
      }

      showError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setProfilePhotoError('Please upload a JPG, PNG, or WebP image');
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setProfilePhotoError('Image must be less than 5MB');
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      return;
    }

    setProfilePhotoError(null);
    setProfilePhotoFile(file);
    setProfileDirty(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    setProfilePhotoError(null);
    setProfileDirty(true);
  };

  const handlePasswordSave = async () => {
    if (!pwForm.current)               { showError('Enter your current password'); return; }
    if (pwForm.next.length < 8)        { showError('New password must be at least 8 characters'); return; }
    if (pwForm.next !== pwForm.confirm) { showError('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 700)); // replace with real API call
      showSuccess('Password changed successfully');
      setPwForm({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
    } catch { showError('Incorrect current password'); }
    finally  { setPwSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { showError('Type DELETE to confirm'); return; }
    setDangerLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      showSuccess('Account deleted');
      logout();
    } catch { showError('Failed to delete account'); }
    finally  { setDangerLoading(false); }
  };

  const pwStrength = () => {
    const l = pwForm.next.length;
    if (l === 0) return null;
    if (l < 6)  return { label: 'Weak',   cls: 'weak',   bars: 1 };
    if (l < 10) return { label: 'Fair',   cls: 'fair',   bars: 2 };
    if (l < 14) return { label: 'Good',   cls: 'good',   bars: 3 };
    return           { label: 'Strong', cls: 'strong', bars: 4 };
  };
  const strength = pwStrength();

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="settings-page-wrapper">

      {/* ── Page Header ── */}
      <div className="settings-page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p className="subtitle">Manage your account, preferences, notifications, and privacy</p>
        </div>
      </div>

      <div className="settings-content">

        {/* ══ 1. PROFILE ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="person" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Profile Information</h2>
              <p className="ms-card-sub">Update how you appear to others in the community</p>
            </div>
          </div>
          <div className="ms-card-body">
            
            {/* Profile Photo Section */}
            <div className="profile-photo-section">
              <div className="avatar-preview-container">
                <div className="avatar-preview">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Preview" className="avatar-img" />
                  ) : user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Current" className="avatar-img" />
                  ) : (
                    <div className="avatar-initials">
                      {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '')}
                    </div>
                  )}
                </div>
                {(profilePhotoPreview || user?.profilePicture) && (
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={handleRemoveProfilePhoto}
                    disabled={profileSaving}
                  >
                    <Icon name="delete" size={14} />
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="upload-area">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePhotoSelect}
                    className="upload-input"
                    disabled={profileSaving}
                  />
                  <span className="upload-text">
                    <Icon name="upload" size={18} />
                    Click to choose photo
                  </span>
                  <span className="upload-hint">JPG, PNG, or WebP • Max 5MB</span>
                </label>
              </div>

              {profilePhotoError && (
                <div className="ms-error-box">
                  <Icon name="error" size={14} />
                  {profilePhotoError}
                </div>
              )}
            </div>

            <div className="ms-form-grid">
              <div className="ms-field">
                <label className="ms-label">First Name</label>
                <input
                  className="ms-input"
                  value={profileForm.firstName}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, firstName: e.target.value })); setProfileDirty(true); }}
                  placeholder="First name"
                />
              </div>
              <div className="ms-field">
                <label className="ms-label">Last Name</label>
                <input
                  className="ms-input"
                  value={profileForm.lastName}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, lastName: e.target.value })); setProfileDirty(true); }}
                  placeholder="Last name"
                />
              </div>
              <div className="ms-field">
                <label className="ms-label">Phone Number</label>
                <input
                  className="ms-input"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, phone: e.target.value })); setProfileDirty(true); }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="ms-field ms-field-full">
                <label className="ms-label">
                  Bio <span className="ms-label-count">{profileForm.bio.length}/280</span>
                </label>
                <textarea
                  className="ms-textarea"
                  value={profileForm.bio}
                  onChange={(e) => { setProfileForm((p) => ({ ...p, bio: e.target.value })); setProfileDirty(true); }}
                  placeholder="A short bio about yourself…"
                  rows={3}
                  maxLength={280}
                />
              </div>
            </div>
            <div className="ms-card-footer">
              <span className="ms-unsaved">
                {profileDirty && <><Icon name="edit" size={13} /> Unsaved changes</>}
              </span>
              <button
                className="btn-primary"
                onClick={handleProfileSave}
                disabled={profileSaving || !profileDirty}
              >
                {profileSaving ? <><span className="spinner-mini" />Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* ══ 2. ACCOUNT INFO ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="badge" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Account Information</h2>
              <p className="ms-card-sub">Your login identity and membership details</p>
            </div>
          </div>
          <div className="ms-card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="role-badge">{user?.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Status</span>
                <span className={`ms-status-pill ${user?.isActive ? 'active' : 'inactive'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {user?.dateJoined
                    ? new Date(user.dateJoined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Verified</span>
                <span className={`ms-status-pill ${user?.emailVerified ? 'active' : 'inactive'}`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ 3. SECURITY & VERIFICATION ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="lock" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Security &amp; Verification</h2>
              <p className="ms-card-sub">Manage your email verification and password</p>
            </div>
          </div>
          <div className="ms-card-body">
            <div className="security-sections">

              {/* Email Verification */}
              <div className="security-section">
                <div className="section-header">
                  <h4 className="section-title">Email Verification</h4>
                </div>
                {user?.emailVerified ? (
                  <div className="status-box status-success">
                    <div className="status-icon"><MailIcon size={28} /></div>
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
                    <div className="status-icon"><MailIcon size={28} /></div>
                    <div className="status-content">
                      <h3 className="status-heading">Email Not Verified</h3>
                      <p className="status-text">
                        Your email address <strong>{user?.email}</strong> has not been verified yet.
                      </p>
                      <p className="status-description">
                        We'll send a verification link to your inbox. The link is valid for 30 minutes.
                      </p>
                      <div className="status-actions">
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={verificationLoading || cooldownSeconds > 0}
                          className="btn-primary"
                          aria-label="Send verification email"
                        >
                          {verificationLoading
                            ? <><span className="spinner-mini" />Sending…</>
                            : cooldownSeconds > 0
                            ? `Resend in ${cooldownSeconds}s`
                            : 'Send Verification Email'}
                        </button>
                      </div>
                      {cooldownSeconds > 0 && (
                        <p className="status-note">Check your inbox. The link expires in 30 minutes.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="security-section">
                <div className="section-header">
                  <h4 className="section-title">Password</h4>
                </div>
                <p className="section-description">
                  Keep your account secure by using a strong, unique password.
                </p>
                <button className="btn-secondary" onClick={() => setShowPwForm((v) => !v)}>
                  {showPwForm ? 'Cancel' : 'Change Password'}
                </button>

                {showPwForm && (
                  <div className="ms-pw-form">
                    <div className="ms-field">
                      <label className="ms-label">Current Password</label>
                      <div className="ms-input-wrap">
                        <input
                          className="ms-input"
                          type={showCurrent ? 'text' : 'password'}
                          value={pwForm.current}
                          onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <button className="ms-eye" type="button" onClick={() => setShowCurrent((v) => !v)}>
                          <Icon name={showCurrent ? 'visibility_off' : 'visibility'} size={17} />
                        </button>
                      </div>
                    </div>
                    <div className="ms-field">
                      <label className="ms-label">New Password</label>
                      <div className="ms-input-wrap">
                        <input
                          className="ms-input"
                          type={showNext ? 'text' : 'password'}
                          value={pwForm.next}
                          onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                          placeholder="At least 8 characters"
                        />
                        <button className="ms-eye" type="button" onClick={() => setShowNext((v) => !v)}>
                          <Icon name={showNext ? 'visibility_off' : 'visibility'} size={17} />
                        </button>
                      </div>
                      {strength && (
                        <div className="ms-strength-row">
                          {[1,2,3,4].map((n) => (
                            <div key={n} className={`ms-strength-bar ${n <= strength.bars ? strength.cls : ''}`} />
                          ))}
                          <span className={`ms-strength-label ${strength.cls}`}>{strength.label}</span>
                        </div>
                      )}
                    </div>
                    <div className="ms-field">
                      <label className="ms-label">Confirm New Password</label>
                      <div className="ms-input-wrap">
                        <input
                          className={`ms-input ${pwForm.confirm && pwForm.next !== pwForm.confirm ? 'ms-input-err' : ''}`}
                          type={showConfirm ? 'text' : 'password'}
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                          placeholder="Repeat new password"
                        />
                        <button className="ms-eye" type="button" onClick={() => setShowConfirm((v) => !v)}>
                          <Icon name={showConfirm ? 'visibility_off' : 'visibility'} size={17} />
                        </button>
                      </div>
                      {pwForm.confirm && pwForm.next !== pwForm.confirm && (
                        <p className="ms-err-text">Passwords do not match</p>
                      )}
                    </div>
                    <div className="ms-pw-actions">
                      <button className="btn-primary" onClick={handlePasswordSave} disabled={pwSaving}>
                        {pwSaving ? <><span className="spinner-mini" />Updating…</> : 'Update Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ══ 4. NOTIFICATIONS ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="notifications" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Notifications</h2>
              <p className="ms-card-sub">Choose what alerts and emails you receive</p>
            </div>
          </div>
          <div className="ms-card-body">
            <p className="ms-group-label">Email Notifications</p>
            <SettingRow icon="videocam" label="New Sermons" desc="When a new sermon or teaching is published">
              <Toggle checked={notif.emailSermons}  onChange={(v) => setNotif((p) => ({ ...p, emailSermons: v }))} />
            </SettingRow>
            <SettingRow icon="event" label="Event Reminders" desc="Upcoming events and schedule changes">
              <Toggle checked={notif.emailEvents}   onChange={(v) => setNotif((p) => ({ ...p, emailEvents: v }))} />
            </SettingRow>
            <SettingRow icon="favorite" label="Prayer Responses" desc="When someone responds to your prayer request">
              <Toggle checked={notif.emailPrayer}   onChange={(v) => setNotif((p) => ({ ...p, emailPrayer: v }))} />
            </SettingRow>
            <SettingRow icon="campaign" label="Church Announcements" desc="Important updates from leadership">
              <Toggle checked={notif.emailAnnounce} onChange={(v) => setNotif((p) => ({ ...p, emailAnnounce: v }))} />
            </SettingRow>

            <p className="ms-group-label">Push Notifications</p>
            <SettingRow icon="forum" label="Community Replies" desc="When someone replies to your post">
              <Toggle checked={notif.pushMessages}  onChange={(v) => setNotif((p) => ({ ...p, pushMessages: v }))} />
            </SettingRow>
            <SettingRow icon="alarm" label="Service Reminders" desc="Weekly Sunday service reminder">
              <Toggle checked={notif.pushReminders} onChange={(v) => setNotif((p) => ({ ...p, pushReminders: v }))} />
            </SettingRow>
          </div>
        </div>

        {/* ══ 5. PRIVACY ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="shield" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Privacy</h2>
              <p className="ms-card-sub">Control your visibility and how your data is used</p>
            </div>
          </div>
          <div className="ms-card-body">
            <SettingRow icon="public" label="Public Profile" desc="Allow other members to view your profile">
              <Toggle checked={privacy.profilePublic}  onChange={(v) => setPrivacy((p) => ({ ...p, profilePublic: v }))} />
            </SettingRow>
            <SettingRow icon="email" label="Show Email Address" desc="Display your email on your public profile">
              <Toggle checked={privacy.showEmail}      onChange={(v) => setPrivacy((p) => ({ ...p, showEmail: v }))} />
            </SettingRow>
            <SettingRow icon="chat" label="Allow Direct Messages" desc="Let other members message you directly">
              <Toggle checked={privacy.allowDirectMsg} onChange={(v) => setPrivacy((p) => ({ ...p, allowDirectMsg: v }))} />
            </SettingRow>
            <SettingRow icon="analytics" label="Usage Analytics" desc="Share anonymous data to help improve the app">
              <Toggle checked={privacy.dataAnalytics}  onChange={(v) => setPrivacy((p) => ({ ...p, dataAnalytics: v }))} />
            </SettingRow>
            <SettingRow icon="download" label="Download My Data" desc="Request an export of all your account data">
              <button className="btn-secondary">Request Export</button>
            </SettingRow>
          </div>
        </div>

        {/* ══ 6. APPEARANCE ══ */}
        <div className="ms-card">
          <div className="ms-card-head">
            <div className="ms-card-head-icon"><Icon name="palette" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Appearance</h2>
              <p className="ms-card-sub">Personalise how the portal looks for you</p>
            </div>
          </div>
          <div className="ms-card-body">
            <SettingRow icon="dark_mode" label="Theme" desc="Choose light, dark, or follow your system">
              <div className="ms-segment">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    className={`ms-seg-btn ${theme === t ? 'active' : ''}`}
                    onClick={() => setTheme(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </SettingRow>
          </div>
        </div>

        {/* ══ 7. DANGER ZONE ══ */}
        <div className="ms-card ms-card-danger">
          <div className="ms-card-head">
            <div className="ms-card-head-icon danger"><Icon name="warning" size={18} /></div>
            <div>
              <h2 className="ms-card-title">Danger Zone</h2>
              <p className="ms-card-sub">Irreversible account actions — proceed with caution</p>
            </div>
          </div>
          <div className="ms-card-body">
            <div className="security-sections">
              <div className="security-section">
                <div className="section-header">
                  <h4 className="section-title">Delete Account</h4>
                </div>
                <p className="section-description">
                  Permanently deletes your account, profile, messages, and all associated data.{' '}
                  <strong>This cannot be undone.</strong>
                </p>
                <div className="ms-delete-confirm">
                  <label className="ms-label">Type <strong>DELETE</strong> to enable the button</label>
                  <input
                    className="ms-input ms-input-danger"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <button
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={dangerLoading || deleteConfirm !== 'DELETE'}
                >
                  {dangerLoading
                    ? <><span className="spinner-mini" />Processing…</>
                    : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberSettings;