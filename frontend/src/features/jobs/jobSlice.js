import { createSlice } from '@reduxjs/toolkit';

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.status = 'succeeded';
    },
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { setJobs, setLoading, setError } = jobSlice.actions;
export default jobSlice.reducer;