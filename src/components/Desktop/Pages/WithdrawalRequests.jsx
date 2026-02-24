import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Wallet,
  Image as ImageIcon
} from 'lucide-react';
import { getSellerWithdrawalRequests } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import CreateWithdrawalRequestModal from '../Modal/CreateWithdrawalRequestModal';

const WithdrawalRequests = () => {
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const { token } = useSelector((state) => state.user);

  const fetchWithdrawalRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = {
        status: statusFilter
      };

      const response = await getSellerWithdrawalRequests(token, params);

      if (response.status === 1) {
        setWithdrawalData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch withdrawal requests');
      }
    } catch (error) {
      console.error('Withdrawal requests fetch error:', error);
      showError('Withdrawal Error', error.message || 'Failed to load withdrawal requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Approved
      </span>
    );
  };

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
      second: '2-digit',
      hour12: true
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    if (value === 'all') {
      setItemsPerPage('all');
    } else {
      setItemsPerPage(Number(value));
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    if (token) {
      fetchWithdrawalRequests();
    }
  }, [token, statusFilter]);

  // Filter data based on search term
  const filteredData = withdrawalData ? withdrawalData.withdraw_requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.amount.toString().includes(searchTerm)
  ) : [];

  // Calculate paginated data
  const paginatedData = itemsPerPage === 'all'
    ? filteredData
    : filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  // Calculate total pages
  const totalPages = itemsPerPage === 'all'
    ? 1
    : Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">Withdrawal Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your withdrawal requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors mt-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate("/withdrawal/total-balance", { state: { withdrawalData } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(withdrawalData?.balance || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div
          onClick={() => navigate("/withdrawal/pending-requests", { state: { withdrawalData } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{withdrawalData?.withdraw_requests?.filter(req => req.status === 0).length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">⏳</span>
            </div>
          </div>
        </div>
        <div
          onClick={() => navigate("/withdrawal/approved-requests", { state: { withdrawalData } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{withdrawalData?.withdraw_requests?.filter(req => req.status === 1).length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">✓</span>
            </div>
          </div>
        </div>
        <div
          onClick={() => navigate("/withdrawal/total-requests", { state: { withdrawalData } })}
          className="bg-white cursor-pointer rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{withdrawalData?.withdraw_requests?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Approved</option>
              <option value="2">Rejected</option>
            </select>
          </div>

          {/* Search Filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Search
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => fetchWithdrawalRequests(true)}
                disabled={refreshing}
                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Withdrawal Requests</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
              {paginatedData.length} of {filteredData.length}
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
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Remark
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Receipt
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((request) => (
                  <tr key={request.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                        #{request.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {request.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={request.message}>
                      {request.message}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold ${request.status === 0
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
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                      {formatDate(request.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                    No withdrawal requests found
                  </td>
                </tr>
              )}
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
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Total: {filteredData.length}</span>

              {/* Only show pagination controls if not showing all items and there are multiple pages */}
              {itemsPerPage !== 'all' && totalPages > 1 && (
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
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${pageNum === currentPage
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Withdrawal Request Modal */}
      <CreateWithdrawalRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        balance={withdrawalData?.balance || 0}
        onSuccess={() => {
          fetchWithdrawalRequests(true);
        }}
      />
    </div>
  );
};

export default WithdrawalRequests;