import React, { useState } from 'react';
import { toast } from 'react-toastify';
import InterviewModal from '../InterviewModal/InterviewModal';

import styles from './ApplicantCard.module.css';
import { scheduleInterview, updateApplicantStatus } from '../../services/applicationService';

const ApplicantCard = ({ applicant, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const handleAction = async (newStatus, interviewDate = null) => {
    try {
      if (newStatus === 'rejected') {
        const confirmReject = window.confirm("Are you sure you want to reject this applicant?");
        if (!confirmReject) return;
      }
  
      if (newStatus === 'accepted') {
        const confirmAccept = window.confirm("Are you sure you want to accept this applicant?");
        if (!confirmAccept) return;
      }
  
      setLoading(true);
      setError('');
      await updateApplicantStatus(applicant.applicant_id, newStatus, interviewDate);
      const updatedApplicant = {
        ...applicant,
        status: newStatus,
        interview_date: interviewDate?.date || null,
        interview_time: interviewDate?.time || null,
      };
      onStatusUpdated(updatedApplicant);
      
  
      if (newStatus === 'scheduled') {
        toast.success('Interview scheduled successfully!');
      } else if (newStatus === 'shortlisted') {
        toast.info('Applicant shortlisted');
      } else if (newStatus === 'accepted') {
        toast.success('Applicant accepted!');
      } else if (newStatus === 'rejected') {
        toast.warning('Applicant rejected');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
      toast.error('Error updating applicant status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (dateTime, location) => {
        // split dateTime into date and time
        try {
          const [date, time] = dateTime.split('T');
        await scheduleInterview(applicant.applicant_id, { date, time, location });
         toast.success('Interview scheduled');
         onStatusUpdated({ ...applicant, status: 'scheduled' });
        }  catch (err) {
        toast.error('Error scheduling interview');
        } finally {
         setLoading(false);
        setShowModal(false);
        }
  };
  
  
  const { username, email, resume_url, status } = applicant;

  return (
    <div className={styles.card}>
      <h3>{username}</h3>
      <p>Email: {email}</p>
      {resume_url && (
        <p>
          Resume: <a href={resume_url} target="_blank" rel="noopener noreferrer">View</a>
        </p>
      )}
      <p>Status: <strong>{status}</strong></p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className={styles.actions}>
    {status === 'pending' && (
      <>
      <button onClick={() => handleAction('shortlisted')} disabled={loading}>Shortlist</button>
      <button onClick={() => handleAction('rejected')} disabled={loading}>Reject</button>
      </>
      )}

  {status === 'shortlisted' && (
    <>
      <button onClick={() => setShowModal(true)} disabled={loading}>
        Schedule Interview
      </button>
      <InterviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSchedule={handleSchedule}
      />
    </>
  )}

  {status === 'scheduled' && (
    <button onClick={() => handleAction('interviewed')} disabled={loading}>
      Mark as Interviewed
    </button>
  )}

  {status === 'interviewed' && (
    <>
    <button onClick={() => handleAction('accepted')} disabled={loading}>
      Accept
    </button>
    <button onClick={() => handleAction('rejected')} disabled={loading}>Reject</button>
    </>
    
    )}
  </div>

    </div>
  );
};

export default ApplicantCard;
