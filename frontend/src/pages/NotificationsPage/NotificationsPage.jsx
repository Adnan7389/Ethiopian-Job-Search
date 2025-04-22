import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchNotifications } from "../../features/notification/notificationSlice";
import { logout } from "../../features/auth/authSlice";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./NotificationsPage.module.css"; // Create this CSS module if needed

function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, notificationStatus, notificationError } = useSelector((state) => state.notification);
  const { status: authStatus, error: authError } = useSelector((state) => state.auth);

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
      try {
        await dispatch(fetchNotifications()).unwrap();
      } catch (err) {
        if (isCancelled) return;
        console.error("Error fetching notifications:", err);
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

  if (authStatus === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notifications</h1>

      {notificationStatus === "loading" && <p>Loading notifications...</p>}
      {notificationError && <p className={styles.error}>{notificationError}</p>}
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className={styles.notificationList}>
          {notifications.map((notification) => (
            <li key={notification.id} className={styles.notificationItem}>
              {notification.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPage;