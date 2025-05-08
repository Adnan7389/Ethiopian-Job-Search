import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ProfileCard from '../../components/JobSeeker/ProfileCard';
import DashboardSummary from '../../components/JobSeeker/DashboardSummary';
import NotificationPreview from '../../components/JobSeeker/NotificationPreview';
import MyApplicationsList from '../MyApplications/MyApplications';
import styles from './JobSeekerDashboard.module.css';
import { 
  FiHome, 
  FiSearch, 
  FiUser, 
  FiSettings, 
  FiBriefcase, 
  FiBell,
  FiBarChart2,
  FiChevronRight
} from 'react-icons/fi';

const JobSeekerDashboard = () => {
  const { userType, status: authStatus, hasInitialized } = useSelector(state => state.auth);

  if (!hasInitialized || authStatus === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (userType !== 'job_seeker') {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.dashboard}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <ProfileCard />
          
          {/* Navigation Links */}
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link to="/dashboard" className={`${styles.navLink} ${styles.active}`}>
                  <FiHome className={styles.navIcon} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/job-search" className={styles.navLink}>
                  <FiSearch className={styles.navIcon} />
                  <span>Search Jobs</span>
                  <FiChevronRight className={styles.navArrow} />
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/profile" className={styles.navLink}>
                  <FiUser className={styles.navIcon} />
                  <span>My Profile</span>
                  <FiChevronRight className={styles.navArrow} />
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/my-applications" className={styles.navLink}>
                  <FiBriefcase className={styles.navIcon} />
                  <span>My Applications</span>
                  <FiChevronRight className={styles.navArrow} />
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/settings" className={styles.navLink}>
                  <FiSettings className={styles.navIcon} />
                  <span>Settings</span>
                  <FiChevronRight className={styles.navArrow} />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <div className={styles.headerActions}>
            <button className={styles.notificationButton}>
              <FiBell className={styles.notificationIcon} />
              <span className={styles.notificationBadge}>3</span>
            </button>
          </div>
        </header>

         {/* Notifications Preview */}
        <section className={styles.notificationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiBell className={styles.sectionIcon} />
              Notifications
            </h2>
            <Link to="/notifications" className={styles.viewAllLink}>
              View All
              <FiChevronRight className={styles.linkArrow} />
            </Link>
          </div>
          <NotificationPreview />
        </section>
        {/* Dashboard Summary */}
        <section className={styles.summarySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiBarChart2 className={styles.sectionIcon} />
              Application Overview
            </h2>
          </div>
          <DashboardSummary />
        </section>

        {/* Recent Applications */}
        <section className={styles.applicationsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FiBriefcase className={styles.sectionIcon} />
              Recent Applications
            </h2>
            <Link to="/my-applications" className={styles.viewAllLink}>
              View All
              <FiChevronRight className={styles.linkArrow} />
            </Link>
          </div>
          <MyApplicationsList limit={5} />
        </section>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;