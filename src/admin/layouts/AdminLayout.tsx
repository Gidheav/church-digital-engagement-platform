/**
 * Admin Layout Component - Enterprise Edition
 * Responsive layout with sidebar and topbar
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminTopBar from './AdminTopBar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children?: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView, onViewChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleViewChange = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout-pro">
      <Sidebar
        activeView={activeView || 'overview'}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
      
      <div className="admin-main-content">
        <AdminTopBar onMenuClick={handleMenuClick} />
        
        <main className="admin-content-area">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
