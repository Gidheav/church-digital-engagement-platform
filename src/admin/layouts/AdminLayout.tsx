/**
 * Admin Layout Component - Enterprise Edition
 * Responsive layout with sidebar and topbar
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminTopBar from './AdminTopBar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine active view from current route
  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return 'overview';
    }
    // Extract view from /admin/{view}
    const match = path.match(/^\/admin\/([^\/]+)/);
    return match ? match[1] : 'overview';
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-layout-pro">
      <Sidebar
        activeView={getActiveView()}
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
