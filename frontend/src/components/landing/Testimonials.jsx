import React from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    name: 'Alemayehu Kebede',
    role: 'Software Developer at TechEthiopia',
    content: 'Found my dream job within two weeks of using this platform. The application process was so simple!',
    rating: 5
  },
  {
    name: 'Selamawit Assefa',
    role: 'HR Manager at GreenPath',
    content: 'We\'ve hired 5 excellent candidates through this platform. The quality of applicants is outstanding.',
    rating: 5
  },
  {
    name: 'Yohannes Tesfaye',
    role: 'Marketing Specialist',
    content: 'The job alerts helped me discover opportunities I wouldn\'t have found otherwise. Highly recommended!',
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Success Stories</h2>
        <p className={styles.sectionSubtitle}>Hear from people who found success using our platform</p>
        
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < testimonial.rating ? styles.filledStar : styles.emptyStar}
                  />
                ))}
              </div>
              <p className={styles.content}>"{testimonial.content}"</p>
              <div className={styles.author}>
                <h4 className={styles.name}>{testimonial.name}</h4>
                <p className={styles.role}>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;