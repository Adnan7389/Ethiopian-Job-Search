import React from 'react';
import HeroSection from '../../components/landing/HeroSection';
import ValueProps from '../../components/landing/ValueProps';
import JobCategories from '../../components/landing/JobCategories';
import HowItWorks from '../../components/landing/HowItWorks';
import Testimonials from '../../components/landing/Testimonials';
import Stats from '../../components/landing/Stats';
import CallToAction from '../../components/landing/CallToAction';
import Footer from '../../components/landing/Footer';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <HeroSection />
      <ValueProps />
      <JobCategories />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default LandingPage;