import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
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
  reducers: {},
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

export default notificationSlice.reducer;