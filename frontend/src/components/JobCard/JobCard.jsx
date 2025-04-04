import React from "react";
import styles from "./JobCard.module.css";

const JobCard = ({ job }) => {
  return (
    <div className={styles.card}>
      <h3>{job.title}</h3>
      <p><strong>Industry:</strong> {job.industry}</p>
      <p><strong>Location:</strong> {job.location || "Not specified"}</p>
      <p><strong>Job Type:</strong> {job.job_type}</p>
      <p><strong>Experience Level:</strong> {job.experience_level}</p>
      {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
      <p>{job.description}</p>
    </div>
  );
};

export default JobCard;