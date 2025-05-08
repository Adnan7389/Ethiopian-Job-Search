import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUser, FiBriefcase } from 'react-icons/fi';
import styles from './CallToAction.module.css';

const CallToAction = () => {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to transform your career or hiring?</h2>
          <p className={styles.ctaSubtitle}>
            Join Ethiopia's fastest growing professional network with over 50,000+ opportunities
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/register?role=job_seeker" className={styles.ctaButtonPrimary}>
              <FiUser className={styles.ctaIcon} />
              <span>Start Applying</span>
              <FiArrowRight className={styles.ctaArrow} />
            </Link>
            <Link to="/register?role=employer" className={styles.ctaButtonSecondary}>
              <FiBriefcase className={styles.ctaIcon} />
              <span>Hire Talent</span>
              <FiArrowRight className={styles.ctaArrow} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;