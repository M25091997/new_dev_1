import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Search } from 'lucide-react';

const WithdrawnTransaction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { transactions = [], summary = {} } = location.state || {};

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      navigate('/wallet');
    }
  }, [transactions, navigate]);

  if (!transactions || transactions.length === 0) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
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
    const formattedAmount = formatCurrency(amount);
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  // Filter only debit (withdrawn) transactions
  const withdrawnTransactions = transactions.filter(transaction => transaction.type === 'debit');

  const filteredTransactions = withdrawnTransactions.filter(transaction =>
    (transaction.product_name && transaction.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transaction.order_id && transaction.order_id.toString().includes(searchTerm)) ||
    (transaction.id && transaction.id.toString().includes(searchTerm))
  );

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2.5 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/wallet')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Withdrawn</h1>
            <p className="text-xs text-gray-500">{withdrawnTransactions.length} transactions</p>
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2 pb-2">
        {/* Balance Card */}
        <div className="bg-white rounded-lg p-3.5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Total Withdrawn</p>
              <h2 className="text-2xl font-bold text-purple-600">{formatCurrency(summary.withdrawnAmount)}</h2>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Balance</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(summary.totalBalance)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Transactions</p>
              <p className="text-sm font-semibold text-gray-900">{withdrawnTransactions.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">This Month</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(summary.thisMonthEarnings)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1.5">{filteredTransactions.length} result(s) found</p>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pb-2">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                      #{transaction.id}
                    </span>
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-700">
                      Debit
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate pr-2" title={transaction.product_name || 'N/A'}>
                    {transaction.product_name || 'N/A'}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">
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
          
          {filteredTransactions.length === 0 && (
            <div className="bg-white rounded-lg p-6 text-center">
              <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No withdrawn transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawnTransaction;

