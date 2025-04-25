import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import jobReducer from '../features/job/jobSlice';
import notificationReducer from '../features/notification/notificationSlice';
import profileReducer from '../features/profile/profileSlice'; // Added

export const store = configureStore({
  reducer: {
    auth: authReducer,
    job: jobReducer,
    notification: notificationReducer,
    profile: profileReducer, // Added
  },
});