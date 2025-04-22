import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Increase timeout to 30 seconds
api.defaults.timeout = 30000;

// Retry logic: Retry the request up to 3 times with a delay
const retry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error; // Last retry failed
      console.warn(`Retry ${i + 1}/${retries} failed:`, error.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await retry(() => api.get("/notifications"));
      const notifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
      return notifications;
    } catch (error) {
      console.error("fetchNotifications error:", error);
      if (error.code === "ECONNABORTED") {
        return rejectWithValue("Request timed out after multiple attempts. Please try again later.");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    notificationStatus: "idle",
    notificationError: null,
  },
  reducers: {
    resetNotificationStatus: (state) => {
      state.notificationStatus = "idle";
      state.notificationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationStatus = "loading";
        state.notificationError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationStatus = "succeeded";
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationStatus = "failed";
        state.notificationError = action.payload;
      });
  },
});

export const { resetNotificationStatus } = notificationSlice.actions;
export default notificationSlice.reducer;