import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reportJob } from '../../features/job/jobSlice';
import Modal from '../Modal/Modal';
import { toast } from 'react-toastify';
import styles from './ReportJobModal.module.css';

const REPORT_REASONS = [
  'Inappropriate Content',
  'Fake Job Posting',
  'Spam',
  'Discriminatory',
  'Other'
];

const ReportJobModal = ({ isOpen, onClose, jobId }) => {
  const dispatch = useDispatch();
  const { reportStatus, reportError } = useSelector((state) => state.job);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Submitting report form:', { jobId, reason, description });

    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    try {
      console.log('Dispatching reportJob action...');
      await dispatch(reportJob({ jobId, reason, description })).unwrap();
      console.log('Report submitted successfully');
      toast.success('Job reported successfully. Thank you for helping us maintain quality!');
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err);
      toast.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Job">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="reason">Reason for Report</label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={styles.select}
            disabled={reportStatus === 'loading'}
          >
            <option value="">Select a reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about the issue..."
            rows={4}
            className={styles.textarea}
            disabled={reportStatus === 'loading'}
          />
        </div>

        {(error || reportError) && (
          <div className={styles.error}>
            {error || reportError}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={reportStatus === 'loading'}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={reportStatus === 'loading'}
          >
            {reportStatus === 'loading' ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportJobModal; 