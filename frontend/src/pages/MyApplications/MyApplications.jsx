import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import styles from './MyApplications.module.css';
import { 
  FiBriefcase, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink
} from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const MyApplications = ({ limit, job }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the api instance which already handles auth headers
      const response = await api.get('/applications/my-applications');
      
      // Make sure the response data is in the expected format
      const apps = response.data.map(app => ({
        ...app,
        // Ensure we have both job_id and slug for each application
        slug: app.slug || `job-${app.job_id}` // Fallback if slug is missing
      }));
      
      setApplications(limit ? apps.slice(0, limit) : apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.message || 'Failed to load applications. Please try again.');
      toast.error(error.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [limit]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusIcon = (status) => {
    if (!status) return <FiAlertCircle className={styles.defaultIcon} />;
    
    switch (status.toLowerCase()) {
      case 'accepted':
        return <FiCheckCircle className={styles.acceptedIcon} />;
      case 'rejected':
        return <FiXCircle className={styles.rejectedIcon} />;
      case 'pending':
        return <FiClock className={styles.pendingIcon} />;
      default:
        return <FiAlertCircle className={styles.defaultIcon} />;
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      // Updated to use the correct endpoint
      await api.delete(`/applicants/${applicationId}`);
      toast.success('Application withdrawn successfully');
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error(error.message || 'Failed to withdraw application. Please try again.');
    }
  };

  const handleViewJob = (slug) => {
    if (!slug) {
      toast.error('Job information is not available');
      return;
    }
    navigate(`/jobs/${job.slug}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          onClick={fetchApplications}
          className={styles.retryButton}
        >
          <FiRefreshCw className={styles.retryIcon} />
          Retry
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiBriefcase className={styles.emptyIcon} />
        <h3>No applications yet</h3>
        <p>You haven't applied to any jobs yet. Start your job search today!</p>
        <button 
          onClick={() => navigate('/job-search')}
          className={styles.searchButton}
        >
          Search Jobs
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.applicationsGrid}>
        {applications.map((app) => (
          <div key={app.applicant_id} className={styles.applicationCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.jobTitle}>{app.job_title || 'Untitled Position'}</h3>
              <div className={`${styles.statusBadge} ${styles[app.status?.toLowerCase() || 'default']}`}>
                {getStatusIcon(app.status)}
                <span>{app.status || 'Unknown'}</span>
              </div>
            </div>
            
            <div className={styles.companyInfo}>
              <p className={styles.companyName}>{app.company_name || 'Unknown Company'}</p>
              {app.location && (
                <p className={styles.location}>{app.location}</p>
              )}
            </div>

            <div className={styles.applicationMeta}>
              <div className={styles.metaItem}>
                <FiClock className={styles.metaIcon} />
                <span>Applied {formatDate(app.applied_at)}</span>
              </div>
              {app.updated_at && (
                <div className={styles.metaItem}>
                  <span>Last updated {formatDate(app.updated_at)}</span>
                </div>
              )}
            </div>

            <div className={styles.cardActions}>
              <button 
                onClick={() => handleViewJob(app.slug)}
                className={styles.viewButton}
              >
                <FiExternalLink className={styles.actionIcon} />
                View Job
              </button>
              
              {app.status?.toLowerCase() === 'pending' && (
                <button 
                  onClick={() => handleWithdraw(app.applicant_id)}
                  className={styles.withdrawButton}
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;