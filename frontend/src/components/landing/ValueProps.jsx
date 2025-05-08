import React from 'react';
import { FiSearch, FiFileText, FiBell } from 'react-icons/fi';
import styles from './ValueProps.module.css';

const ValueProps = () => {
  const features = [
    {
      icon: <FiSearch size={32} />,
      title: 'Browse 1000+ Jobs',
      description: 'Access the largest database of jobs in Ethiopia'
    },
    {
      icon: <FiFileText size={32} />,
      title: 'Easy Application',
      description: 'Apply with just one click using your profile'
    },
    {
      icon: <FiBell size={32} />,
      title: 'Job Alerts',
      description: 'Get notified when new jobs match your criteria'
    }
  ];

  return (
    <section className={styles.valueProps}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;