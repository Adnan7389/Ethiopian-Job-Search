import React from 'react';
import { useSelector } from 'react-redux';
import styles from './ProfileCard.module.css';

const ProfileCard = () => {
  const { userId, username, email } = useSelector(state => state.auth);
  return (
    <div className={styles.card}>
      <h2>{username}</h2>
      <p>{email}</p>
      <a href="/edit-profile">Edit Profile</a>
    </div>
  );
};

export default ProfileCard;
