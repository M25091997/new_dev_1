import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWalletTransactionsData } from '../../../redux/thunk/walletTransactionsThunk';
import { 
  setWalletPage,
  setWalletItemsPerPage,
  setWalletFilters,
  clearWalletFilters,
  clearWalletError
} from '../../../redux/reducer/walletTransactionsReducer';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const WalletTransactions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    transactions, 
    loading, 
    error, 
    pagination, 
    filters,
    summary 
  } = useSelector((state) => state.walletTransactions);
  
  const { token } = useSelector((state) => state.user);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [pagination.currentPage, pagination.itemsPerPage, token]);

  const fetchTransactions = async () => {
    const params = {
      page: pagination.currentPage,
      per_page: pagination.itemsPerPage,
      search: searchTerm || filters.search
    };

    await dispatch(fetchWalletTransactionsData(token, params));
  };

  const handleSearch = () => {
    dispatch(setWalletFilters({ search: searchTerm }));
    dispatch(setWalletPage(1));
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handlePageChange = (page) => {
    dispatch(setWalletPage(page));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    dispatch(setWalletItemsPerPage(itemsPerPage));
  };

  const handleClearError = () => {
    dispatch(clearWalletError());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = `₹${amount.toFixed(2)}`;
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            i === pagination.currentPage
              ? 'bg-blue-600 text-white'
              : 'hover:bg-white text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading wallet transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">Wallet Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">View your wallet transaction history</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 mt-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
        
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate("/wallet/total-balance", { state: { transactions, summary } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.totalBalance.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">₹</span>
            </div>
          </div>
        </div>
        <div 
          onClick={() => navigate("/wallet/this-month", { state: { transactions, summary } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.thisMonthEarnings.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">📅</span>
            </div>
          </div>
        </div>
        <div 
          onClick={() => navigate("/wallet/withdrawn", { state: { transactions, summary } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Withdrawn</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.withdrawnAmount.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Transactions
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="pt-5">
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={handleClearError}
              className="text-red-600 hover:text-red-800 font-semibold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Transaction History</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
              {transactions.length} transactions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Variant
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                      #{transaction.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {transaction.order_id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={transaction.product_name}>
                    {transaction.product_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {transaction.variant_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold ${
                      transaction.status === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {transaction.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {formatDate(transaction.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Show</span>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Total: {pagination.totalRecords}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {renderPagination()}
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTransactions;