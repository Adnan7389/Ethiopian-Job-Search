import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import styles from './NotificationPreview.module.css';

const NotificationPreview = () => {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    const res = await api.get('/notifications?limit=3');
    setNotes(res.data);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    fetchNotifications();
  };

  return (
    <div className={styles.container}>
      <button onClick={() => setOpen(!open)} className={styles.icon}>
        🔔 {notes.filter(n=>!n.is_read).length}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <button onClick={markAllRead} className={styles.markAll}>Mark all as read</button>
          {notes.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notes.map(n => (
              <div key={n.id} className={n.is_read ? styles.read : styles.unread}>
                <small>{new Date(n.created_at).toLocaleString()}</small>
                <p>{n.payload.message}</p>
              </div>
            ))
          )}
          <a href="/notifications">View all</a>
        </div>
      )}
    </div>
  );
};

export default NotificationPreview;