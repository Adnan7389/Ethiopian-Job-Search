import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications } from '../../features/notification/notificationSlice';
import styles from './NotificationPreview.module.css';
import { FiBell, FiCheck, FiChevronRight, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const NotificationPreview = () => {
  const dispatch = useDispatch();
  const { notifications, status } = useSelector(state => state.notification);
  const [open, setOpen] = useState(false);
  const [loadingMarkRead, setLoadingMarkRead] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadNotifications = () => {
    dispatch(fetchNotifications(5)); // Load last 5 notifications
  };

  useEffect(() => { 
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    setLoadingMarkRead(true);
    try {
      await api.put('/notifications/mark-all-read');
      loadNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    } finally {
      setLoadingMarkRead(false);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.notificationContainer}>
      <button 
        onClick={() => setOpen(!open)} 
        className={styles.notificationButton}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <FiBell className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.notificationDropdown}>
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>Notifications</h3>
            <button 
              onClick={markAllRead} 
              className={styles.markAllButton}
              disabled={unreadCount === 0 || loadingMarkRead}
            >
              {loadingMarkRead ? (
                'Processing...'
              ) : (
                <>
                  <FiCheck className={styles.markAllIcon} />
                  Mark all as read
                </>
              )}
            </button>
          </div>

          <div className={styles.notificationList}>
            {status === 'loading' ? (
              <div className={styles.loadingState}>
                <LoadingSpinner size="small" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <FiBell className={styles.emptyIcon} />
                <p>No notifications yet</p>
                <small>We'll notify you when there's activity</small>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`${styles.notificationItem} ${
                    notification.is_read ? styles.read : styles.unread
                  }`}
                >
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    <div className={styles.notificationMeta}>
                      <FiClock className={styles.timeIcon} />
                      <span className={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <a href="/notifications" className={styles.viewAllLink}>
            View all notifications
            <FiChevronRight className={styles.viewAllIcon} />
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationPreview;