import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  requests: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  },
  lastFetched: null,
};

const withdrawalRequestsSlice = createSlice({
  name: 'withdrawalRequests',
  initialState,
  reducers: {
    fetchWithdrawalRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchWithdrawalRequestsSuccess: (state, action) => {
      state.loading = false;
      state.requests = action.payload.data || [];
      state.pagination = {
        currentPage: action.payload.current_page || 1,
        totalPages: action.payload.last_page || 0,
        totalRecords: action.payload.total || 0,
        itemsPerPage: action.payload.per_page || 10,
      };
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchWithdrawalRequestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setWithdrawalPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setWithdrawalItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setWithdrawalFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearWithdrawalFilters: (state) => {
      state.filters = {
        status: '',
        search: '',
        dateFrom: '',
        dateTo: '',
      };
      state.pagination.currentPage = 1;
    },
    clearWithdrawalError: (state) => {
      state.error = null;
    },
    clearWithdrawalData: (state) => {
      state.requests = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        itemsPerPage: 10,
      };
      state.lastFetched = null;
      state.error = null;
    },
    updateWithdrawalRequest: (state, action) => {
      const { requestId, status } = action.payload;
      const requestIndex = state.requests.findIndex(request => request.id === requestId);
      if (requestIndex !== -1) {
        state.requests[requestIndex].status = status;
      }
    },
  },
});

export const {
  fetchWithdrawalRequestsStart,
  fetchWithdrawalRequestsSuccess,
  fetchWithdrawalRequestsFailure,
  setWithdrawalPage,
  setWithdrawalItemsPerPage,
  setWithdrawalFilters,
  clearWithdrawalFilters,
  clearWithdrawalError,
  clearWithdrawalData,
  updateWithdrawalRequest,
} = withdrawalRequestsSlice.actions;

export default withdrawalRequestsSlice.reducer;
