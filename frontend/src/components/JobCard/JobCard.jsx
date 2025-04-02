import React from 'react';
import { useSelector } from 'react-redux';
import Button from '../Button/Button';
import styles from './JobCard.module.css';

const JobCard = ({ job, onEdit, onDelete }) => {
  const { userType, userId } = useSelector((state) => state.auth);
  const isEmployer = userType === 'employer';
  const isOwner = isEmployer && job.employer_id === parseInt(userId);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{job.job_title}</h3>
      <p className={styles.company}>{job.company_name}</p>
      <p className={styles.location}>{job.location}</p>
      <p className={styles.jobType}>{job.job_type.replace('_', ' ').toUpperCase()}</p>
      <p className={styles.salary}>
        Salary: {job.salary_min} - {job.salary_max} ETB
      </p>
      <p className={styles.description}>{job.description}</p>
      {isOwner && (
        <div className={styles.actions}>
          <Button onClick={() => onEdit(job)} variant="primary">Edit</Button>
          <Button onClick={() => onDelete(job.job_id)} variant="secondary">Delete</Button>
        </div>
      )}
    </div>
  );
};

export default JobCard;