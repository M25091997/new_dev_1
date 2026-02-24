import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Star, 
  Trash2,
  RefreshCw,
  Package,
  Tag,
  Shield,
  RotateCcw,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getSellerProduct } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const { showSuccess, showError } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getSellerProduct(token, id);
      
      if (response.status === 1) {
        setProduct(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showError('Error', error.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchProduct();
    }
  }, [token, id]);

  const getStatusBadge = (status) => {
    if (status === 1) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>;
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved === 1) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  };

  const getReturnBadge = (returnStatus) => {
    if (returnStatus === 1) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Allowed</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Not-Allowed</span>;
  };

  const getCancellationBadge = (cancelStatus) => {
    if (cancelStatus === 1) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Allowed</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Not-Allowed</span>;
  };

  const getIndicatorBadge = (indicator) => {
    if (indicator === 0) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Veg</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Non-Veg</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <RefreshCw className="w-6 h-6 animate-spin text-green-500 mr-2" />
            <span className="text-gray-500">Loading product details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Product not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">View Product</h1>
            <p className="text-sm text-gray-500 mt-1">Dashboard / Manage Product / Product Details</p>
          </div>
        </div>
        <button onClick={() => navigate('/products/manage')} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2">
          <Edit className="w-4 h-4" />
          <span>Manage Product</span>
        </button>
      </div>

      {/* Product Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Product Details</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <span className="text-sm text-gray-900 text-right max-w-xs">{product.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Product Id:</span>
                <span className="text-sm text-gray-900">{product.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Tax:</span>
                <span className="text-sm text-gray-900">{product.tax_id || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div>{getStatusBadge(product.status)}</div>
              </div>
              
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Manufacturer:</span>
                <span className="text-sm text-gray-900 text-right max-w-xs">{product.manufacturer || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Is Approved:</span>
                <div>{getApprovalBadge(product.is_approved)}</div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Cancellation:</span>
                <div>{getCancellationBadge(product.cancelable_status)}</div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Other Images:</span>
                <span className="text-sm text-gray-900">{product.other_images || 'N/A'}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Seller:</span>
                <span className="text-sm text-gray-900">{product.seller?.name || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Indicator:</span>
                <div>{getIndicatorBadge(product.indicator)}</div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Made In:</span>
                <span className="text-sm text-gray-900">{product.made_in_country?.name || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Return:</span>
                <div>{getReturnBadge(product.return_status)}</div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Till Status:</span>
                <span className="text-sm text-gray-900">{product.till_status || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-start py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Main Image:</span>
                <div className="mt-1">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="text-sm text-gray-900">{product.category?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Product Description</h3>
          </div>
          <div className="p-6">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      )}

      {/* Product Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Product Variants List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant Id</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Measurement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price(₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price(₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mattress Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PD Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {product.variants.map((variant) => (
                  <React.Fragment key={variant.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.measurement} {variant.unit?.short_code || 'PC'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{variant.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{variant.discounted_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: variant.color }}
                          ></div>
                          <span className="text-sm text-gray-900">{variant.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.size || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.material || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.mattress_size || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.pack || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.pd_type || 'N/A'}
                      </td>
                    </tr>
                    {/* Images Row */}
                    <tr>
                      <td colSpan="13" className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {variant.images && variant.images.length > 0 ? (
                            variant.images.map((image, index) => (
                              <img
                                key={index}
                                src={image.image_url}
                                alt={`${product.name} - Variant ${variant.id} - Image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(image.image_url, '_blank')}
                              />
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">No images available</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProduct;
