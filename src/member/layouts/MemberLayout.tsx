/**
 * Member Layout Component
 * Main layout wrapper for all member pages
 * Replicates Admin design structure but with member-specific content
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberTopBar from './MemberTopBar';
import './MemberLayout.css';

interface MemberLayoutProps {
  children?: React.ReactNode;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children, activeView, onViewChange }) => {
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
    <div className="member-layout">
      <MemberSidebar
        activeView={activeView || 'overview'}
        onViewChange={handleViewChange}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
      
      <div className="member-main-content">
        <MemberTopBar onMenuClick={handleMenuClick} />
        
        <main className="member-content-area">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
