import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchDashboardFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.data = null;
      state.lastFetched = null;
      state.error = null;
    },
  },
});

export const {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  clearDashboardError,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
