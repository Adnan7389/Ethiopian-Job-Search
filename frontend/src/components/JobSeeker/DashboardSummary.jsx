import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './DashboardSummary.module.css';
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiCalendar,
  FiUsers,
  FiThumbsUp,
  FiXCircle,
  FiBarChart2
} from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const DashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/applications/summary');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load application summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Loading your application summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const { total, pending, shortlisted, scheduled, interviewed, accepted, rejected } = summary;

  const statusData = [
    {
      label: 'Total Applications',
      count: total,
      icon: <FiBriefcase className={styles.totalIcon} />,
      progress: 100,
      className: styles.total
    },
    {
      label: 'Applied',
      count: pending,
      icon: <FiClock className={styles.pendingIcon} />,
      progress: (pending / total) * 100,
      className: styles.pending
    },
    {
      label: 'Shortlisted',
      count: shortlisted,
      icon: <FiCheckCircle className={styles.shortlistedIcon} />,
      progress: (shortlisted / total) * 100,
      className: styles.shortlisted
    },
    {
      label: 'Scheduled',
      count: scheduled,
      icon: <FiCalendar className={styles.scheduledIcon} />,
      progress: (scheduled / total) * 100,
      className: styles.scheduled
    },
    {
      label: 'Interviewed',
      count: interviewed,
      icon: <FiUsers className={styles.interviewedIcon} />,
      progress: (interviewed / total) * 100,
      className: styles.interviewed
    },
    {
      label: 'Accepted',
      count: accepted,
      icon: <FiThumbsUp className={styles.acceptedIcon} />,
      progress: (accepted / total) * 100,
      className: styles.accepted
    },
    {
      label: 'Rejected',
      count: rejected,
      icon: <FiXCircle className={styles.rejectedIcon} />,
      progress: (rejected / total) * 100,
      className: styles.rejected
    }
  ];

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryGrid}>
        {statusData.map(({ label, count, icon, progress, className }) => (
          <div key={label} className={`${styles.summaryCard} ${className}`}>
            <div className={styles.cardHeader}>
              {icon}
              <h3 className={styles.cardTitle}>{label}</h3>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardCount}>{count}</p>
              {label !== 'Total Applications' && (
                <div className={styles.progressContainer}>
                  <div 
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  ></div>
                  <span className={styles.progressText}>{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSummary;