import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null,
    userId: localStorage.getItem('userId') || null,
    isVerified: localStorage.getItem('isVerified') === 'true' || false,
    selectedRole: null,
    loading: false,
    error: null
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.userType = action.payload.user_type;
      state.userId = action.payload.userId;
      state.isVerified = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userType', action.payload.user_type);
      localStorage.setItem('userId', action.payload.userId);
      localStorage.setItem('isVerified', 'true');
    },
    logout: (state) => {
      state.token = null;
      state.userType = null;
      state.userId = null;
      state.isVerified = false;
      localStorage.clear();
    },
    setRole: (state, action) => {
      state.selectedRole = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.loading = false; })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload.error; })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.userType = action.payload.user_type;
        state.userId = action.payload.userId;
        state.isVerified = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('userType', action.payload.user_type);
        localStorage.setItem('userId', action.payload.userId);
        localStorage.setItem('isVerified', 'true');
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload.error; })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload.error; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload.error; })
      .addCase(verifyEmail.pending, (state) => { state.loading = true; })
      .addCase(verifyEmail.fulfilled, (state) => { state.loading = false; state.isVerified = true; localStorage.setItem('isVerified', 'true'); })
      .addCase(verifyEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload.error; });
  }
});

export const { setCredentials, logout, setRole } = authSlice.actions;
export default authSlice.reducer;