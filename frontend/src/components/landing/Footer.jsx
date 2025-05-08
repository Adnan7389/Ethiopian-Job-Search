import React from 'react';
import { 
  FiFacebook, 
  FiTwitter, 
  FiLinkedin, 
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.brandColumn}>
            <h3 className={styles.logo}>EthioJobs</h3>
            <p className={styles.tagline}>Ethiopia's #1 Job Platform</p>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FiMail className={styles.contactIcon} />
                <span>contact@ethiojobs.com</span>
              </div>
              <div className={styles.contactItem}>
                <FiPhone className={styles.contactIcon} />
                <span>+251 911 234 567</span>
              </div>
              <div className={styles.contactItem}>
                <FiMapPin className={styles.contactIcon} />
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
          
          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>For Job Seekers</h4>
            <ul className={styles.linksList}>
              <li><a href="/job-search">Browse Jobs</a></li>
              <li><a href="/register?role=job_seeker">Create Profile</a></li>
              <li><a href="/job-alerts">Job Alerts</a></li>
              <li><a href="/career-advice">Career Advice</a></li>
            </ul>
          </div>
          
          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>For Employers</h4>
            <ul className={styles.linksList}>
              <li><a href="/post-job">Post Jobs</a></li>
              <li><a href="/candidate-search">Browse Candidates</a></li>
              <li><a href="/pricing">Pricing Plans</a></li>
              <li><a href="/recruitment-solutions">Recruitment Solutions</a></li>
            </ul>
          </div>
          
          <div className={styles.linksColumn}>
            <h4 className={styles.linksTitle}>Company</h4>
            <ul className={styles.linksList}>
              <li><a href="/about">About Us</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.socialLinks}>
            <a href="/" aria-label="Facebook"><FiFacebook /></a>
            <a href="/" aria-label="Twitter"><FiTwitter /></a>
            <a href="/" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="/" aria-label="Instagram"><FiInstagram /></a>
          </div>
          <div className={styles.legalLinks}>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} EthioJobs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;