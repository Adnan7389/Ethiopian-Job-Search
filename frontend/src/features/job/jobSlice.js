import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  jobs: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,
  search: '',
  filters: {
    job_type: '',
    industry: '',
    experience_level: '',
    status: '',
    date_posted: '',
  },
  includeArchived: false,
  status: 'idle',
  error: null,
};

export const createJob = createAsyncThunk('job/createJob', async (jobData, { rejectWithValue }) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchEmployerJobs = createAsyncThunk('job/fetchEmployerJobs', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs/employer', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const fetchJobBySlug = createAsyncThunk('job/fetchJobBySlug', async (slug, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/${slug}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const updateJob = createAsyncThunk('job/updateJob', async ({ jobId, jobData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const deleteJob = createAsyncThunk('job/deleteJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const restoreJob = createAsyncThunk('job/restoreJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/jobs/${jobId}/restore`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const duplicateJob = createAsyncThunk('job/duplicateJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/jobs/${jobId}/duplicate`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page
    },
    setIncludeArchived: (state, action) => {
      state.includeArchived = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    clearFilters: (state) => {
      state.filters = { job_type: '', industry: '', experience_level: '', status: '', date_posted: '' };
      state.search = '';
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchJobBySlug.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobBySlug.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(fetchJobBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter((job) => job.job_id !== action.payload.jobId);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(restoreJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreJob.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(restoreJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(duplicateJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(duplicateJob.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(duplicateJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setPage, setPageSize, setSearch, setFilters, setIncludeArchived, clearFilters } = jobSlice.actions;
export default jobSlice.reducer;