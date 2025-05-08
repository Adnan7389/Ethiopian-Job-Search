import React from "react";
import { Link } from "react-router-dom";
import styles from "./JobCard.module.css";
import { 
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiArrowRight
} from "react-icons/fi";

const JobCard = ({ job }) => {
  // Format salary range if it exists
  const formatSalary = (salary) => {
    if (!salary) return null;
    if (salary.includes('-')) {
      const [min, max] = salary.split('-');
      return `${min.trim()} - ${max.trim()}`;
    }
    return salary;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>
          <Link to={`/jobs/${job.slug}`} className={styles.titleLink}>
            {job.title}
          </Link>
        </h3>
        {job.is_featured && (
          <span className={styles.featuredBadge}>Featured</span>
        )}
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <FiBriefcase className={styles.detailIcon} />
          <span className={styles.detailText}>{job.industry}</span>
        </div>
        
        <div className={styles.detailItem}>
          <FiMapPin className={styles.detailIcon} />
          <span className={styles.detailText}>{job.location || "Remote"}</span>
        </div>
        
        <div className={styles.detailItem}>
          <FiClock className={styles.detailIcon} />
          <span className={styles.detailText}>{job.job_type}</span>
        </div>
        
        <div className={styles.detailItem}>
          <FiBarChart2 className={styles.detailIcon} />
          <span className={styles.detailText}>{job.experience_level}</span>
        </div>
        
        {job.salary_range && (
          <div className={styles.detailItem}>
            <FiDollarSign className={styles.detailIcon} />
            <span className={styles.detailText}>{formatSalary(job.salary_range)}</span>
          </div>
        )}
      </div>

      <div className={styles.descriptionWrapper}>
        <p className={styles.description}>
          {job.description.length > 150 
            ? `${job.description.substring(0, 150)}...` 
            : job.description}
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.postedDate}>
          Posted: {new Date(job.created_at).toLocaleDateString()}
        </div>
        <Link to={`/jobs/${job.slug}`} className={styles.detailsLink}>
          View Details <FiArrowRight className={styles.linkIcon} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;