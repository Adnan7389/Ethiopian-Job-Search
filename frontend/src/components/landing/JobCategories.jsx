import React from 'react';
import { 
  FiCode, 
  FiHeart, 
  FiSettings, 
  FiDollarSign, 
  FiBookOpen, 
  FiCoffee 
} from 'react-icons/fi';
import styles from './JobCategories.module.css';

const categories = [
  { name: 'Technology', icon: <FiCode size={24} /> },
  { name: 'Healthcare', icon: <FiHeart size={24} /> },
  { name: 'Engineering', icon: <FiSettings size={24} /> },
  { name: 'Finance', icon: <FiDollarSign size={24} /> },
  { name: 'Education', icon: <FiBookOpen size={24} /> },
  { name: 'Hospitality', icon: <FiCoffee size={24} /> }
];

const JobCategories = () => {
  return (
    <section className={styles.categories}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Popular Industries</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>{category.icon}</div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobCategories;