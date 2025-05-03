import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

import ProfileCard from '../../components/JobSeeker/ProfileCard';
import DashboardSummary from '../../components/JobSeeker/DashboardSummary';
import NotificationPreview from '../../components/JobSeeker/NotificationPreview';
import MyApplicationsList from '../MyApplications/MyApplications';

import styles from './JobSeekerDashboard.module.css';

const JobSeekerDashboard = () => {
  const { userType, status: authStatus, hasInitialized } = useSelector(state => state.auth);

  if (!hasInitialized || authStatus === 'loading') {
    return <LoadingSpinner />;
  }

  if (userType !== 'job_seeker') {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.container}>
      <aside className={styles.side}>
        <ProfileCard />

        {/* Notifications widget */}
        <NotificationPreview />

        <nav className={styles.links}>
          <a href="/job-search">Search Jobs</a>
          <Link to="/profile" className={styles.link} onClick={() => setIsMenuOpen(false)}>Profile</Link>
          <a href="/settings">Settings</a>
        </nav>
      </aside>

      <main className={styles.main}>
        {/* Summary of applications by status */}
        <DashboardSummary />

        <section className={styles.applicationsSection}>
          <h2>My Applications</h2>
          <MyApplicationsList />
        </section>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;
