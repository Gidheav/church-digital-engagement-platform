/**
 * Main App Router
 * 
 * Defines application routing structure:
 * - Public routes (accessible to all)
 * - Member routes (requires MEMBER or ADMIN role)
 * - Admin routes (requires ADMIN or MODERATOR role)
 *   - User Management is restricted to ADMIN only at component level
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '../types/auth.types';
import ToastContainer from '../components/ToastContainer';

// Public pages
import HomePage from '../public/HomePage';
import LoginPage from '../public/LoginPage';
import RegisterPage from '../public/RegisterPage';
import ContentList from '../public/ContentList';
import ContentDetail from '../public/ContentDetail';
import SeriesList from '../public/SeriesList';
import SeriesDetail from '../public/SeriesDetail';
import AdminAuth from '../pages/AdminAuth';
import Forbidden from '../pages/Forbidden';
import VerifyEmail from '../pages/VerifyEmail';

// Member pages
import MemberOverview from '../member/views/MemberOverview';
import MemberSermons from '../member/views/MemberSermons';
import MemberEvents from '../member/views/MemberEvents';
import MemberCommunity from '../member/views/MemberCommunity';
import MemberPrayer from '../member/views/MemberPrayer';
import MemberProfile from '../member/views/MemberProfile';
import MemberSettings from '../member/MemberSettings';
import MemberLayout from '../member/layouts/MemberLayout';

// Admin pages
import AdminDashboard from '../admin/AdminDashboard';
import ContentManager from '../admin/ContentManager';
import SeriesManager from '../admin/SeriesManager';
import UserManager from '../admin/UserManager';
import InteractionModeration from '../admin/InteractionModeration';
import EmailCampaigns from '../admin/EmailCampaigns';
import ModerationReports from '../admin/ModerationReports';
import AppSettings from '../admin/AppSettings';
import AdminLayout from '../admin/layouts/AdminLayout';
import AdminOnlyRoute from '../admin/components/AdminOnlyRoute';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/content" element={<ContentList />} />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route path="/series" element={<SeriesList />} />
        <Route path="/series/:slug" element={<SeriesDetail />} />
        
        {/* Admin Authentication (Separate from member auth) */}
        <Route path="/admin-auth" element={<AdminAuth />} />
        
        {/* Email Verification (Protected - requires authentication) */}
        <Route 
          path="/verify-email" 
          element={
            <ProtectedRoute>
              <VerifyEmail />
            </ProtectedRoute>
          } 
        />
        
        {/* Member Routes - Nested routing */}
        <Route 
          path="/member" 
          element={
            <ProtectedRoute>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberOverview />} />
          <Route path="dashboard" element={<MemberOverview />} />
          <Route path="sermons" element={<MemberSermons />} />
          <Route path="events" element={<MemberEvents />} />
          <Route path="community" element={<MemberCommunity />} />
          <Route path="prayer" element={<MemberPrayer />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="settings" element={<MemberSettings />} />
        </Route>
        
        {/* Admin Routes (ADMIN and MODERATOR access) - Nested routing */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.MODERATOR]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="series" element={<SeriesManager />} />
          <Route path="users" element={<AdminOnlyRoute><UserManager /></AdminOnlyRoute>} />
          <Route path="moderation" element={<InteractionModeration />} />
          <Route path="email" element={<EmailCampaigns />} />
          <Route path="reports" element={<ModerationReports />} />
          <Route path="settings" element={<AdminOnlyRoute><AppSettings /></AdminOnlyRoute>} />
        </Route>
        
        {/* Error Pages */}
        <Route path="/403" element={<Forbidden />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
