import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { fetchRecommendedJobs } from '../job/jobSlice';

const initialState = {
  token: null,
  userType: null,
  userId: null,
  username: null,
  email: null,
  resume_url: null,
  isVerified: false,
  status: 'idle',
  error: null,
  resendStatus: 'idle',
  resendError: null,
  resendMessage: null,
  hasInitialized: false,
};

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue, getState }) => {
  const { hasInitialized } = getState().auth;
  if (hasInitialized) {
    console.log("initializeAuth: Already initialized, skipping");
    return; // Skip if already initialized
  }

  const token = localStorage.getItem('token');
  console.log("initializeAuth: Checking token in localStorage:", token);
  if (!token) {
    console.log("initializeAuth: No token found, rejecting");
    return rejectWithValue('No token found');
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    console.log("initializeAuth: Token expiration:", new Date(decoded.exp * 1000).toISOString());
    if (decoded.exp < currentTime) {
      console.log("initializeAuth: Token expired, clearing localStorage");
      localStorage.clear();
      return rejectWithValue('Token has expired');
    }
  } catch (error) {
    console.error("initializeAuth: Error decoding token:", error);
    localStorage.clear();
    return rejectWithValue('Invalid token');
  }

  try {
    console.log("initializeAuth: Making request to /auth/validate-token");
    const response = await api.get('/auth/validate-token');
    console.log("initializeAuth: Response from /auth/validate-token:", response.data);
    const { userId, user_type, username, email, resume_url } = response.data;
    return { token, userType: user_type, userId, username, email, resume_url, isVerified: true };
  } catch (error) {
    console.error("initializeAuth: Error validating token:", error);
    localStorage.clear();
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return { email: userData.email };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const resendCode = createAsyncThunk('auth/resendCode', async (email, { rejectWithValue }) => {
  if (!email) {
    return rejectWithValue('Email is required to resend code');
  }
  try {
    const response = await api.post('/auth/resend-code', { email });
    console.log('resendCode API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('resendCode error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message || 'Failed to resend code');
  }
});

export const verifyCode = createAsyncThunk('auth/verifyCode', async ({ email, code }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-code', { email, code });
    console.log('verifyCode API response:', response.data);

    const { accessToken, refreshToken, user_type, userId, username, email: userEmail, resume_url } = response.data;

    if (!accessToken || !refreshToken || !user_type || !userId || !username || !userEmail) {
      return rejectWithValue('Missing authentication data in response');
    }

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userType', user_type);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('email', userEmail);
    localStorage.setItem('resume_url', resume_url || '');
    localStorage.setItem('isVerified', 'true');

    return { 
      token: accessToken, 
      userType: user_type, 
      userId, 
      username, 
      email: userEmail, 
      resume_url: resume_url || '' 
    };
  } catch (error) {
    console.error('verifyCode error:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.error || error.message || 'Verification failed');
  }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (token, { rejectWithValue }) => {
  try {
    const response = await api.get(`/auth/verify-email/${token}`);
    const { accessToken, refreshToken, user_type, userId, username, email, resume_url } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userType', user_type);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('resume_url', resume_url || '');
    localStorage.setItem('isVerified', 'true');
    return { token: accessToken, userType: user_type, userId, username, email, resume_url };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const {
        accessToken,
        refreshToken,
        user_type,
        userId,
        username,
        email,
        resume_url,
      } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userType', user_type);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      localStorage.setItem('resume_url', resume_url || '');
      localStorage.setItem('isVerified', 'true');
      
      return {
        token: accessToken,
        refreshToken,
        userType: user_type,
        userId,
        username,
        email,
        resume_url,
      };
    } catch (error) {
      console.log('Login error response:', error.response);
      // Get the error message from the response data
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      console.log('Login error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const verifyResetCode = createAsyncThunk('auth/verifyResetCode', async ({ email, code }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/reset-password', { email, password });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.userType = action.payload;
      localStorage.setItem('userType', action.payload);
    },
    logout: (state) => {
      localStorage.clear();
      state.token = null;
      state.userType = null;
      state.userId = null;
      state.username = null;
      state.email = null;
      state.resume_url = null;
      state.isVerified = false;
      state.status = 'idle';
      state.error = null;
      state.resendStatus = 'idle';
      state.resendError = null;
      state.resendMessage = null;
      state.hasInitialized = false;
    },
    clearResendMessage: (state) => {
      state.resendMessage = null;
      state.resendError = null;
    },
    initializeAuthSuccess: (state, action) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.resume_url = action.payload.resume_url;
      state.isVerified = action.payload.isVerified;
      state.hasInitialized = true;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (!action.payload) return;
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userType = action.payload.userType;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.resume_url = action.payload.resume_url;
        state.isVerified = action.payload.isVerified;
        state.hasInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.token = null;
        state.userType = null;
        state.userId = null;
        state.username = null;
        state.email = null;
        state.resume_url = null;
        state.isVerified = false;
        state.hasInitialized = true;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(resendCode.pending, (state) => {
        state.resendStatus = 'loading';
        state.resendError = null;
        state.resendMessage = null;
      })
      .addCase(resendCode.fulfilled, (state, action) => {
        state.resendStatus = 'succeeded';
        state.resendMessage = action.payload.message;
      })
      .addCase(resendCode.rejected, (state, action) => {
        state.resendStatus = 'failed';
        state.resendError = action.payload;
      })
      .addCase(verifyCode.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userType = action.payload.userType;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.resume_url = action.payload.resume_url;
        state.isVerified = true;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userType = action.payload.userType;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.resume_url = action.payload.resume_url;
        state.isVerified = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.userType = action.payload.userType;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.resume_url = action.payload.resume_url;
        state.isVerified = true;
        state.hasInitialized = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setRole, logout, clearResendMessage, initializeAuthSuccess } = authSlice.actions;
export default authSlice.reducer;