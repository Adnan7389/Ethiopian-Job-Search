// frontend/src/pages/ApplicantsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicantsByJob } from '../../services/applicationService';
import ApplicantCard from '../../components/Applicants/ApplicantCard';
import styles from './ApplicantsPage.module.css';

const ApplicantsPage = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const data = await getApplicantsByJob(jobId);
        setApplicants(data);
      } catch (err) {
        setError('Failed to load applicants.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  if (loading) return <div>Loading applicants...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h2>Applicants for Job ID: {jobId}</h2>
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <div className={styles.applicantList}>
          {applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.applicant_id}
              applicant={applicant}
              onStatusUpdated={(updatedApplicant) => {
                setApplicants(prev =>
                  prev.map(a =>
                    a.applicant_id === updatedApplicant.applicant_id ? updatedApplicant : a
                  )
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;
