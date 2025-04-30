import React, { useState } from 'react';
import styles from './InterviewModal.module.css';

const InterviewModal = ({ isOpen, onClose, onSchedule }) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [error, setError] = useState('');

  const handleSchedule = () => {
        if (!interviewDate || !interviewLocation) {
          setError('Please enter interview date/time AND location.');
          return;
        }
        onSchedule(interviewDate, interviewLocation);
        setInterviewDate('');
        setInterviewLocation('');
        setError('');
        onClose();
      };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Schedule Interview</h3>
        <input
          type="datetime-local"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
        />
        <input
        type="text"
        placeholder="Location"
        value={interviewLocation}
        onChange={(e) => setInterviewLocation(e.target.value)}
      />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button onClick={handleSchedule}>Schedule</button>
          <button onClick={onClose} className={styles.cancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
