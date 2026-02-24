import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Search, 
  Plus,
  ChevronLeft,
  ChevronRight,
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

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    if (value === 'all') {
      setItemsPerPage('all');
    } else {
      setItemsPerPage(Number(value));
    }
    setCurrentPage(1);
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
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h1 className="text-lg font-bold text-gray-800 mb-3">Manage Withdraw Request</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            onClick={() => navigate("/withdrawal/total-balance", { state: { withdrawalData } })}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Total Balance</h3>
            <p className="text-sm font-bold text-green-600">{formatCurrency(withdrawalData?.balance || 0)}</p>
          </div>
          <div 
            onClick={() => navigate("/withdrawal/pending-requests", { state: { withdrawalData } })}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Pending Requests</h3>
            <p className="text-sm font-bold text-blue-600">{withdrawalData?.withdraw_requests?.filter(req => req.status === 0).length || 0}</p>
          </div>
          <div 
            onClick={() => navigate("/withdrawal/approved-requests", { state: { withdrawalData } })}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Approved</h3>
            <p className="text-sm font-bold text-purple-600">{withdrawalData?.withdraw_requests?.filter(req => req.status === 1).length || 0}</p>
          </div>
          <div 
            onClick={() => navigate("/withdrawal/total-requests", { state: { withdrawalData } })}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Total Requests</h3>
            <p className="text-sm font-bold text-orange-600">{withdrawalData?.withdraw_requests?.length || 0}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="space-y-3">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
              >
                <option value="">Select Status</option>
                <option value="0">Pending</option>
                <option value="1">Approved</option>
                <option value="2">Rejected</option>
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">
                Search
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={() => fetchWithdrawalRequests(true)}
                  disabled={refreshing}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Create Withdraw Request Button */}
            <div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Create Withdraw Request</span>
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawal Request Cards */}
        <div className="space-y-3">
          {paginatedData.length > 0 ? (
            paginatedData.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-xs">#{request.id}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{request.message}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={request.name}>
                      {request.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {request.status === 0 ? 'Pending' : 'Approved'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(request.amount)}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(request.created_at)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span>Type: {request.type}</span>
                    {request.remark && (
                      <>
                        <span className="mx-1">•</span>
                        <span>Remark: {request.remark}</span>
                      </>
                    )}
                  </div>
                  {request.receipt_image_url && (
                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={request.receipt_image_url}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No withdrawal requests found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          
          {/* Only show pagination controls if not showing all items and there are multiple pages */}
          {itemsPerPage !== 'all' && totalPages > 1 && (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-gray-700">Total Records: {filteredData.length}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 1) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs border rounded ${
                        pageNum === currentPage
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  »
                </button>
              </div>
            </div>
          )}
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