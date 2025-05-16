import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  FiBriefcase,
  FiMail,
  FiUser,
  FiGlobe,
  FiMapPin,
  FiFileText,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiLoader
} from 'react-icons/fi';
import styles from './EmployerDetails.module.css';

const EmployerDetails = () => {
  const { userId } = useParams();
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicationStats, setApplicationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await api.get(`/employers/${userId}`);
        console.log('EmployerDetails: backend response =', res.data);
        
        if (res.data && res.data.success === false) {
          setError(res.data.message || 'Employer not found');
          setEmployer(null);
          setJobs([]);
          setApplicationStats([]);
        } else {
          const data = res.data?.data || res.data;
          if (!data || !data.employer) {
            setError('Employer not found');
          } else {
            setEmployer(data.employer);
            setJobs(data.jobs || []);
            setApplicationStats(data.applicationStats || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch employer details:', err);
        setError('Failed to fetch employer details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, [userId]);

  if (loading) return (
    <div className={styles.loadingState}>
      <FiLoader className={styles.loadingIcon} />
      <p>Loading employer details...</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorState} role="alert">
      <FiAlertCircle className={styles.errorIcon} />
      <p>{error}</p>
    </div>
  );

  if (!employer) return null;

  const statusLabel = employer.isApproved === 1 || employer.isApproved === true
    ? 'Approved'
    : employer.isApproved === 0
      ? 'Pending Approval'
      : 'Unknown';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Employer Profile</h1>
        <div className={styles.statusBadge} data-status={statusLabel.toLowerCase()}>
          {statusLabel}
        </div>
      </header>

      <section className={styles.profileSection}>
        <div className={styles.profileCard}>
          <h2 className={styles.sectionTitle}>Company Information</h2>
          
          <div className={styles.detailGrid}>
            {employer.company_name && (
              <div className={styles.detailItem}>
                <FiBriefcase className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Company Name</h3>
                  <p className={styles.detailValue}>{employer.company_name}</p>
                </div>
              </div>
            )}

            {employer.email && (
              <div className={styles.detailItem}>
                <FiMail className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Email</h3>
                  <p className={styles.detailValue}>{employer.email}</p>
                </div>
              </div>
            )}

            {employer.username && (
              <div className={styles.detailItem}>
                <FiUser className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Username</h3>
                  <p className={styles.detailValue}>@{employer.username}</p>
                </div>
              </div>
            )}

            {employer.industry && (
              <div className={styles.detailItem}>
                <FiBriefcase className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Industry</h3>
                  <p className={styles.detailValue}>{employer.industry}</p>
                </div>
              </div>
            )}

            {employer.website && (
              <div className={styles.detailItem}>
                <FiGlobe className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Website</h3>
                  <a 
                    href={employer.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.websiteLink}
                  >
                    {employer.website}
                  </a>
                </div>
              </div>
            )}

            {employer.location && (
              <div className={styles.detailItem}>
                <FiMapPin className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Location</h3>
                  <p className={styles.detailValue}>{employer.location}</p>
                </div>
              </div>
            )}

            {employer.description && (
              <div className={styles.detailItem}>
                <FiFileText className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Description</h3>
                  <p className={styles.detailValue}>{employer.description}</p>
                </div>
              </div>
            )}

            {employer.created_at && (
              <div className={styles.detailItem}>
                <FiCalendar className={styles.detailIcon} />
                <div>
                  <h3 className={styles.detailLabel}>Joined</h3>
                  <p className={styles.detailValue}>
                    {new Date(employer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.jobsSection}>
        <h2 className={styles.sectionTitle}>Job Postings</h2>
        
        {jobs.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBriefcase className={styles.emptyIcon} />
            <p>No jobs posted yet</p>
          </div>
        ) : (
          <div className={styles.jobsTableContainer}>
            <table className={styles.jobsTable}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.job_id}>
                    <td>{job.title}</td>
                    <td>{job.job_type}</td>
                    <td>{job.industry}</td>
                    <td>
                      <span className={styles.statusBadge} data-status={job.status.toLowerCase()}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Application Statistics</h2>
        
        {applicationStats.length === 0 ? (
          <div className={styles.emptyState}>
            <FiFileText className={styles.emptyIcon} />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            {applicationStats.map(stat => (
              <div key={stat.status} className={styles.statCard}>
                <h3 className={styles.statTitle}>
                  {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                </h3>
                <p className={styles.statValue}>{stat.count}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployerDetails;