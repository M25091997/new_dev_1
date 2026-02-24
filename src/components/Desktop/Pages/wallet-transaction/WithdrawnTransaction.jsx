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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={() => navigate('/wallet')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Withdrawn Transactions</h1>
          <p className="text-sm text-gray-500">All debit transactions</p>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase mb-2">Total Withdrawn</p>
            <h2 className="text-4xl font-bold text-purple-600">{formatCurrency(summary.withdrawnAmount)}</h2>
          </div>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingDown className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Balance</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(summary.totalBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Withdrawn Transactions</p>
            <p className="text-lg font-semibold text-gray-900">{withdrawnTransactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">This Month</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(summary.thisMonthEarnings)}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-2">{filteredTransactions.length} result(s) found</p>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Withdrawn Transactions</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
              {filteredTransactions.length} transactions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Order</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Variant</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                      #{transaction.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {transaction.order_id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={transaction.product_name || 'N/A'}>
                    {transaction.product_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {transaction.variant_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-700">
                      Debit
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {formatDate(transaction.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No withdrawn transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawnTransaction;

