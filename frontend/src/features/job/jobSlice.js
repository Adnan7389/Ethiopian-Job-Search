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
  recommendedJobs: [],
  // recommendedStatus: 'idle',
  // recommendedError: null,
  includeArchived: false,
  status: 'idle',
  error: null,
  job: null,
  applications: {},
  fetchingApplications: [], // Changed from Set to Array
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

export const fetchRecommendedJobs = createAsyncThunk(
  'job/fetchRecommendedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/jobs/recommended');
      
      // Filter out any jobs that don't have required fields
      const validJobs = response.data.filter(job => 
        job && 
        job.job && 
        job.job.job_id && 
        job.job.slug && 
        job.job.status === 'open' && 
        (!job.job.expires_at || new Date(job.job.expires_at) > new Date())
      );

      return validJobs;
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      // Return empty array instead of rejecting to prevent UI errors
      return [];
    }
  }
);

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
  async ({ slug }, { rejectWithValue, getState }) => {
    try {
      const { resume_url } = getState().auth;
      const response = await api.post(`/jobs/${slug}/apply`, { resume_url });
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
  'job/fetchApplicationsByJobId',
  async (jobId, { rejectWithValue }) => {
    try {
      console.log(`Fetching qualified applicants for job ${jobId}`);
      const response = await api.get(`/applicants/qualified/${jobId}`);
      console.log(`Qualified applicants for job ${jobId}:`, response.data);
      return { jobId: String(jobId), applications: response.data.applicants };
    } catch (error) {
      console.error(`Error fetching qualified applicants for job ${jobId}:`, error.response?.data || error.message);
      if (error.response?.status === 401) {
        return rejectWithValue('Your session has expired. Please log in again.');
      }
      if (error.response?.status === 403) {
        console.warn(`Access denied for job ${jobId}. Returning empty applications.`);
        return { jobId: String(jobId), applications: [] };
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
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
    clearApplications: (state) => {
      state.applications = {};
      state.fetchingApplications = []; // Changed to array
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs (Public)
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
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create Job
      .addCase(createJob.pending, (state) => {
        console.log("createJob pending");
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        console.log('createJob fulfilled:', action.payload);
        state.status = 'succeeded';
        state.job = action.payload;
        state.total += 1;
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        console.log('createJob rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create job';
      })
      // fetch RecommendedJ obs
      .addCase(fetchRecommendedJobs.pending, (state) => {
        state.recommendedStatus = 'loading';
        state.recommendedError = null;
      })
      .addCase(fetchRecommendedJobs.fulfilled, (state, action) => {
        state.recommendedStatus = 'succeeded';
        state.recommendedJobs = action.payload;
        state.recommendedError = null;
      })
      .addCase(fetchRecommendedJobs.rejected, (state, action) => {
        state.recommendedStatus = 'failed';
        state.recommendedError = action.payload || 'Failed to load recommended jobs';
        state.recommendedJobs = []; // Clear recommendations on error
      })
      // Fetch Employer Jobs
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.applications = {};
        state.fetchingApplications = []; // Changed to array
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Job by Slug
      .addCase(fetchJobBySlug.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.job = null;
      })
      .addCase(fetchJobBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.job = action.payload;
        state.error = null;
      })
      .addCase(fetchJobBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Apply for Job
      .addCase(applyForJob.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch Applications by Job ID
      .addCase(fetchApplicationsByJobId.pending, (state, action) => {
        state.status = 'loading';
        state.fetchingApplications = [...state.fetchingApplications, String(action.meta.arg)]; // Add to array
        state.error = null;
      })
      .addCase(fetchApplicationsByJobId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.applications[String(action.payload.jobId)] = action.payload.applications;
        console.log(`Updated applications for job ${action.payload.jobId}:`, state.applications[action.payload.jobId]);
        state.fetchingApplications = state.fetchingApplications.filter(id => id !== String(action.meta.arg)); // Remove from array
        state.error = null;
      })
      .addCase(fetchApplicationsByJobId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.fetchingApplications = state.fetchingApplications.filter(id => id !== String(action.meta.arg)); // Remove from array
      })
      // Update Job
      .addCase(updateJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedJob = action.payload.job || action.payload;
        const index = state.jobs.findIndex((job) => job.slug === updatedJob.slug);
        if (index !== -1) {
          state.jobs[index] = updatedJob;
        }
        state.job = updatedJob;
        state.error = null;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete Job (Archive)
      .addCase(deleteJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter((job) => job.job_id !== action.payload.jobId);
        state.total -= 1;
        delete state.applications[String(action.payload.jobId)];
        state.fetchingApplications = state.fetchingApplications.filter(id => id !== String(action.payload.jobId)); // Remove from array
        state.error = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Restore Job
      .addCase(restoreJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter((job) => job.job_id !== action.payload.jobId);
        state.total -= 1;
        delete state.applications[String(action.payload.jobId)];
        state.fetchingApplications = state.fetchingApplications.filter(id => id !== String(action.payload.jobId)); // Remove from array
        state.error = null;
      })
      .addCase(restoreJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Duplicate Job
      .addCase(duplicateJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(duplicateJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(duplicateJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetStatus, setPage, setPageSize, setSearch, setFilters, setIncludeArchived, clearFilters, clearApplications } = jobSlice.actions;
export default jobSlice.reducer;