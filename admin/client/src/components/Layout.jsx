import { Link, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiMenu,
  FiX,
  FiChevronRight,
  FiLogOut,
  FiMonitor
} from 'react-icons/fi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.layout}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <FiBriefcase className={styles.sidebarTitleIcon} />
            Admin Panel
          </h2>
          <button 
            onClick={toggleSidebar}
            className={styles.mobileMenuButton}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link 
            to="/dashboard" 
            className={`${styles.navLink} ${isActive('/dashboard') ? styles.navLinkActive : ''}`}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            <div>
              <FiHome className={styles.navLinkIcon} />
              <span>Dashboard</span>
            </div>
            <FiChevronRight />
          </Link>

          <Link 
            to="/employers" 
            className={`${styles.navLink} ${isActive('/employers') ? styles.navLinkActive : ''}`}
            aria-current={isActive('/employers') ? 'page' : undefined}
          >
            <div>
              <FiBriefcase className={styles.navLinkIcon} />
              <span>Employers</span>
            </div>
            <FiChevronRight />
          </Link>

          <Link 
            to="/users" 
            className={`${styles.navLink} ${isActive('/users') ? styles.navLinkActive : ''}`}
            aria-current={isActive('/users') ? 'page' : undefined}
          >
            <div>
              <FiUsers className={styles.navLinkIcon} />
              <span>Users</span>
            </div>
            <FiChevronRight />
          </Link>

          <Link 
            to="/system-monitor" 
            className={`${styles.navLink} ${isActive('/system-monitor') ? styles.navLinkActive : ''}`}
            aria-current={isActive('/system-monitor') ? 'page' : undefined}
          >
            <div>
              <FiMonitor className={styles.navLinkIcon} />
              <span>System Monitor</span>
            </div>
            <FiChevronRight />
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <button 
              onClick={toggleSidebar}
              className={styles.mobileMenuButton}
              aria-label="Open sidebar"
            >
              <FiMenu />
            </button>
            <h1 className={styles.headerTitle}>
              {isActive('/dashboard') && 'Dashboard'}
              {isActive('/employers') && 'Employers'}
              {isActive('/users') && 'Users'}
              {isActive('/system-monitor') && 'System Monitor'}
            </h1>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className={styles.logoutButton}
            aria-label="Logout"
          >
            <FiLogOut className={styles.logoutButtonIcon} />
            Logout
          </button>
        </header>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;