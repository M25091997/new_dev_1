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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mt-5">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Manage Products</p>
        </div>
        <button onClick={() => navigate('/products/add')} className="bg-red-500 mt-5 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Products</h2>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Products Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Products by Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="1">Approved</option>
                <option value="0">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowColumnFilter(!showColumnFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Column Filter Popup */}
                {showColumnFilter && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Show/Hide Columns</h3>
                      <div className="space-y-2">
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
                          <label key={column.key} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={visibleColumns[column.key]}
                              onChange={() => handleColumnToggle(column.key)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{column.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                {visibleColumns.id && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                )}
                {visibleColumns.productId && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product ID
                  </th>
                )}
                {visibleColumns.taxId && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax ID
                  </th>
                )}
                {visibleColumns.name && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                )}
                {visibleColumns.image && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                )}
                {visibleColumns.price && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price(₹)
                  </th>
                )}
                {visibleColumns.dPrice && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D.Price
                  </th>
                )}
                {visibleColumns.indicator && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indicator
                  </th>
                )}
                {visibleColumns.isApproved && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Is Approved
                  </th>
                )}
                {visibleColumns.return && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return
                  </th>
                )}
                {visibleColumns.cancellation && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancellation
                  </th>
                )}
                {visibleColumns.tillStatus && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Till Status
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-green-500 mr-2" />
                      <span className="text-gray-500">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-12 text-center">
                    <div className="text-gray-500">No products found</div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    {visibleColumns.id && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.id}
                      </td>
                    )}
                    {visibleColumns.productId && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.product_id}
                      </td>
                    )}
                    {visibleColumns.taxId && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.tax_id || 'N/A'}
                      </td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.name}
                        </div>
                      </td>
                    )}
                    {visibleColumns.image && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
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
                      </td>
                    )}
                    {visibleColumns.price && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.price}
                      </td>
                    )}
                    {visibleColumns.dPrice && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{product.discounted_price}
                      </td>
                    )}
                    {visibleColumns.indicator && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.indicator || 'N/A'}
                      </td>
                    )}
                    {visibleColumns.isApproved && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {product.status === 1 ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.return && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.return_status === 1 ? 'Yes' : 'No'}
                      </td>
                    )}
                    {visibleColumns.cancellation && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.cancelable_status === 1 ? 'Yes' : 'No'}
                      </td>
                    )}
                    {visibleColumns.tillStatus && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.till_status || 'N/A'}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* View Product */}
                          <div className="relative group">
                            <button
                              onClick={() => navigate(`/products/view/${product.id}`)}
                              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-900 p-2 rounded-md cursor-pointer transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                              View Product
                            </span>
                          </div>

                          {/* Edit Product */}
                          <div className="relative group">
                            <button
                              onClick={() => navigate(`/products/edit/${product.id}`)}
                              className="bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-900 p-2 rounded-md cursor-pointer transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                              Edit Product
                            </span>
                          </div>

                          {/* View Ratings */}
                          <div className="relative group">
                            <button
                              onClick={() => navigate(`/products/ratings?product=${product.id}&name=${encodeURIComponent(product.name)}`)}
                              className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-900 p-2 rounded-md cursor-pointer transition-colors duration-200"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                              View Ratings
                            </span>
                          </div>

                          {/* Duplicate */}
                          <div className="relative group">
                            <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-900 p-2 rounded-md cursor-pointer transition-colors duration-200">
                              <Copy className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                              Clone Product
                            </span>
                          </div>

                          {/* Delete */}
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-900 p-2 rounded-md cursor-pointer transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
                              Delete
                            </span>
                          </div>
                        </div>

                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Per page</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Total Records: {totalRecords}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <span className="px-3 py-1 text-sm bg-red-500 text-white rounded">
                {currentPage}
              </span>
              {Array.from({ length: Math.min(3, totalPages - currentPage) }, (_, i) => (
                <button
                  key={currentPage + i + 1}
                  onClick={() => setCurrentPage(currentPage + i + 1)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {currentPage + i + 1}
                </button>
              ))}
              {totalPages > currentPage + 3 && <span className="px-2">...</span>}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
