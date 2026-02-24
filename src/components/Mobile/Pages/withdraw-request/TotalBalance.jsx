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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2.5 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/withdrawal')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Total Balance</h1>
            <p className="text-xs text-gray-500">Available wallet balance</p>
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2.5">
        {/* Main Balance Card */}
        <div className="bg-white rounded-lg p-3.5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Available Balance</p>
              <h2 className="text-2xl font-bold text-green-600">{formatCurrency(withdrawalData.balance)}</h2>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Withdrawn</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Pending</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Withdrawn</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(totalWithdrawn)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {withdrawalData.withdraw_requests?.filter(req => req.status === 1).length || 0} transactions
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Approved
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4.5 h-4.5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending Amount</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(pendingAmount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {withdrawalData.withdraw_requests?.filter(req => req.status === 0).length || 0} requests
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4.5 h-4.5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrency(withdrawalData.balance)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Ready to withdraw</p>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white border border-gray-100 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Balance Summary</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(withdrawalData.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Withdrawn:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalWithdrawn)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalBalance;

