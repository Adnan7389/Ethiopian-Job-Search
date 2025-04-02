import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setJobs, setLoading, setError } from './jobSlice';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (filters = {}, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading());
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query.append(key, value);
      }
    });

    const url = query.toString() ? `/jobs/search?${query.toString()}` : '/jobs';
    const response = await api.get(url);
    dispatch(setJobs(response.data));
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.error || error.message));
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createJob = createAsyncThunk('jobs/createJob', async (data, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.post('/jobs', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ jobId, data }, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (jobId, { dispatch, rejectWithValue }) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});