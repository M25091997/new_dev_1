import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    itemsPerPage: 10,
  },
  filters: {
    search: '',
    category: '',
    status: '',
  },
  lastFetched: null,
  updatingStock: false,
  updateStockError: null,
};

const stockManagementSlice = createSlice({
  name: 'stockManagement',
  initialState,
  reducers: {
    fetchStockStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStockSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.data || [];
      state.pagination = {
        currentPage: action.payload.current_page || 1,
        totalPages: action.payload.last_page || 0,
        totalRecords: action.payload.total || 0,
        itemsPerPage: action.payload.per_page || 10,
      };
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchStockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStockStart: (state) => {
      state.updatingStock = true;
      state.updateStockError = null;
    },
    updateStockSuccess: (state, action) => {
      state.updatingStock = false;
      // Update the specific product variant in the state
      const { productId, variantId, newStock } = action.payload;
      const productIndex = state.products.findIndex(product => product.id === productId);
      if (productIndex !== -1) {
        const variantIndex = state.products[productIndex].variants?.findIndex(variant => variant.id === variantId);
        if (variantIndex !== -1) {
          state.products[productIndex].variants[variantIndex].stock = newStock;
        }
      }
      state.updateStockError = null;
    },
    updateStockFailure: (state, action) => {
      state.updatingStock = false;
      state.updateStockError = action.payload;
    },
    setStockPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setStockItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setStockFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearStockFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        status: '',
      };
      state.pagination.currentPage = 1;
    },
    clearStockError: (state) => {
      state.error = null;
      state.updateStockError = null;
    },
    clearStockData: (state) => {
      state.products = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        itemsPerPage: 10,
      };
      state.lastFetched = null;
      state.error = null;
      state.updateStockError = null;
    },
  },
});

export const {
  fetchStockStart,
  fetchStockSuccess,
  fetchStockFailure,
  updateStockStart,
  updateStockSuccess,
  updateStockFailure,
  setStockPage,
  setStockItemsPerPage,
  setStockFilters,
  clearStockFilters,
  clearStockError,
  clearStockData,
} = stockManagementSlice.actions;

export default stockManagementSlice.reducer;
