import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleHighlight}>Find</span> Your Perfect Job <br />
            in <span className={styles.titleHighlight}>Ethiopia</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Thousands of jobs from top employers waiting for you
          </p>
          <div className={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <FiSearch />
              Search Jobs
            </button>
          </div>
          <div className={styles.ctaButtons}>
            <Link to="/register?role=job_seeker" className={styles.primaryButton}>
              <FiBriefcase className={styles.buttonIcon} />
              <span>Looking for work?</span>
              <FiArrowRight className={styles.buttonArrow} />
            </Link>
            <Link to="/register?role=employer" className={styles.secondaryButton}>
              <FiBriefcase className={styles.buttonIcon} />
              <span>Need to hire?</span>
              <FiArrowRight className={styles.buttonArrow} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;