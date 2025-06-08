import React from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { DataProvider } from './contexts/DataContext';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" dir="rtl">
      {isAuthenticated ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;