import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './DashboardSummary.module.css';

const DashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/applications/summary');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p>Loading summary…</p>;
  if (error)   return <p className="error">{error}</p>;

  const { total, pending, shortlisted, scheduled, interviewed, accepted, rejected } = summary;

  return (
    <div className={styles.grid}>
      {[
        ['Total', total],
        ['Pending', pending],
        ['Shortlisted', shortlisted],
        ['Scheduled', scheduled],
        ['Interviewed', interviewed],
        ['Accepted', accepted],
        ['Rejected', rejected],
      ].map(([label, count]) => (
        <div key={label} className={styles.card}>
          <h3>{label}</h3>
          <p>{count}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummary;
