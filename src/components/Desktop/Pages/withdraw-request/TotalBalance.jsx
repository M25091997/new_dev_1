import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const TotalBalance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const withdrawalData = location.state?.withdrawalData;

  if (!withdrawalData) {
    navigate('/withdrawal');
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalWithdrawn = withdrawalData.withdraw_requests
    ?.filter(req => req.status === 1)
    .reduce((sum, req) => sum + req.amount, 0) || 0;

  const pendingAmount = withdrawalData.withdraw_requests
    ?.filter(req => req.status === 0)
    .reduce((sum, req) => sum + req.amount, 0) || 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => navigate('/withdrawal')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-5">Total Balance</h1>
          <p className="text-sm text-gray-500 mt-1">Your available wallet balance</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 text-sm mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold">{formatCurrency(withdrawalData.balance)}</h2>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-green-400">
          <div>
            <p className="text-green-100 text-xs mb-1">Total Withdrawn</p>
            <p className="text-xl font-semibold">{formatCurrency(totalWithdrawn)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs mb-1">Pending Withdrawals</p>
            <p className="text-xl font-semibold">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Approved
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {withdrawalData.withdraw_requests?.filter(req => req.status === 1).length || 0} transactions
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {withdrawalData.withdraw_requests?.filter(req => req.status === 0).length || 0} requests
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Available
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(withdrawalData.balance)}</p>
          <p className="text-xs text-gray-500 mt-2">Ready to withdraw</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Balance Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Your current available balance is <span className="font-semibold">{formatCurrency(withdrawalData.balance)}</span></li>
          <li>• Total amount withdrawn till date: <span className="font-semibold">{formatCurrency(totalWithdrawn)}</span></li>
          <li>• Amount locked in pending requests: <span className="font-semibold">{formatCurrency(pendingAmount)}</span></li>
          <li>• You can create new withdrawal requests from the main withdrawal page</li>
        </ul>
      </div>
    </div>
  );
};

export default TotalBalance;

