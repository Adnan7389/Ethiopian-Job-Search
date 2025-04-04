import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  token: localStorage.getItem('token') || null,
  userType: localStorage.getItem('userType') || null,
  userId: localStorage.getItem('userId') || null,
  isVerified: localStorage.getItem('isVerified') === 'true' || false,
  status: 'idle',
  error: null,
  resendStatus: 'idle',
  resendError: null,
  resendMessage: null,
};

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return { email: userData.email };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const resendCode = createAsyncThunk('auth/resendCode', async (email, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const verifyCode = createAsyncThunk('auth/verifyCode', async ({ email, code }, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/verify-code', { email, code });
    localStorage.setItem('isVerified', 'true');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user_type, userId } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userType', user_type);
    localStorage.setItem('userId', userId);
    localStorage.setItem('isVerified', 'true');
    return { token, userType: user_type, userId };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

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
      state.isVerified = false;
      state.status = 'idle';
      state.error = null;
      state.resendStatus = 'idle';
      state.resendError = null;
      state.resendMessage = null;
    },
    clearResendMessage: (state) => {
      state.resendMessage = null;
      state.resendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(verifyCode.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isVerified = true;
      })
      .addCase(verifyCode.rejected, (state, action) => {
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
        state.isVerified = true;
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

export const { setRole, logout, clearResendMessage } = authSlice.actions;
export default authSlice.reducer;