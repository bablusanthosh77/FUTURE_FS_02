import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components & Pages
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import AddLeadPage from './pages/AddLeadPage';

// Icon for toast
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Toast Trigger Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Full page load state
  if (loading) {
    return (
      <div className="app-loader-wrapper">
        <div className="spinner spinner-dark spinner-large"></div>
        <p>Initializing LeadFlow CRM secure session...</p>
        <style>{`
          .app-loader-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: var(--bg-primary);
            color: var(--text-secondary);
            gap: 16px;
          }
          .spinner-large {
            width: 44px;
            height: 44px;
            border-width: 3px;
          }
          .app-loader-wrapper p {
            font-size: 0.95rem;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  // Route Guard: Redirect to Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage showToast={showToast} />;
  }

  // Render active page component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage 
            setCurrentPage={setCurrentPage} 
            setSelectedLeadId={setSelectedLeadId} 
            showToast={showToast} 
          />
        );
      case 'leads':
        return (
          <LeadsPage 
            setCurrentPage={setCurrentPage} 
            setSelectedLeadId={setSelectedLeadId} 
            showToast={showToast} 
          />
        );
      case 'lead-details':
        return (
          <LeadDetailsPage 
            leadId={selectedLeadId} 
            setCurrentPage={setCurrentPage} 
            showToast={showToast} 
          />
        );
      case 'add-lead':
        return (
          <AddLeadPage 
            setCurrentPage={setCurrentPage} 
            showToast={showToast} 
          />
        );
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} setSelectedLeadId={setSelectedLeadId} showToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      {/* Toast floating notifications wrapper */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-alert glass-panel toast-${t.type}`}>
            <span className="toast-icon-wrapper">
              {t.type === 'success' && <CheckCircle size={18} />}
              {t.type === 'error' && <AlertCircle size={18} />}
              {t.type === 'warning' && <Info size={18} />}
            </span>
            <span className="toast-message">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="btn-toast-close">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Main sidebar component */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen}
      />

      {/* Primary content router workspace */}
      <main className="main-content">
        {renderPage()}
      </main>

      <style>{`
        /* Floating Toast Alert CSS */
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10000;
          max-width: 380px;
          width: calc(100% - 48px);
        }

        .toast-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          border-left: 4px solid var(--border-color);
        }

        .toast-success { border-left-color: #16a34a; }
        .toast-error { border-left-color: #ef4444; }
        .toast-warning { border-left-color: #eab308; }

        .toast-success .toast-icon-wrapper { color: #16a34a; }
        .toast-error .toast-icon-wrapper { color: #ef4444; }
        .toast-warning .toast-icon-wrapper { color: #eab308; }

        .toast-icon-wrapper {
          display: inline-flex;
          flex-shrink: 0;
        }

        .toast-message {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .btn-toast-close {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 4px;
        }
        .btn-toast-close:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
