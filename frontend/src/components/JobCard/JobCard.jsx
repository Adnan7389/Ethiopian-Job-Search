import styles from './JobCard.module.css';

function JobCard({ job, onApply }) {
  const { job_title, company_name, location, job_type, salary_min, salary_max } = job;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{job_title}</h3>
      <p className={styles.company}>{company_name}</p>
      <p className={styles.details}>
        {location} | {job_type}
        {salary_min && salary_max ? ` | ${salary_min} - ${salary_max} ETB` : ''}
      </p>
      <button className={styles.applyButton} onClick={() => onApply(job.job_id)}>
        Apply
      </button>
    </div>
  );
}

export default JobCard;