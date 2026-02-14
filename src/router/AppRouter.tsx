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
import MemberDashboard from '../member/MemberDashboard';
import MemberSettings from '../member/MemberSettings';

// Admin pages
import AdminDashboard from '../admin/AdminDashboard';

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
        
        {/* Member Routes */}
        <Route 
          path="/member" 
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/member/settings" 
          element={
            <ProtectedRoute>
              <MemberSettings />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes (ADMIN and MODERATOR access) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.MODERATOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Error Pages */}
        <Route path="/403" element={<Forbidden />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
