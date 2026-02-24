import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { getSellerPacketProducts, deleteProduct, changeProductAvailabilityStatus } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';
import ConfirmationModal from '../../Modal/ConfirmationModal';

const LooseProducts = () => {
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await getSellerPacketProducts(token, '', 'loose_products');

      if (response.status === 1) {
        setProducts(response.data?.products || []);
        setTotalItems(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch loose products');
      }
    } catch (error) {
      console.error('Loose Products fetch error:', error);
      showError('Loose Products Error', error.message || 'Failed to load loose products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Clear all filters and search terms
      setSearchTerm('');
      setSortField('');
      setSortDirection('asc');
      setCurrentPage(1);
      
      // Fetch fresh data from API
      const response = await getSellerPacketProducts(token, '', 'loose_products');

      if (response.status === 1) {
        setProducts(response.data?.products || []);
        setTotalItems(response.total || 0);
        showSuccess('Refreshed', 'Loose products list has been refreshed and all filters cleared');
      } else {
        throw new Error(response.message || 'Failed to refresh loose products');
      }
    } catch (error) {
      console.error('Loose Products refresh error:', error);
      showError('Error', error.message || 'Failed to refresh loose products');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const value = e.target.value;
    setItemsPerPage(value === 'all' ? 'all' : parseInt(value));
    setCurrentPage(1);
  };

  const handleViewClick = (product) => {
    if (product.id) {
      navigate(`/products/view/${product.id}`);
    } else {
      showError('Error', 'Product ID not found');
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleAvailabilityToggle = async (product) => {
    try {
      // Optimistically update UI for immediate feedback
      const updatedProducts = products.map(p =>
        p.id === product.id
          ? { ...p, status: p.status === 1 ? 0 : 1 }
          : p
      );
      setProducts(updatedProducts);

      // Call API to change availability status - FIXED: Use correct product ID
      const productIdToSend = product.id || product.product_id || product.product_variant_id;

      if (!productIdToSend) {
        throw new Error('Product ID not found');
      }

      const response = await changeProductAvailabilityStatus(token, productIdToSend);

      if (response.status === 1) {
        showSuccess('Success', response.message || 'Product availability updated successfully');
        // Fetch fresh data from server
        await fetchProducts(true);
      } else {
        // Revert on failure
        setProducts(products);
        throw new Error(response.message || 'Failed to update product availability');
      }
    } catch (error) {
      // Revert on error
      setProducts(products);
      console.error('Availability toggle error:', error);
      showError('Error', error.message || 'Failed to update product availability');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!productToDelete) {
        showError('Error', 'No product selected for deletion');
        return;
      }

      const response = await deleteProduct(token, productToDelete.product_variant_id);
      
      if (response.status === 1) {
        showSuccess('Success', 'Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      showError('Delete Error', error.message || 'Failed to delete product');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.product_id && product.product_id.toString().toLowerCase().includes(searchLower)) ||
      (product.product_variant_id && product.product_variant_id.toString().toLowerCase().includes(searchLower)) ||
      (product.seller_name && product.seller_name.toLowerCase().includes(searchLower)) ||
      (product.price && product.price.toString().includes(searchLower)) ||
      (product.discounted_price && product.discounted_price.toString().includes(searchLower))
    );
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string values
    aValue = String(aValue || '').toLowerCase();
    bValue = String(bValue || '').toLowerCase();
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Paginate sorted products
  const paginatedProducts = itemsPerPage === 'all' 
    ? sortedProducts 
    : sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  const totalItemsFiltered = filteredProducts.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItemsFiltered / itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 text-gray-700"
        >
          ←
        </button>
      );
    }

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 ${
            i === currentPage
              ? 'bg-red-500 text-white border-red-500'
              : 'text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-r-md hover:bg-gray-50 text-gray-700"
        >
          →
        </button>
      );
    }

    return pages;
  };

  const getStatusBadge = (status, isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const getReturnPolicyBadge = (returnStatus) => {
    if (returnStatus === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Allowed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not-Allowed
        </span>
      );
    }
  };

  const getCancellationPolicyBadge = (cancelStatus) => {
    if (cancelStatus === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Allowed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not-Allowed
        </span>
      );
    }
  };

  const getAvailabilityToggle = (status) => {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAvailabilityToggle(product);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
          status === 1 ? 'bg-red-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            status === 1 ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Loose Products</h1>
          <span className="text-xs text-gray-500">
            {searchTerm.trim() 
              ? `(${totalItemsFiltered} of ${totalItems} products)` 
              : `(${totalItems} products)`
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {itemsPerPage === 'all' ? (
            <span>Showing all {totalItemsFiltered} {totalItemsFiltered !== totalItems ? `of ${totalItems} ` : ''}products</span>
          ) : (
            <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItemsFiltered)} of {totalItemsFiltered} products</span>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'product_variant_id', label: 'ID', sortable: true },
                  { key: 'product_id', label: 'Product ID', sortable: true },
                  { key: 'tax_id', label: 'Tax ID', sortable: false },
                  { key: 'seller_name', label: 'Seller Name', sortable: true },
                  { key: 'name', label: 'Name', sortable: true },
                  { key: 'image', label: 'Image', sortable: false },
                  { key: 'price', label: 'Price', sortable: true },
                  { key: 'discounted_price', label: 'D.Price', sortable: true },
                  { key: 'measurement', label: 'Measurement', sortable: true },
                  { key: 'stock', label: 'Stock', sortable: true },
                  { key: 'status', label: 'Availability', sortable: true },
                  { key: 'indicator', label: 'Indicator', sortable: false },
                  { key: 'is_approved', label: 'Is Approved?', sortable: true },
                  { key: 'return_status', label: 'Return', sortable: false },
                  { key: 'cancelable_status', label: 'Cancellation', sortable: false },
                  { key: 'till_status', label: 'Till Status', sortable: false },
                  { key: 'actions', label: 'Actions', sortable: false }
                ].map((column) => (
                  <th
                    key={column.key}
                    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{column.label}</span>
                      {column.sortable && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr key={product.product_variant_id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.product_variant_id}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.product_id}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.tax_id}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.seller_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                    <div className="truncate" title={product.name}>
                      {product.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    ₹{product.price}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    ₹{product.discounted_price}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.measurement} {product.short_code}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                    {product.is_unlimited_stock ? 'Unlimited' : product.stock}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getAvailabilityToggle(product, product.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      None
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(product.status, product.is_approved)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getReturnPolicyBadge(product.return_status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getCancellationPolicyBadge(product.cancelable_status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                    {product.till_status_name || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleViewClick(product)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="View product"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleViewClick(product)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit product"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete product"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-700">Per page</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-1 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
          </div>
          {itemsPerPage === 'all' ? (
            <div className="text-xs text-gray-600">
              Showing all {totalItemsFiltered} items
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default LooseProducts;
