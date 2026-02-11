/**
 * Member Dashboard - Enterprise Edition
 * Professional dashboard interface for church members
 * Matches Admin design system with member-specific functionality
 */

import React, { useState } from 'react';

// Layout
import MemberLayout from './layouts/MemberLayout';

// Page Components
import MemberOverview from './views/MemberOverview';
import MemberSermons from './views/MemberSermons';
import MemberEvents from './views/MemberEvents';
import MemberCommunity from './views/MemberCommunity';
import MemberPrayer from './views/MemberPrayer';
import MemberProfile from './views/MemberProfile';
import MemberSettings from './MemberSettings';

// Styles
import '../shared/styles/theme.css';
import './styles/MemberDashboard.css';

type MemberView = 'overview' | 'sermons' | 'events' | 'community' | 'prayer' | 'profile' | 'settings';

const MemberDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<MemberView>('overview');

  const handleViewChange = (view: string) => {
    setActiveView(view as MemberView);
  };

  const renderView = () => {
    switch (activeView) {
      case 'sermons':
        return <MemberSermons />;
        
      case 'events':
        return <MemberEvents />;
        
      case 'community':
        return <MemberCommunity />;
        
      case 'prayer':
        return <MemberPrayer />;
        
      case 'profile':
        return <MemberProfile />;
        
      case 'settings':
        return <MemberSettings />;
        
      case 'overview':
      default:
        return <MemberOverview onViewChange={handleViewChange} />;
    }
  };

  return (
    <MemberLayout activeView={activeView} onViewChange={handleViewChange}>
      {renderView()}
    </MemberLayout>
  );
};

export default MemberDashboard;
