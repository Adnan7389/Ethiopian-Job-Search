import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { fetchNotifications, resetNotificationStatus } from "../../features/notification/notificationSlice";
import { logout } from "../../features/auth/authSlice";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./NotificationsPage.module.css";
import { 
  FiBell, 
  FiChevronLeft, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo,
  FiClock,
  FiTrash2,
  FiFileText,
  FiBriefcase,
  FiArrowRight
} from "react-icons/fi";
import Button from "../../components/Button/Button";
import axios from "axios";

function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, notificationStatus, notificationError } = useSelector((state) => state.notification);
  const { status: authStatus, error: authError, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authStatus !== "succeeded") {
      if (authStatus === "failed") {
        console.error("Auth failed:", authError);
        dispatch(logout());
        navigate("/login");
      }
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      console.log("NotificationsPage: Dispatching fetchNotifications");
      try {
        const result = await dispatch(fetchNotifications()).unwrap();
        console.log("NotificationsPage: fetchNotifications result:", result);
      } catch (err) {
        if (isCancelled) return;
        console.error("NotificationsPage: Error fetching notifications:", err);
        if (
          err === "No token provided" ||
          err === "Invalid token" ||
          err === "Token has expired"
        ) {
          dispatch(logout());
          navigate("/login");
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, authStatus, authError, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <FiCheckCircle className={styles.notificationIconSuccess} />;
      case 'error':
        return <FiAlertCircle className={styles.notificationIconError} />;
      case 'warning':
        return <FiAlertCircle className={styles.notificationIconWarning} />;
      case 'application_status':
        return <FiFileText className={styles.notificationIconInfo} />;
      case 'job_match':
        return <FiBriefcase className={styles.notificationIconInfo} />;
      default:
        return <FiInfo className={styles.notificationIconInfo} />;
    }
  };

  const renderNotificationContent = (notification) => {
    const content = (
      <div className={styles.notificationContent}>
        <p className={styles.notificationMessage}>{notification.message}</p>
        {notification.link && (
          <Link to={notification.link} className={styles.notificationLink}>
            View Details <FiArrowRight />
          </Link>
        )}
      </div>
    );

    return content;
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Socket event will trigger fetchNotifications
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Socket event will trigger fetchNotifications
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Socket event will trigger fetchNotifications
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  if (authStatus === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button 
          onClick={handleBack}
          variant="secondary"
          className={styles.backButton}
          aria-label="Go back"
        >
          <FiChevronLeft className={styles.backIcon} />
          Back
        </Button>
        <h1 className={styles.title}>
          <FiBell className={styles.titleIcon} />
          Notifications
        </h1>
        <Button
          onClick={handleClearAll}
          variant="danger"
          className={styles.clearButton}
          aria-label="Clear all notifications"
        >
          Clear All
        </Button>
      </header>

      <div className={styles.content}>
        {notificationStatus === "loading" && (
          <div className={styles.loadingState}>
            <p>Loading your notifications...</p>
          </div>
        )}

        {notificationError && (
          <div className={styles.errorAlert} role="alert">
            <FiAlertCircle className={styles.errorIcon} />
            {notificationError}
          </div>
        )}

        {notificationStatus === "succeeded" && notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBell className={styles.emptyStateIcon} />
            <h3>No new notifications</h3>
            <p>You're all caught up! We'll notify you when there's new activity.</p>
          </div>
        ) : notificationStatus === "succeeded" ? (
          <ul className={styles.notificationList}>
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`${styles.notificationCard} ${notification.is_read ? '' : styles.unread}`}
              >
                <div className={styles.notificationHeader}>
                  <div className={styles.notificationType}>
                    {getNotificationIcon(notification.type || 'info')}
                    <span className={styles.notificationCategory}>
                      {notification.type === 'application_status' ? 'Application Update' : notification.category || 'General'}
                    </span>
                  </div>
                  <div className={styles.notificationTime}>
                    <FiClock className={styles.timeIcon} />
                    {formatDate(notification.created_at)}
                  </div>
                </div>
                
                {renderNotificationContent(notification)}
                
                <div className={styles.notificationActions}>
                  {!notification.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={styles.markAsReadButton}
                      aria-label="Mark as read"
                    >
                      Mark as read
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteNotification(notification.id)}
                    className={styles.deleteButton}
                    aria-label="Delete notification"
                  >
                    <FiTrash2 className={styles.deleteIcon} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default NotificationsPage;