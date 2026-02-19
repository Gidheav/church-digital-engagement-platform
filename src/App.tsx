/**
 * Main Application Entry Point
 */

import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import AppRouter from './router/AppRouter';
import './styles/ConfirmModal.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          {/* Global Background Grain Overlay */}
          <div className="fixed inset-0 pointer-events-none z-[1] bg-grain opacity-40 mix-blend-multiply" aria-hidden="true"></div>
          
          {/* App Content */}
          <div className="relative z-[2]">
            <AppRouter />
          </div>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
