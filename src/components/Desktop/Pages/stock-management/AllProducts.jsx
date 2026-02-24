import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const AllProducts = () => {
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

  const getStatusBadge = (stock, pvStatus) => {
    if (pvStatus === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-700">
          Sold Out
        </span>
      );
    }

    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-700">
          Sold Out
        </span>
      );
    }

    if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-orange-100 text-orange-700">
          Low Stock
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-green-100 text-green-700">
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/stock')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 mt-5">All Products</h1>
            <p className="text-sm text-gray-500 mt-1 mb-3">Complete product inventory</p>
          </div>
        </div>
        <div className="bg-blue-100 px-4 py-2 rounded-lg mt-5">
          <p className="text-xs text-blue-600 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-blue-700">{products.length}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Search Products
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-[10px] text-gray-500 uppercase">Results</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2 text-gray-600" />
              All Product Variants
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
              {filteredData.length} variants
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
                  Image
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Variant
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((variant) => (
                <tr key={variant.product_variant_id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                      #{variant.product_variant_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={variant.image_url}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 max-w-xs">
                      <div className="truncate" title={variant.name}>
                        {variant.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{variant.measurement}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                      {variant.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{variant.stock}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(variant.stock, variant.pv_status)}
                  </td>
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
                  const value = e.target.value;
                  setItemsPerPage(value === 'all' ? 'all' : Number(value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>

            {itemsPerPage === 'all' ? (
              <div className="text-xs text-gray-600">
                Showing all {filteredData.length} items
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
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

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-1 text-xs text-gray-500">...</span>
                )}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
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
  );
};

export default AllProducts;

