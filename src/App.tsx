/**
 * Main Application Entry Point
 */

import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import AppRouter from './router/AppRouter';
import './styles/ConfirmModal.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <AppRouter />
      </ConfirmProvider>
    </AuthProvider>
  );
};

export default App;
