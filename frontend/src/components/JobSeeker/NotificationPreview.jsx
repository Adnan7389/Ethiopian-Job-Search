import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, /* already have receiveNotification from socket */ } from '../../features/notification/notificationSlice';
import styles from './NotificationPreview.module.css';

const NotificationPreview = () => {
   const dispatch = useDispatch();
   const notes = useSelector(state => state.notification.notifications);
   const [open, setOpen] = useState(false);
  
   const loadNotifications = () => {
        dispatch(fetchNotifications());
      };

  useEffect(() => { loadNotifications(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    dispatch(fetchNotifications());
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
              {/* use n.message, not n.payload.message */}
               <p>{n.message}</p>
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