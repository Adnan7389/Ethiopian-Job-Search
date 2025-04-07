import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  profile: null,
  status: 'idle',
  error: null,
  uploadStatus: 'idle',
  uploadError: null,
  isApproved: null
};

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/profile');
    console.log("fetchProfile result:", response);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateProfile = createAsyncThunk('profile/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const uploadResume = createAsyncThunk('profile/uploadResume', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const uploadProfilePicture = createAsyncThunk('profile/uploadProfilePicture', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/profile/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.uploadStatus = 'idle';
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        console.log("fetchProfile response:", action.payload);
        state.status = 'succeeded';
        state.profile = action.payload;
        state.isApproved = action.payload.isApproved;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = { ...state.profile, ...action.meta.arg }; // Update profile with new data
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Upload Resume
      .addCase(uploadResume.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.profile.resume_url = action.payload.resume_url;
        state.uploadError = null;
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.payload;
      })
      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.profile.profile_picture_url = action.payload.profile_picture_url;
        state.uploadError = null;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.payload;
      });
  },
});

export const { resetProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;