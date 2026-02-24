import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  Image as ImageIcon
} from 'lucide-react';

const TotalRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const withdrawalData = location.state?.withdrawalData;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmount = allRequests.reduce((sum, req) => sum + req.amount, 0);
  const pendingCount = allRequests.filter(req => req.status === 0).length;
  const approvedCount = allRequests.filter(req => req.status === 1).length;

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
          <h1 className="text-xl font-bold text-gray-900 mt-5">All Withdrawal Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Complete history of withdrawal requests</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-2">Total Requests Amount</p>
            <h2 className="text-3xl font-bold">{formatCurrency(totalAmount)}</h2>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <List className="w-8 h-8" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400">
          <div>
            <p className="text-blue-100 text-xs mb-1">Total</p>
            <p className="text-xl font-semibold">{allRequests.length}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Pending</p>
            <p className="text-xl font-semibold">{pendingCount}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs mb-1">Approved</p>
            <p className="text-xl font-semibold">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Search All Requests
            </label>
            <input
              type="text"
              placeholder="Search by name, message, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase">Results</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <List className="w-4 h-4 mr-2 text-blue-600" />
              All Requests
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
              {paginatedData.length} of {filteredData.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Message</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Remark</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Receipt</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((request) => (
                <tr key={request.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                      #{request.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{request.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(request.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={request.message}>{request.message}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold ${
                      request.status === 0
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {request.status === 0 ? 'Pending' : 'Approved'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={request.remark || 'No remark'}>
                    {request.remark || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {request.receipt_image_url ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={request.receipt_image_url}
                          alt="Receipt"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{formatDate(request.created_at)}</td>
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
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Total: {filteredData.length}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-white text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
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

export default TotalRequests;

