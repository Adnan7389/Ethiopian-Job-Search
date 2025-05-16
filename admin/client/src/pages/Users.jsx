import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, toggleUserSuspension } from '../services/api';
import {
  FiUser,
  FiMail,
  FiUserCheck,
  FiUserX,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiAlertCircle,
  FiBriefcase
} from 'react-icons/fi';
import styles from './Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSuspendToggle = async (userId, currentSuspendedStatus) => {
    try {
      await toggleUserSuspension(userId, !currentSuspendedStatus);
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, is_suspended: !currentSuspendedStatus ? 1 : 0 } 
          : user
      ));
    } catch (err) {
      console.error('Failed to update user suspension status:', err);
      alert('Failed to update user suspension status');
    }
  };
  
  const filteredUsers = filterType === 'all' 
    ? users 
    : users.filter(user => user.user_type === filterType);

  if (loading) return (
    <div className={styles.loadingState}>
      <FiRefreshCw className={styles.loadingIcon} />
      <p className={styles.loadingText}>Loading users...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles.errorState}>
      <FiAlertCircle className={styles.errorIcon} />
      <p className={styles.errorText}>{error}</p>
      <button 
        onClick={fetchUsers}
        className={styles.retryButton}
      >
        Try Again
      </button>
    </div>
  );
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <p className={styles.subtitle}>Manage all platform users</p>
      </div>
        
      <div className={styles.filterContainer}>
        <div className={styles.filterLabel}>
          <FiFilter className={styles.filterLabelIcon} />
          <span>Filter:</span>
        </div>
        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${filterType === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filterType === 'job_seeker' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('job_seeker')}
          >
            Job Seekers
          </button>
          <button 
            className={`${styles.filterButton} ${filterType === 'employer' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilterType('employer')}
          >
            Employers
          </button>
        </div>
      </div>
      
      <div className={styles.gridContainer}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <FiUser className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>No users found</p>
            <p className={styles.emptyStateSubtext}>Try changing your filters</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.user_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <FiUser />
                  </div>
                  <div>
                    <div className={styles.userName}>{user.username}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${
                  user.user_type === 'employer' ? styles.statusActive : styles.statusSuspended
                }`}>
                  {user.user_type === 'employer' ? (
                    <>
                      <FiBriefcase className={styles.statusBadgeIcon} />
                      <span>Employer</span>
                    </>
                  ) : (
                    <>
                      <FiUser className={styles.statusBadgeIcon} />
                      <span>Job Seeker</span>
                    </>
                  )}
                </span>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardDetail}>
                  <FiCalendar className={styles.cardDetailIcon} />
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className={styles.cardDetail}>
                  <span className={`${styles.statusBadge} ${
                    user.is_suspended ? styles.statusSuspended : styles.statusActive
                  }`}>
                    {user.is_suspended ? (
                      <>
                        <FiUserX className={styles.statusBadgeIcon} />
                        <span>Suspended</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className={styles.statusBadgeIcon} />
                        <span>Active</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button
                  onClick={() => handleSuspendToggle(user.user_id, user.is_suspended)}
                  className={`${styles.actionButton} ${
                    user.is_suspended ? styles.unsuspendButton : styles.suspendButton
                  }`}
                >
                  {user.is_suspended ? (
                    <FiUserCheck className={styles.actionButtonIcon} />
                  ) : (
                    <FiUserX className={styles.actionButtonIcon} />
                  )}
                  <span>{user.is_suspended ? 'Unsuspend' : 'Suspend'}</span>
                </button>
                <Link
                  to={`/users/${user.user_id}`}
                  className={`${styles.actionButton} ${styles.viewButton}`}
                >
                  <FiEye className={styles.actionButtonIcon} />
                  <span>View</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Users;