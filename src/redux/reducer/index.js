import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userReducer';
import dashboardReducer from './dashboardReducer';
import ordersReducer from './ordersReducer';
import categoriesReducer from './categoriesReducer';
import stockManagementReducer from './stockManagementReducer';
import withdrawalRequestsReducer from './withdrawalRequestsReducer';
import walletTransactionsReducer from './walletTransactionsReducer';

const rootReducer = combineReducers({
  user: userReducer,
  dashboard: dashboardReducer,
  orders: ordersReducer,
  categories: categoriesReducer,
  stockManagement: stockManagementReducer,
  withdrawalRequests: withdrawalRequestsReducer,
  walletTransactions: walletTransactionsReducer,
});

export default rootReducer;
