import React, { useEffect, useState } from 'react';
import styles from './MyApplications.module.css';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Axios instance

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You must be logged in to view your applications.');
          setLoading(false);
          return;
        }

        const res = await api.get('/applications/my-applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <div className={styles.spinner}>Loading...</div>;
  }

  if (applications.length === 0) {
    return <div className={styles.empty}>You haven't applied to any jobs yet.</div>;
  }

  return (
    <div className={styles.container}>
      <h2>My Applications</h2>
      <div className={styles.list}>
        {applications.map((app) => (
          <div key={app.id} className={styles.card}>
            <h3>{app.Job?.title}</h3>
            <p><strong>Company:</strong> {app.Job?.companyName}</p>
            <p><strong>Status:</strong> {app.status}</p>
            <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
