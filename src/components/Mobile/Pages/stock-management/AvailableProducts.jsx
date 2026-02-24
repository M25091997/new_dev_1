import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AvailableProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (location.state?.products) {
      setProducts(location.state.products);
    } else {
      // If no state, redirect back to stock management
      navigate('/stock');
    }
  }, [location.state, navigate]);

  const getStatusBadge = (stock) => {
    if (stock <= 5) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Low Stock
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Available
      </span>
    );
  };

  const filteredData = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.measurement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = itemsPerPage === 'all' 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <button
            onClick={() => navigate('/stock')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Available Products</h1>
            <p className="text-xs text-gray-500">Products currently in stock</p>
          </div>
          <div className="bg-green-100 px-3 py-2 rounded-lg text-center">
            <p className="text-xs font-bold text-green-700">{products.length}</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-2">
            Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {paginatedData.map((variant) => (
          <div key={variant.product_variant_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start space-x-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                <img
                  src={variant.image_url}
                  alt={variant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                    #{variant.product_variant_id}
                  </span>
                  {getStatusBadge(variant.stock)}
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  {variant.name}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{variant.measurement}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium capitalize">
                    {variant.type}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="text-sm font-semibold text-gray-900">{variant.stock}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex justify-center mb-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-700">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const value = e.target.value;
                setItemsPerPage(value === 'all' ? 'all' : Number(value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {itemsPerPage === 'all' ? (
          <div className="text-center text-xs text-gray-700">
            Showing all {filteredData.length} items
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-gray-700">Total: {filteredData.length}</span>
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
                        ? 'bg-green-500 text-white border-green-500'
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
  );
};

export default AvailableProducts;

