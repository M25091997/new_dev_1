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
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getSellerPacketProducts, deleteProduct, changeProductAvailabilityStatus } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';
import ConfirmationModal from '../../Modal/ConfirmationModal';

const SoldOutProducts = () => {
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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

      const response = await getSellerPacketProducts(token, '', 'sold_out');

      if (response.status === 1) {
        setProducts(response.data?.products || []);
        setTotalItems(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch sold out products');
      }
    } catch (error) {
      console.error('Sold Out Products fetch error:', error);
      showError('Sold Out Products Error', error.message || 'Failed to load sold out products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handleViewClick = (product) => {
    if (product.id) {
      navigate(`/products/view/${product.id}`);
    } else {
      showError('Error', 'Product ID not found');
    }
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

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;

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
          className="px-2 py-1 text-sm border border-gray-300 rounded-l-md hover:bg-gray-50 text-gray-700"
        >
          ←
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 text-sm border border-gray-300 hover:bg-gray-50 ${i === currentPage
            ? 'bg-red-500 text-white border-red-500'
            : 'text-gray-700'
            }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-r-md hover:bg-gray-50 text-gray-700"
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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const getReturnPolicyBadge = (returnStatus) => {
    if (returnStatus === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Allowed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not-Allowed
        </span>
      );
    }
  };

  const getCancellationPolicyBadge = (cancelStatus) => {
    if (cancelStatus === 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Allowed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not-Allowed
        </span>
      );
    }
  };

  const getAvailabilityToggle = (product) => {
    const currentStatus = product.status;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAvailabilityToggle(product);
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${currentStatus === 1 ? 'bg-red-500' : 'bg-gray-200'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentStatus === 1 ? 'translate-x-6' : 'translate-x-1'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Sold Out Products</h1>
          <p className="text-sm text-gray-500">{totalItems} products</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
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
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.product_variant_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Product Header */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {product.product_variant_id}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{product.price}</p>
                    <p className="text-xs text-gray-500">D.Price: ₹{product.discounted_price}</p>
                  </div>
                  <button
                    onClick={() => toggleProductExpansion(product.product_variant_id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {expandedProduct === product.product_variant_id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Stock: {product.is_unlimited_stock ? 'Unlimited' : product.stock}
                  </span>
                  <span>•</span>
                  <span>{product.measurement} {product.short_code}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getAvailabilityToggle(product)}
                  {getStatusBadge(product.status, product.is_approved)}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedProduct === product.product_variant_id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Product ID:</span>
                    <p className="text-gray-600">{product.product_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tax ID:</span>
                    <p className="text-gray-600">{product.tax_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Seller:</span>
                    <p className="text-gray-600">{product.seller_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Measurement:</span>
                    <p className="text-gray-600">{product.measurement} {product.short_code}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Return Policy:</span>
                    <div className="mt-1">{getReturnPolicyBadge(product.return_status)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cancellation:</span>
                    <div className="mt-1">{getCancellationPolicyBadge(product.cancelable_status)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Indicator:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                      None
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Till Status:</span>
                    <p className="text-gray-600">{product.till_status_name || '-'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleViewClick(product)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleViewClick(product)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Per page</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="flex items-center space-x-1">
            {renderPagination()}
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
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

export default SoldOutProducts;

