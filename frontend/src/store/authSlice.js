import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null,
    userId: localStorage.getItem('userId') || null
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.userType = action.payload.user_type;
      state.userId = action.payload.userId;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userType', action.payload.user_type);
      localStorage.setItem('userId', action.payload.userId);
    },
    logout: (state) => {
      state.token = null;
      state.userType = null;
      state.userId = null;
      localStorage.clear();
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;