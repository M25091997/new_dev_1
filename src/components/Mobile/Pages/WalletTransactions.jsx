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
import { Wallet, Calendar, TrendingDown, RefreshCw } from 'lucide-react';

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
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = `₹${amount.toFixed(2)}`;
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
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
          className={`px-2.5 py-1 text-xs rounded ${
            i === pagination.currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
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
      <div className="bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-3 py-2.5">
          <h1 className="text-base font-semibold text-gray-900">Wallet Transactions</h1>
        </div>
        <div className="p-4">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2.5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Wallet Transactions</h1>
            <p className="text-xs text-gray-500">{transactions.length} transactions</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className="w-4.5 h-4.5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-2.5 space-y-2 pb-2">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div 
            onClick={() => navigate("/wallet/total-balance", { state: { transactions, summary } })}
            className="bg-white rounded-lg p-3 border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-4.5 h-4.5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 text-center mb-0.5">Total Balance</p>
            <p className="text-sm font-bold text-gray-900 text-center">₹{summary.totalBalance.toFixed(2)}</p>
          </div>
          <div 
            onClick={() => navigate("/wallet/this-month", { state: { transactions, summary } })}
            className="bg-white rounded-lg p-3 border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 text-center mb-0.5">This Month</p>
            <p className="text-sm font-bold text-gray-900 text-center">₹{summary.thisMonthEarnings.toFixed(2)}</p>
          </div>
          <div 
            onClick={() => navigate("/wallet/withdrawn", { state: { transactions, summary } })}
            className="bg-white rounded-lg p-3 border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingDown className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 text-center mb-0.5">Withdrawn</p>
            <p className="text-sm font-bold text-gray-900 text-center">₹{summary.withdrawnAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
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

        {/* Transactions List */}
        <div className="space-y-2 pb-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                      #{transaction.id}
                    </span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      transaction.type === 'credit' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate pr-2" title={transaction.product_name || 'N/A'}>
                    {transaction.product_name || 'N/A'}
                  </p>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 gap-2">
                <div className="text-xs text-gray-500 truncate flex-1 min-w-0">
                  <span className="truncate">Order: {transaction.order_id || 'N/A'}</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">{transaction.variant_name || 'N/A'}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600">Show</span>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total: {pagination.totalRecords}</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                ‹
              </button>
              {renderPagination()}
              <button
                onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-2 py-1 text-xs border border-gray-200 rounded disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTransactions;
