import React, { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiAward } from 'react-icons/fi';
import styles from './Stats.module.css';

const Stats = () => {
  const [counts, setCounts] = useState({
    jobs: 0,
    hires: 0,
    companies: 0
  });

  useEffect(() => {
    // Simulate counting animation
    const duration = 2000;
    const start = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - start) / duration);
      
      setCounts({
        jobs: Math.floor(progress * 10000),
        hires: Math.floor(progress * 5000),
        companies: Math.floor(progress * 100)
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, []);

  return (
    <section className={styles.stats}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Trusted by Ethiopian Professionals</h2>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FiBriefcase size={48} className={styles.statIcon} />
            <div className={styles.statNumber}>{counts.jobs.toLocaleString()}+</div>
            <div className={styles.statLabel}>Jobs Posted</div>
          </div>
          
          <div className={styles.statCard}>
            <FiUsers size={48} className={styles.statIcon} />
            <div className={styles.statNumber}>{counts.hires.toLocaleString()}+</div>
            <div className={styles.statLabel}>Hires Made</div>
          </div>
          
          <div className={styles.statCard}>
            <FiAward size={48} className={styles.statIcon} />
            <div className={styles.statNumber}>{counts.companies.toLocaleString()}+</div>
            <div className={styles.statLabel}>Companies Hiring</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;