import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload.data || [];
      state.pagination = {
        currentPage: action.payload.current_page || 1,
        totalPages: action.payload.last_page || 0,
        totalRecords: action.payload.total || 0,
        itemsPerPage: action.payload.per_page || 10,
      };
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setOrdersPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setOrdersItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setOrdersFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearOrdersFilters: (state) => {
      state.filters = {
        status: '',
        search: '',
        dateFrom: '',
        dateTo: '',
      };
      state.pagination.currentPage = 1;
    },
    clearOrdersError: (state) => {
      state.error = null;
    },
    clearOrdersData: (state) => {
      state.orders = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        itemsPerPage: 10,
      };
      state.lastFetched = null;
      state.error = null;
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
      }
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setOrdersPage,
  setOrdersItemsPerPage,
  setOrdersFilters,
  clearOrdersFilters,
  clearOrdersError,
  clearOrdersData,
  updateOrderStatus,
} = ordersSlice.actions;

export default ordersSlice.reducer;
