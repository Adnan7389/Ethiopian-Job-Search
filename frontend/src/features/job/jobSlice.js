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
  job: null,
  applications: {},
};

export const fetchJobs = createAsyncThunk('job/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
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
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchEmployerJobs = createAsyncThunk('job/fetchEmployerJobs', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs/employer', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchJobBySlug = createAsyncThunk('job/fetchJobBySlug', async (slug, { rejectWithValue }) => {
  try {
    const response = await api.get(`/jobs/${slug}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const applyForJob = createAsyncThunk(
  "job/applyForJob",
  async ({ slug }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/jobs/${slug}/apply`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.message === "Token has expired") {
        return rejectWithValue("Your session has expired. Please log in again.");
      }
      const message = error.response?.data?.message || "Application failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

export const fetchApplicationsByJobId = createAsyncThunk(
  "job/fetchApplicationsByJobId",
  async (jobId, { rejectWithValue }) => {
    try {
      console.log(`Fetching applicants for job ${jobId}`);
      const response = await api.get(`/applicants/${jobId}/applicants`); // Updated route
      console.log(`Applicants for job ${jobId}:`, response.data);
      return { jobId, applications: response.data };
    } catch (error) {
      console.error(`Error fetching applicants for job ${jobId}:`, error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue("Your session has expired. Please log in again.");
      }
      if (error.response?.status === 403) {
        console.warn(`Access denied for job ${jobId}. Returning empty applications.`);
        return { jobId, applications: [] };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch applications");
    }
  }
);

export const updateJob = createAsyncThunk('job/updateJob', async ({ slug, jobData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${slug}`, jobData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteJob = createAsyncThunk('job/deleteJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${jobId}/archive`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const restoreJob = createAsyncThunk('job/restoreJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${jobId}/restore`);
    return { jobId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const duplicateJob = createAsyncThunk('job/duplicateJob', async (jobId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/jobs/${jobId}/duplicate`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
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
      state.currentPage = 1;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setIncludeArchived: (state, action) => {
      state.includeArchived = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = { job_type: '', industry: '', experience_level: '', status: '', date_posted: '' };
      state.search = '';
      state.currentPage = 1;
      state.includeArchived = false;
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
        state.error = action.payload?.message || 'Failed to create job';
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
      .addCase(fetchJobBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.job = action.payload;
      })
      .addCase(fetchJobBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(applyForJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchApplicationsByJobId.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchApplicationsByJobId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.applications[action.payload.jobId] = action.payload.applications;
      })
      .addCase(fetchApplicationsByJobId.rejected, (state, action) => {
        state.status = "failed";
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