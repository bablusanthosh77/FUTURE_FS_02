import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Manage Leads', icon: Users },
    { id: 'add-lead', label: 'Add Lead', icon: UserPlus },
  ];

  const handleNav = (pageId) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header glass-panel">
        <div className="brand">
          <ShieldCheck className="brand-icon" />
          <span>LeadFlow CRM</span>
        </div>
        <button className="btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar glass-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <ShieldCheck className="brand-icon" />
          <h2>LeadFlow CRM</h2>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
            </div>
            <div className="user-info">
              <h4>{user.name || 'Admin'}</h4>
              <p>{user.email || 'admin@crm.com'}</p>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'leads' && currentPage === 'lead-details');
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="sidebar-footer-btn" title="Toggle Theme">
            {isDark ? <Sun size={20} className="text-warning" /> : <Moon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button onClick={handleLogout} className="sidebar-footer-btn logout-btn" title="Sign Out">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <style>{`
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          z-index: 100;
          border-radius: 0;
          border-bottom: 1px solid var(--border-color);
          padding: 0 20px;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-header .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.1rem;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mobile-header .brand-icon {
          stroke: var(--accent-primary);
          fill: rgba(79, 70, 229, 0.1);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 98;
        }

        .sidebar {
          position: fixed;
          top: 20px;
          left: 20px;
          bottom: 20px;
          width: var(--sidebar-width);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          z-index: 99;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 4px 24px 4px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand .brand-icon {
          width: 32px;
          height: 32px;
          stroke: var(--accent-primary);
          fill: rgba(79, 70, 229, 0.1);
        }

        .sidebar-brand h2 {
          font-size: 1.2rem;
          font-weight: 800;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 4px;
          border-bottom: 1px solid var(--border-color);
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }

        .user-info h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-info p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 2px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-nav {
          flex: 1;
          margin-top: 24px;
        }

        .sidebar-nav ul {
          list-style: none;
        }

        .sidebar-nav li {
          margin-bottom: 8px;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(79, 70, 229, 0.05);
          transform: translateX(4px);
        }

        .nav-link.active {
          color: white;
          background: var(--accent-gradient);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .nav-link.active .nav-icon {
          color: white;
        }

        .nav-icon {
          color: var(--text-tertiary);
          transition: color 0.2s ease;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .sidebar-footer-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 10px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .sidebar-footer-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .logout-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .text-warning {
          color: #eab308;
        }

        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar {
            top: 0;
            left: 0;
            bottom: 0;
            border-radius: 0;
            transform: translateX(-100%);
            z-index: 101;
            box-shadow: 20px 0 25px -5px rgba(0,0,0,0.1);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
