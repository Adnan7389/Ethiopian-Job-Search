import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicantsByJob } from '../../services/applicationService';
import ApplicantCard from '../../components/Applicants/ApplicantCard';
import styles from './ApplicantsPage.module.css';

const LIMIT = 20;

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadApplicants = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await getApplicantsByJob(jobId, page, LIMIT);
      console.log('Response from qualified applicants:', response);

      // Handle paginated response
      const newApplicants = response.applicants || [];
      console.log('New applicants:', newApplicants);
      
      // Filter out any duplicates based on applicant_id
      setApplicants(prev => {
        const existingIds = new Set(prev.map(a => a.applicant_id));
        const uniqueNewApplicants = newApplicants.filter(a => !existingIds.has(a.applicant_id));
        return [...prev, ...uniqueNewApplicants];
      });
      
      // Handle pagination
      if (response?.pagination) {
        setHasNextPage(page < response.pagination.pages);
      } else {
        setHasNextPage(newApplicants.length === LIMIT);
      }
      
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Error loading applicants:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load applicants';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when jobId changes
    setApplicants([]);
    setPage(1);
    setHasNextPage(true);
    setError('');
    loadApplicants();
  }, [jobId]);

  const handleStatusUpdated = (updatedApplicant) => {
            setApplicants(prev =>
      prev.map(applicant =>
        applicant.applicant_id === updatedApplicant.applicant_id
          ? { ...applicant, ...updatedApplicant }
          : applicant
      )
    );
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Qualified Applicants</h1>
      {applicants.length === 0 && !loading ? (
        <p>No qualified applicants found for this job.</p>
      ) : (
        <div className={styles.applicantsGrid}>
          {applicants.map(applicant => (
            <ApplicantCard
              key={`${applicant.applicant_id}-${applicant.status}`}
              applicant={applicant}
              onStatusUpdated={handleStatusUpdated}
            />
          ))}
        </div>
      )}
      {hasNextPage && (
        <button
          className={styles.loadMore}
          onClick={loadApplicants}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default ApplicantsPage;