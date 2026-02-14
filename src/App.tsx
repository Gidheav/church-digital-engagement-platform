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
          <AppRouter />
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
