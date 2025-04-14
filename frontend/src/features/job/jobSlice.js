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
  job: null, // For createJob response
};

export const fetchJobs = createAsyncThunk('job/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const createJob = createAsyncThunk('job/createJob', async (jobData, { rejectWithValue }) => {
  try {
    console.log("Sending createJob request with data:", jobData);
    const response = await api.post('/jobs', jobData);
    console.log("createJob response:", response.data);
    return response.data;
  } catch (error) {
    console.error("createJob failed:", error.response?.data || error.message);
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
    const response = await api.put(`/jobs/${jobId}/archive`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const restoreJob = createAsyncThunk('job/restoreJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${jobId}/restore`);
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
    resetStatus: (state) => {
      state.status = 'idle';
      state.error = null;
      state.job = null;
    },
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
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createJob.pending, (state) => {
        console.log("createJob pending");
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        console.log('createJob fulfilled:', action.payload);
        state.status = 'succeeded';
        state.job = action.payload;
      })
      .addCase(createJob.rejected, (state, action) => {
        console.log('createJob rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload?.error || 'Failed to create job';
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

export const { resetStatus, setPage, setPageSize, setSearch, setFilters, setIncludeArchived, clearFilters } = jobSlice.actions;
export default jobSlice.reducer;