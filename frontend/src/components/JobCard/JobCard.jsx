import React from "react";
import styles from "./JobCard.module.css";

const JobCard = ({ job }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{job.title}</h3>
      <div className={styles.details}>
        <p><span className={styles.label}>Industry:</span> {job.industry}</p>
        <p><span className={styles.label}>Location:</span> {job.location || "Not specified"}</p>
        <p><span className={styles.label}>Job Type:</span> {job.job_type}</p>
        <p><span className={styles.label}>Experience Level:</span> {job.experience_level}</p>
        {job.salary_range && <p><span className={styles.label}>Salary:</span> {job.salary_range}</p>}
      </div>
      <p className={styles.description}>{job.description}</p>
    </div>
  );
};

export default JobCard;