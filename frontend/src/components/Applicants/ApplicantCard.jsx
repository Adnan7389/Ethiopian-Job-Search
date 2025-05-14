import React, { useState } from 'react';
import { toast } from 'react-toastify';
import InterviewModal from '../InterviewModal/InterviewModal';
import styles from './ApplicantCard.module.css';
import { scheduleInterview, updateApplicantStatus } from '../../services/applicationService';
import api from '../../services/api';

const ApplicantCard = ({ applicant, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleViewResume = async (e) => {
    e.preventDefault();
    try {
      // The resume_url is already a full path, so we can use it directly
      if (!applicant.resume_url) {
        toast.error('No resume available');
        return;
      }

      // Construct the full URL using import.meta.env
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // Remove /api from the base URL since resume_url already includes /uploads
      const apiBaseUrl = baseUrl.replace('/api', '');
      const fullUrl = `${apiBaseUrl}${applicant.resume_url}`;
      window.open(fullUrl, '_blank');
    } catch (err) {
      console.error('Error opening resume:', err);
      toast.error('Error accessing resume');
    }
  };

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
      await updateApplicantStatus(applicant.applicant_id, newStatus);
      
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
    try {
      setLoading(true);
      const [date, time] = dateTime.split('T');
      await scheduleInterview(applicant.applicant_id, { date, time, location });
      
      const updatedApplicant = {
        ...applicant,
        status: 'scheduled',
        interview_date: date,
        interview_time: time,
        interview_location: location
      };
      
      onStatusUpdated(updatedApplicant);
      toast.success('Interview scheduled');
    } catch (err) {
      console.error('Error scheduling interview:', err);
      toast.error('Error scheduling interview');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const { username, email, resume_url, status, match_score, full_name, profile_picture_url } = applicant;

  const getScoreClass = (score) => {
    if (!score) {
      console.warn('No match score provided for applicant:', applicant);
      return styles.poor;
    }
    if (score >= 80) return styles.excellent;
    if (score >= 60) return styles.good;
    if (score >= 40) return styles.average;
    return styles.poor;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
      {profile_picture_url && (
        <img
          src={profile_picture_url || '/default-avatar.png'}
          alt="Profile"
          className={styles.avatar}
          loading="lazy"
        />
      )}
        <div className={styles.userInfo}>
          <h3 className={styles.name}>{full_name || username}</h3>
          <p className={styles.email}>{email}</p>
        </div>
      </div>

      <div className={styles.content}>
      {resume_url && (
          <div className={styles.resume}>
            <button 
              onClick={handleViewResume}
              className={styles.resumeLink}
            >
              View Resume
            </button>
          </div>
      )}
        
        <div className={styles.status}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={`${styles.statusValue} ${styles[status?.toLowerCase()]}`}>
            {status}
          </span>
        </div>

      {match_score !== undefined && (
          <div className={styles.matchScore}>
            <span className={styles.scoreLabel}>Match Score:</span>
            <span className={`${styles.scoreBadge} ${getScoreClass(match_score)}`}>
              {match_score}%
            </span>
          </div>
      )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {status === 'pending' && (
          <>
            <button 
              onClick={() => handleAction('shortlisted')} 
              disabled={loading}
              className={styles.actionButton}
            >
              Shortlist
            </button>
            <button 
              onClick={() => handleAction('rejected')} 
              disabled={loading}
              className={`${styles.actionButton} ${styles.rejectButton}`}
            >
              Reject
            </button>
          </>
        )}

        {status === 'shortlisted' && (
          <>
            <button 
              onClick={() => setShowModal(true)} 
              disabled={loading}
              className={styles.actionButton}
            >
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
          <button 
            onClick={() => handleAction('interviewed')} 
            disabled={loading}
            className={styles.actionButton}
          >
            Mark as Interviewed
          </button>
        )}

        {status === 'interviewed' && (
          <>
            <button 
              onClick={() => handleAction('accepted')} 
              disabled={loading}
              className={`${styles.actionButton} ${styles.acceptButton}`}
            >
              Accept
            </button>
            <button 
              onClick={() => handleAction('rejected')} 
              disabled={loading}
              className={`${styles.actionButton} ${styles.rejectButton}`}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;