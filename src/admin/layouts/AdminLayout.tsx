import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminTopBar from './AdminTopBar';
import AdminRightSidebar from './AdminRightSidebar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getActiveView = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'overview';
    const match = path.match(/^\/admin\/([^/]+)/);
    return match ? match[1] : 'overview';
  };

  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background-light">
      <AdminTopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={getActiveView()}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' as const }}>
          {children || <Outlet />}
        </main>
        {isDashboard && <AdminRightSidebar />}
      </div>
    </div>
  );
};

export default AdminLayout;
