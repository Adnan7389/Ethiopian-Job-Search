import React, { useState } from 'react';
import { 
  FiUser, 
  FiBriefcase, 
  FiCheckCircle, 
  FiClock, 
  FiPhone,
  FiSearch,
  FiSend,
  FiUsers
} from 'react-icons/fi';
import styles from './HowItWorks.module.css';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('jobSeekers');

  const jobSeekerSteps = [
    { 
      icon: <FiUser className={styles.stepIcon} />,
      title: 'Create Your Profile',
      text: 'Build your professional profile in minutes'
    },
    { 
      icon: <FiSearch className={styles.stepIcon} />,
      title: 'Find Jobs',
      text: 'Browse thousands of opportunities across Ethiopia'
    },
    { 
      icon: <FiSend className={styles.stepIcon} />,
      title: 'Apply Easily',
      text: 'One-click applications with your saved profile'
    },
    { 
      icon: <FiCheckCircle className={styles.stepIcon} />,
      title: 'Get Hired',
      text: 'Receive offers and start your new career'
    }
  ];

  const employerSteps = [
    { 
      icon: <FiBriefcase className={styles.stepIcon} />,
      title: 'Post Jobs',
      text: 'List your openings in just a few minutes'
    },
    { 
      icon: <FiUsers className={styles.stepIcon} />,
      title: 'Review Candidates',
      text: 'Access qualified applicants in your dashboard'
    },
    { 
      icon: <FiPhone className={styles.stepIcon} />,
      title: 'Connect',
      text: 'Interview and communicate with top talent'
    },
    { 
      icon: <FiCheckCircle className={styles.stepIcon} />,
      title: 'Hire',
      text: 'Bring the best candidates onto your team'
    }
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How EthioJobs Works</h2>
          <p className={styles.sectionSubtitle}>
            Simple steps to achieve your career or hiring goals
          </p>
        </div>
        
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'jobSeekers' ? styles.active : ''}`}
            onClick={() => setActiveTab('jobSeekers')}
          >
            <FiUser className={styles.tabIcon} />
            For Job Seekers
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'employers' ? styles.active : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            <FiBriefcase className={styles.tabIcon} />
            For Employers
          </button>
        </div>
        
        <div className={styles.stepsContainer}>
          <div className={styles.stepsGrid}>
            {(activeTab === 'jobSeekers' ? jobSeekerSteps : employerSteps).map((step, index) => (
              <div key={index} className={styles.stepCard}>
                <div className={styles.stepNumber}>0{index + 1}</div>
                <div className={styles.stepIconContainer}>
                  {step.icon}
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;