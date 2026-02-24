import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Clock, CheckCircle } from 'lucide-react';

const TotalRequests = () => {
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

  const allRequests = withdrawalData.withdraw_requests || [];

  const filteredData = allRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.amount.toString().includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    if (status === 0) {
      return (
        <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
          Pending
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
        Approved
      </span>
    );
  };

  const totalPending = allRequests.filter(req => req.status === 0).length;
  const totalApproved = allRequests.filter(req => req.status === 1).length;
  const totalAmount = allRequests.reduce((sum, req) => sum + req.amount, 0);

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
            <h1 className="text-base font-semibold text-gray-900">All Requests</h1>
            <p className="text-xs text-gray-500">{allRequests.length} total requests</p>
          </div>
        </div>
      </div>

      <div className="p-2.5 space-y-2.5">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base font-bold text-gray-900">{allRequests.length}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <Clock className="w-4.5 h-4.5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-base font-bold text-gray-900">{totalPending}</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="w-4.5 h-4.5 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-base font-bold text-gray-900">{totalApproved}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search all requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                  #{request.id}
                </span>
                <div className="flex items-center space-x-1.5">
                  {getStatusBadge(request.status)}
                  <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
                </div>
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
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalRequests;
