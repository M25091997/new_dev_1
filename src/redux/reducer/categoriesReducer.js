import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  selectedCategories: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    itemsPerPage: 10,
  },
  lastFetched: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchCategoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action) => {
      state.loading = false;
      state.categories = action.payload.data || action.payload || [];
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchCategoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSelectedCategoriesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSelectedCategoriesSuccess: (state, action) => {
      state.loading = false;
      state.selectedCategories = action.payload.data || action.payload || [];
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchSelectedCategoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCategoriesPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setCategoriesItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    updateSelectedCategories: (state, action) => {
      state.selectedCategories = action.payload;
    },
    clearCategoriesError: (state) => {
      state.error = null;
    },
    clearCategoriesData: (state) => {
      state.categories = [];
      state.selectedCategories = [];
      state.lastFetched = null;
      state.error = null;
    },
  },
});

export const {
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchSelectedCategoriesStart,
  fetchSelectedCategoriesSuccess,
  fetchSelectedCategoriesFailure,
  setCategoriesPage,
  setCategoriesItemsPerPage,
  updateSelectedCategories,
  clearCategoriesError,
  clearCategoriesData,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
