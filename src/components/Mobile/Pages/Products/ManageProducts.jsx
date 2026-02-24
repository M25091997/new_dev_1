import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy
} from 'lucide-react';
import { getAllProducts, deleteProduct } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const ManageProducts = () => {
  const { user, token } = useSelector((state) => state.user);
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    productId: true,
    taxId: false,
    name: true,
    image: true,
    price: true,
    dPrice: true,
    indicator: false,
    isApproved: false,
    return: false,
    cancellation: false,
    tillStatus: false,
    actions: true
  });
  const filterRef = useRef(null);

  const navigate = useNavigate();

  // Fetch products data
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getAllProducts(
        token,
        selectedCategory,
        user?.seller?.id || user?.id,
        selectedStatus,
        currentPage,
        perPage,
        searchTerm
      );

      if (response.status === 1) {
        setProducts(response.data.products || []);
        setCategories(response.data.categories || []);
        setTotalRecords(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Error', error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchProducts();
    }
  }, [token, user, currentPage, perPage, selectedCategory, selectedStatus, searchTerm]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowColumnFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement search logic here
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear all filters and search terms
      setSearchTerm('');
      setSelectedCategory('');
      setSelectedStatus('');
      setCurrentPage(1);
      
      // Fetch fresh data from API with cleared filters
      const response = await getAllProducts(
        token,
        '', // Clear category filter
        user?.seller?.id || user?.id,
        '', // Clear status filter
        1, // Reset to page 1
        perPage,
        '' // Clear search term
      );

      if (response.status === 1) {
        setProducts(response.data.products || []);
        setCategories(response.data.categories || []);
        setTotalRecords(response.total || 0);
        showSuccess('Refreshed', 'Product list has been refreshed and all filters cleared');
      } else {
        throw new Error(response.message || 'Failed to refresh products');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      showError('Error', error.message || 'Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteProduct(token, productToDelete.product_variant_id);

      if (response.status === 1) {
        showSuccess('Success', response.message || 'Product deleted successfully!');

        // Immediately remove the product from the list for instant feedback
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
        setTotalRecords(prev => prev - 1);

        setShowDeleteModal(false);
        setProductToDelete(null);

        // Refresh the products list to sync with server
        await fetchProducts();
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Error', error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const totalPages = Math.ceil(totalRecords / perPage);

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-800">Manage Products</h1>
          <button onClick={() => navigate('/products/add')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
        <p className="text-xs text-gray-500">Dashboard / Manage Products</p>
      </div>

      {/* Products Section */}
      <div className="bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Products</h2>           
          </div>

          {/* Filters */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Products Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter Products by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">Select Status</option>
                <option value="1">Approved</option>
                <option value="0">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowColumnFilter(!showColumnFilter)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Column Filter Popup */}
                {showColumnFilter && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm max-h-96">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-700">Hide Columns</h3>
                          <button
                            onClick={() => setShowColumnFilter(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {[
                            { key: 'id', label: 'ID' },
                            { key: 'productId', label: 'Product ID' },
                            { key: 'taxId', label: 'Tax ID' },
                            { key: 'name', label: 'Name' },
                            { key: 'image', label: 'Image' },
                            { key: 'price', label: 'Price' },
                            { key: 'dPrice', label: 'D.Price' },
                            { key: 'indicator', label: 'Indicator' },
                            { key: 'isApproved', label: 'Is Approved' },
                            { key: 'return', label: 'Return' },
                            { key: 'cancellation', label: 'Cancellation' },
                            { key: 'tillStatus', label: 'Till Status' },
                            { key: 'actions', label: 'Actions' }
                          ].map((column) => (
                            <label key={column.key} className="flex items-center space-x-3 cursor-pointer py-2">
                              <input
                                type="checkbox"
                                checked={visibleColumns[column.key]}
                                onChange={() => handleColumnToggle(column.key)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">{column.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center">
                <RefreshCw className="w-6 h-6 animate-spin text-green-500 mr-2" />
                <span className="text-gray-500">Loading products...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No products found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    {visibleColumns.image && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={`https://seller.bringmart.in/storage/${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {visibleColumns.name && (
                        <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                          {product.name}
                        </h3>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                        {visibleColumns.id && <span>ID: {product.id}</span>}
                        {visibleColumns.id && visibleColumns.productId && <span>•</span>}
                        {visibleColumns.productId && <span>PID: {product.product_variant_id}</span>}
                        {visibleColumns.taxId && (
                          <>
                            {visibleColumns.id && <span>•</span>}
                            <span>Tax: {product.tax_id || 'N/A'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {visibleColumns.price && (
                      <div>
                        <p className="text-xs text-gray-600">Price</p>
                        <p className="font-medium text-gray-900 text-sm">₹{product.price}</p>
                      </div>
                    )}
                    {visibleColumns.dPrice && (
                      <div>
                        <p className="text-xs text-gray-600">Discounted Price</p>
                        <p className="font-medium text-gray-900 text-sm">₹{product.discounted_price}</p>
                      </div>
                    )}
                    {visibleColumns.indicator && (
                      <div>
                        <p className="text-xs text-gray-600">Indicator</p>
                        <p className="font-medium text-gray-900 text-sm">{product.indicator || 'N/A'}</p>
                      </div>
                    )}
                    {visibleColumns.isApproved && (
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {product.status === 1 ? 'Approved' : 'Pending'}
                        </p>
                      </div>
                    )}
                    {visibleColumns.return && (
                      <div>
                        <p className="text-xs text-gray-600">Return</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {product.return_status === 1 ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                    {visibleColumns.cancellation && (
                      <div>
                        <p className="text-xs text-gray-600">Cancellation</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {product.cancelable_status === 1 ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}
                    {visibleColumns.tillStatus && (
                      <div>
                        <p className="text-xs text-gray-600">Till Status</p>
                        <p className="font-medium text-gray-900 text-sm">{product.till_status || 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg md:bg-transparent md:p-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {product.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock || 0} {product.stock_unit || 'PC'}
                      </span>
                    </div>
                    {visibleColumns.actions && (
                      <div className="flex items-center space-x-1">
                        {/* View Button */}
                        <button
                          onClick={() => navigate(`/products/view/${product.id}`)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="View product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                         {/* View Ratings Button */}
                         <button
                           onClick={() => navigate(`/products/ratings?product=${product.id}&name=${encodeURIComponent(product.name)}`)}
                           className="text-yellow-600 hover:text-yellow-900 p-1"
                           title="View product ratings"
                         >
                           <Star className="w-4 h-4" />
                         </button>

                        {/* Copy Button */}
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Copy product details"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-700">Per page</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="text-xs text-gray-700">
              Total Records: {totalRecords}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="px-3 py-1 text-xs bg-red-500 text-white rounded">
              {currentPage}
            </span>
            {Array.from({ length: Math.min(2, totalPages - currentPage) }, (_, i) => (
              <button
                key={currentPage + i + 1}
                onClick={() => setCurrentPage(currentPage + i + 1)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                {currentPage + i + 1}
              </button>
            ))}
            {totalPages > currentPage + 2 && <span className="px-1">...</span>}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
