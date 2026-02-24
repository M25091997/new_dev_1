import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
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
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  },
  summary: {
    totalBalance: 0,
    thisMonthEarnings: 0,
    pendingAmount: 0,
    withdrawnAmount: 0,
  },
  lastFetched: null,
};

const walletTransactionsSlice = createSlice({
  name: 'walletTransactions',
  initialState,
  reducers: {
    fetchWalletTransactionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchWalletTransactionsSuccess: (state, action) => {
      state.loading = false;
      state.transactions = action.payload.data || [];
      state.pagination = {
        ...state.pagination, // Keep the existing itemsPerPage
        currentPage: action.payload.current_page || 1,
        totalPages: action.payload.last_page || 0,
        totalRecords: action.payload.total || 0,
        // Don't overwrite itemsPerPage from API response
      };
      
      // Calculate summary statistics
      const transactions = action.payload.data || [];
      state.summary.totalBalance = transactions.reduce((sum, transaction) => {
        return transaction.type === 'credit' ? sum + transaction.amount : sum - transaction.amount;
      }, 0);
      
      state.summary.thisMonthEarnings = transactions
        .filter(transaction => {
          const transactionDate = new Date(transaction.created_at);
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear && 
                 transaction.type === 'credit';
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      state.summary.pendingAmount = transactions
        .filter(transaction => transaction.status !== 1)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      state.summary.withdrawnAmount = transactions
        .filter(transaction => transaction.type === 'debit' && transaction.status === 1)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
      
      state.lastFetched = new Date().toISOString();
      state.error = null;
    },
    fetchWalletTransactionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setWalletPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setWalletItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setWalletFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    clearWalletFilters: (state) => {
      state.filters = {
        search: '',
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
      };
      state.pagination.currentPage = 1;
    },
    clearWalletError: (state) => {
      state.error = null;
    },
    clearWalletData: (state) => {
      state.transactions = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        itemsPerPage: 10,
      };
      state.summary = {
        totalBalance: 0,
        thisMonthEarnings: 0,
        pendingAmount: 0,
        withdrawnAmount: 0,
      };
      state.lastFetched = null;
      state.error = null;
    },
  },
});

export const {
  fetchWalletTransactionsStart,
  fetchWalletTransactionsSuccess,
  fetchWalletTransactionsFailure,
  setWalletPage,
  setWalletItemsPerPage,
  setWalletFilters,
  clearWalletFilters,
  clearWalletError,
  clearWalletData,
} = walletTransactionsSlice.actions;

export default walletTransactionsSlice.reducer;