import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getAllActiveProducts, getCustomerRatings } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';

const ProductRating = () => {
  const { token } = useSelector((state) => state.user);
  const { showError } = useToast();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Fetch active products
  const fetchActiveProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllActiveProducts(token);
      
      if (response.status === 1) {
        setProducts(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedProduct(response.data[0].id.toString());
        }
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

  // Fetch customer ratings for selected product
  const fetchRatings = async (productId) => {
    try {
      setLoading(true);
      const response = await getCustomerRatings(productId);
      
      if (response.status === 1) {
        const ratingsData = response.data;
        const ratingsList = ratingsData.rating_list || [];
        
        // Transform the API response to match our component structure
        const transformedRatings = ratingsList.map(rating => ({
          id: rating.id,
          user: rating.user?.name || 'Anonymous',
          rate: rating.rate,
          review: rating.review,
          image: rating.images && rating.images.length > 0 ? rating.images[0] : null,
          date: new Date(rating.updated_at).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }),
          userProfile: rating.user?.profile || null
        }));

        setRatings(transformedRatings);
        setTotalRatings(ratingsData.rating_list?.length || 0);
        setAverageRating(ratingsData.average_rating || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      showError('Error', error.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActiveProducts();
    }
  }, [token]);

  useEffect(() => {
    if (selectedProduct) {
      fetchRatings(selectedProduct);
    }
  }, [selectedProduct]);

  // Handle URL parameters for product selection
  useEffect(() => {
    const productId = searchParams.get('product');
    const productName = searchParams.get('name');
    
    if (productId && products.length > 0) {
      setSelectedProduct(productId);
    }
  }, [searchParams, products]);

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    if (selectedProduct) {
      fetchRatings(selectedProduct);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredRatings = ratings.filter(rating =>
    rating.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRatings.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedRatings = filteredRatings.slice(startIndex, startIndex + perPage);

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-800">Product Ratings</h1>
        <p className="text-xs text-gray-500">Dashboard / Product Ratings</p>
      </div>

      {/* Product Selection and Search */}
      <div className="bg-white p-3 border-b border-gray-200">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-red-600 mb-2">Products</label>
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-red-600 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search ratings..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleRefresh}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center">
              <RefreshCw className="w-6 h-6 animate-spin text-red-500 mr-2" />
              <span className="text-gray-500">Loading ratings...</span>
            </div>
          </div>
        ) : paginatedRatings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No ratings found</div>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {paginatedRatings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                {/* User Info and Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {rating.userProfile && (
                      <img
                        src={rating.userProfile}
                        alt={rating.user}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-900 leading-tight">
                        {rating.user || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500">ID: {rating.id}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 text-right">
                    {rating.date}
                  </span>
                </div>
                
                {/* Star Rating */}
                <div className="mb-2">
                  {renderStars(rating.rate)}
                </div>
                
                {/* Review Text */}
                <div className="mb-2">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {rating.review}
                  </p>
                </div>

                {/* Rating Image */}
                {rating.image && (
                  <div className="mt-2">
                    <img
                      src={rating.image}
                      alt="Rating"
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination and Summary */}
        <div className="px-3 py-3 border-t border-gray-200">
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
              Total Ratings: {totalRatings}, Average Rating: {averageRating.toFixed(2)}
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
    </div>
  );
};

export default ProductRating;
