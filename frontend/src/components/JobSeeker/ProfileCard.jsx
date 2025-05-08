import React from 'react';
import { useSelector } from 'react-redux';
import styles from './ProfileCard.module.css';
import { FiUser, FiEdit, FiCheckCircle, FiAward, FiMapPin, FiMail } from 'react-icons/fi';

const ProfileCard = () => {
  const { user } = useSelector(state => state.auth);
  const { profile } = useSelector(state => state.profile);
  
  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.bio,
      profile.skills?.length > 0,
      profile.education?.length > 0,
      profile.experience?.length > 0,
      profile.location,
      profile.resume_url
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {profile?.profile_picture_url ? (
            <img 
              src={profile.profile_picture_url} 
              alt={`${user?.username}'s profile`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <FiUser className={styles.avatarIcon} />
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>
            {profile?.full_name || user?.username}
            {profile?.is_verified && (
              <FiCheckCircle className={styles.verifiedIcon} />
            )}
          </h2>
          <p className={styles.profileTitle}>
            {profile?.title || 'Job Seeker'}
          </p>
        </div>
      </div>

      <div className={styles.profileDetails}>
        {profile?.location && (
          <div className={styles.detailItem}>
            <FiMapPin className={styles.detailIcon} />
            <span>{profile.location}</span>
          </div>
        )}
        <div className={styles.detailItem}>
          <FiMail className={styles.detailIcon} />
          <span>{user?.email}</span>
        </div>
        {profile?.skills?.length > 0 && (
          <div className={styles.detailItem}>
            <FiAward className={styles.detailIcon} />
            <span>{profile.skills.length} skills listed</span>
          </div>
        )}
      </div>

      <div className={styles.profileCompletion}>
        <div className={styles.completionHeader}>
          <span>Profile Completion</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      <a href="/profile" className={styles.editButton}>
        <FiEdit className={styles.editIcon} />
        Edit Profile
      </a>
    </div>
  );
};

export default ProfileCard;