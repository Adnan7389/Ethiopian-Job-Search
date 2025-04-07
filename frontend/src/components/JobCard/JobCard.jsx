import React from "react";
import { Link } from "react-router-dom";
import styles from "./JobCard.module.css";
import { 
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiArrowRight,
  FiHome,
  FiGlobe,
  FiLinkedin,
  FiMail
} from "react-icons/fi";
import DEFAULT_LOGO from "../../assets/default-profile-icon.png";

const JobCard = ({ job, showMatchScore = false }) => {
  if (!job) {
    return (
      <div className={`${styles.card} ${styles.invalidCard}`}>
        <div className={styles.invalidContent}>
          <p>Invalid job data</p>
        </div>
      </div>
    );
  }

  const {
    company_name,
    company_location,
    website,
    profile_picture_url,
    title = 'Untitled Position',
    location,
    job_type = 'Type not specified',
    salary_range = 'Not specified',
    industry = 'Not specified',
    experience_level = 'Not specified',
    created_at,
    status,
    expires_at,
    match_score
  } = job;

  const isExpired = expires_at && new Date(expires_at) < new Date();
  const isClosed = status !== 'open';

  // Format salary range if it exists
  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (salary.includes('-')) {
      const [min, max] = salary.split('-');
      return `${min.trim()} - ${max.trim()} ETB`;
    }
    return `${salary} ETB`;
  };

  // Calculate days since posting
  const getDaysAgo = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const postedDate = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today - postedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error calculating days ago:', error);
      return 'Date not available';
    }
  };

  // Get score class for match score
  const getScoreClass = (score) => {
    if (!score) return styles.poor;
    if (score >= 80) return styles.excellent;
    if (score >= 60) return styles.good;
    if (score >= 40) return styles.average;
    return styles.poor;
  };

  return (
    <div className={`${styles.card} ${isExpired ? styles.expiredCard : ''} ${isClosed ? styles.closedCard : ''}`}>
      <div className={styles.cardContent}>
        {/* Company Logo */}
        <div className={styles.companyLogoContainer}>
          <img
            src={profile_picture_url || DEFAULT_LOGO}
            alt={company_name || 'Company Logo'}
            className={styles.companyLogo}
          />
        </div>

        {/* Job Details */}
        <div className={styles.jobDetails}>
          <div className={styles.jobHeader}>
            <h3 className={styles.companyName}>{company_name || 'Company Not Specified'}</h3>
            <h2 className={styles.title}>{title}</h2>
          </div>

          <div className={styles.metaContainer}>
            <div className={styles.metaItem}>
              <FiMapPin className={styles.icon} />
              <span>{location || 'Location not specified'}</span>
            </div>
            <div className={styles.metaItem}>
              <FiBriefcase className={styles.icon} />
              <span>{job_type}</span>
            </div>
            <div className={styles.metaItem}>
              <FiDollarSign className={styles.icon} />
              <span>{formatSalary(salary_range)}</span>
            </div>
            <div className={styles.metaItem}>
              <FiClock className={styles.icon} />
              <span>{getDaysAgo(created_at)}</span>
            </div>
          </div>
        </div>

        {/* Status and Action */}
        <div className={styles.actionContainer}>
          <div className={styles.status}>
            {isExpired ? (
              <span className={styles.expiredBadge}>Expired</span>
            ) : isClosed ? (
              <span className={styles.closedBadge}>Closed</span>
            ) : (
              <span className={styles.openBadge}>Open</span>
            )}
          </div>
          <Link to={`/jobs/${job.slug}`} className={styles.detailsLink}>
            View Details <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;