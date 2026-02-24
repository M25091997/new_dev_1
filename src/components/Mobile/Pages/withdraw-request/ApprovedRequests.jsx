import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';

const ApprovedRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const withdrawalData = location.state?.withdrawalData;

  const [searchTerm, setSearchTerm] = useState('');

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

  const approvedRequests = withdrawalData.withdraw_requests?.filter(req => req.status === 1) || [];

  const filteredData = approvedRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.amount.toString().includes(searchTerm)
  );

  const totalApprovedAmount = approvedRequests.reduce((sum, req) => sum + req.amount, 0);

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
            <h1 className="text-base font-semibold text-gray-900">Approved Requests</h1>
            <p className="text-xs text-gray-500">{approvedRequests.length} requests</p>
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2.5">
        {/* Summary Card */}
        <div className="bg-white rounded-lg p-3.5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Approved</p>
                <h2 className="text-xl font-bold text-gray-900">{formatCurrency(totalApprovedAmount)}</h2>
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {approvedRequests.length}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1.5">{filteredData.length} result(s) found</p>
          )}
        </div>

        {/* Requests List */}
        <div className="space-y-2">
          {filteredData.map((request) => (
            <div key={request.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  #{request.id}
                </span>
                <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">Name • {request.type}</p>
                    <p className="text-sm font-medium text-gray-900">{request.name}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(request.amount)}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Message</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{request.message}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="bg-white rounded-lg p-6 text-center">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No approved requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedRequests;
