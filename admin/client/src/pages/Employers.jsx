import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEmployers, toggleEmployerApproval } from '../services/api';
import {
  FiBriefcase,
  FiMail,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiGlobe
} from 'react-icons/fi';
import styles from './Employers.module.css';

// Add a console log to debug styles
console.log('Employers styles:', styles);

const Employers = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  const fetchEmployers = async () => {
    try {
      const res = await getAllEmployers();
      setEmployers(res.data);
    } catch (err) {
      setError('Failed to load employers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployers();
  }, []);
  
  const handleApprovalToggle = async (userId, currentApprovalStatus) => {
    try {
      await toggleEmployerApproval(userId, !currentApprovalStatus);
      setEmployers(employers.map(employer => 
        employer.user_id === userId 
          ? { ...employer, is_approved: !currentApprovalStatus ? 1 : 0 } 
          : employer
      ));
    } catch (err) {
      console.error('Failed to update employer approval status:', err);
      alert('Failed to update employer approval status');
    }
  };
  
  const filteredEmployers = filterType === 'all' 
    ? employers 
    : employers.filter(employer => employer.industry === filterType);

  if (loading) return (
    <div className={styles.loadingState}>
      <FiRefreshCw className={styles.loadingIcon} />
      <p className={styles.loadingText}>Loading employers...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles.errorState}>
      <FiAlertCircle className={styles.errorIcon} />
      <p className={styles.errorText}>{error}</p>
      <button 
        onClick={fetchEmployers}
        className={styles.retryButton}
      >
        Try Again
      </button>
    </div>
  );
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Employer Management</h1>
        <p className={styles.subtitle}>Manage all registered employers</p>
      </div>
        
      <div className={styles.filterContainer}>
        <div className={styles.filterLabel}>
          <FiFilter className={styles.filterLabelIcon} />
          <span>Filter:</span>
        </div>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${filterType === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filterType === 'technology' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('technology')}
          >
            Technology
          </button>
          <button 
            className={`${styles.filterButton} ${filterType === 'healthcare' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('healthcare')}
          >
            Healthcare
          </button>
          <button 
            className={`${styles.filterButton} ${filterType === 'finance' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('finance')}
          >
            Finance
          </button>
        </div>
      </div>
      
      <div className={styles.gridContainer}>
        {filteredEmployers.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBriefcase className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>No employers found</p>
            <p className={styles.emptyStateSubtext}>Try changing your filters</p>
          </div>
        ) : (
          filteredEmployers.map((employer) => (
            <div key={employer.user_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.employerInfo}>
                  <div className={styles.employerLogo}>
                    <FiBriefcase />
                  </div>
                  <div>
                    <div className={styles.employerName}>{employer.company_name}</div>
                    <div className={styles.employerEmail}>{employer.email}</div>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${
                  employer.is_approved ? styles.statusActive : styles.statusSuspended
                }`}>
                  {employer.is_approved ? (
                    <>
                      <FiCheckCircle className={styles.statusBadgeIcon} />
                      <span>Approved</span>
                    </>
                  ) : (
                    <>
                      <FiXCircle className={styles.statusBadgeIcon} />
                      <span>Pending</span>
                    </>
                  )}
                </span>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardDetail}>
                  <FiMapPin className={styles.cardDetailIcon} />
                  <span>{employer.location || 'No location specified'}</span>
                </div>
                
                <div className={styles.cardDetail}>
                  <FiBriefcase className={styles.cardDetailIcon} />
                  <span>{employer.industry || 'No industry specified'}</span>
                </div>
                
                {employer.website && (
                  <div className={styles.cardDetail}>
                    <FiGlobe className={styles.cardDetailIcon} />
                    <a 
                      href={employer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                    >
                      {employer.website}
                    </a>
                  </div>
                )}
              </div>
              
              <div className={styles.cardFooter}>
                <button
                  onClick={() => handleApprovalToggle(employer.user_id, employer.is_approved)}
                  className={`${styles.actionButton} ${
                    employer.is_approved ? styles.unsuspendButton : styles.suspendButton
                  }`}
                >
                  {employer.is_approved ? (
                    <FiXCircle className={styles.actionButtonIcon} />
                  ) : (
                    <FiCheckCircle className={styles.actionButtonIcon} />
                  )}
                  <span>{employer.is_approved ? 'Revoke' : 'Approve'}</span>
                </button>
                <Link
                  to={`/employers/${employer.user_id}`}
                  className={`${styles.actionButton} ${styles.viewButton}`}
                >
                  <FiEye className={styles.actionButtonIcon} />
                  <span>View</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Employers;