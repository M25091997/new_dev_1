import React, { useState, useEffect } from 'react';
import { Building2, Store, Globe, FileText, CheckCircle, Shield, Loader2, AlertCircle, Phone } from 'lucide-react';
import { getSellerCategories, getSellerCommission, createGstVerificationTask, getGstVerificationTask } from '../../../../api/api.js';

const Step2BusinessInfo = ({ formData, setFormData, errors, setErrors }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [commissionData, setCommissionData] = useState([]);
  const [commissionLoading, setCommissionLoading] = useState(true);
  
  // GST Verification states
  const [gstVerificationLoading, setGstVerificationLoading] = useState(false);
  const [gstVerificationStatus, setGstVerificationStatus] = useState('idle'); // idle, verifying, completed, failed
  const [gstVerificationData, setGstVerificationData] = useState(null);
  const [gstVerificationError, setGstVerificationError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchCommission();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getSellerCategories();
      if (response.status === 1) {
        setCategories(response.data);
      } else {
        console.error('Categories API returned error:', response.message);
        // Set fallback categories if API fails
        setCategories([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Fashion' },
          { id: 3, name: 'Home & Garden' },
          { id: 4, name: 'Sports' },
          { id: 5, name: 'Books' },
          { id: 6, name: 'Health & Beauty' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set fallback categories if API fails
      setCategories([
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Fashion' },
        { id: 3, name: 'Home & Garden' },
        { id: 4, name: 'Sports' },
        { id: 5, name: 'Books' },
        { id: 6, name: 'Health & Beauty' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchCommission = async () => {
    try {
      setCommissionLoading(true);
      
      // Use default Jamshedpur coordinates for initial commission calculation
      const defaultLat = 22.8045665;
      const defaultLng = 86.2028754;
      
      // Calculate commission based on default location (Jamshedpur)
      const distance = calculateDistance(defaultLat, defaultLng, 22.8045665, 86.2028754);
      const commission = distance <= 30 ? '2' : '5';
      
      console.log('Initial commission calculation:', commission + '%');
      
      // Create commission data object
      const commissionData = {
        id: 193,
        variable: 'seller_commission',
        value: commission
      };
      
      setCommissionData(commissionData);
      
      // Update form data with the calculated commission value
      setFormData(prev => ({
        ...prev,
        commission: commission
      }));
      
    } catch (error) {
      console.error('Error calculating initial commission:', error);
      // Keep default commission value on error
    } finally {
      setCommissionLoading(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // GST Verification functions
  const handleGstVerification = async () => {
    if (!formData.gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin)) {
      setGstVerificationError('Please enter a valid GSTIN');
      return;
    }

    try {
      setGstVerificationLoading(true);
      setGstVerificationStatus('verifying');
      setGstVerificationError(null);

      // Step 1: Create GST verification task
      console.log('Creating GST verification task for:', formData.gstin);
      const createResponse = await createGstVerificationTask(formData.gstin);
      
      if (createResponse.status === 'success' && createResponse.data.request_id) {
        const requestId = createResponse.data.request_id;
        console.log('GST verification task created with request ID:', requestId);

        // Step 2: Poll for verification result (call get task twice as mentioned)
        let attempts = 0;
        const maxAttempts = 20; // Maximum 20 attempts (10 seconds total)
        
        const pollForResult = async () => {
          try {
            const getResponse = await getGstVerificationTask(requestId);
            console.log('GST verification task result:', getResponse);

            if (getResponse.status === 'success' && Array.isArray(getResponse.data) && getResponse.data.length > 0) {
              const taskData = getResponse.data[0];
              
              if (taskData.status === 'completed' && taskData.result && taskData.result.source_output) {
                const gstData = taskData.result.source_output;
                
                // Update form data with verified GST information
                setFormData(prev => ({
                  ...prev,
                  verifiedGstDetails: {
                    legalName: gstData.legal_name || '',
                    tradeName: gstData.trade_name || '',
                    address: gstData.principal_place_of_business_fields?.principal_place_of_business_address || {},
                    gstin: gstData.gstin || '',
                    status: gstData.gstin_status || '',
                    constitutionOfBusiness: gstData.constitution_of_business || '',
                    dateOfRegistration: gstData.date_of_registration || ''
                  }
                }));

                setGstVerificationData(gstData);
                setGstVerificationStatus('completed');
                setGstVerificationLoading(false);
                return;
              } else if (taskData.status === 'in_progress') {
                // Still processing, continue polling
                attempts++;
                if (attempts < maxAttempts) {
                  setTimeout(pollForResult, 500); // Poll every 500ms
                } else {
                  throw new Error('GST verification is taking longer than expected. Please try again.');
                }
              } else {
                throw new Error('GST verification failed. Please check your GSTIN and try again.');
              }
            } else {
              throw new Error('Invalid response from GST verification service.');
            }
          } catch (error) {
            console.error('Error polling GST verification result:', error);
            throw error;
          }
        };

        // Start polling
        await pollForResult();

      } else {
        throw new Error('Failed to create GST verification task.');
      }

    } catch (error) {
      console.error('GST verification error:', error);
      setGstVerificationError(error.message || 'Failed to verify GST. Please try again.');
      setGstVerificationStatus('failed');
      setGstVerificationLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset GST verification status when GSTIN changes
    if (name === 'gstin') {
      setGstVerificationStatus('idle');
      setGstVerificationData(null);
      setGstVerificationError(null);
    }

    // Reset Aadhaar verification status when Aadhaar number changes
    if (name === 'aadharNumber') {
      setAadhaarVerificationStatus('idle');
      setAadhaarVerificationData(null);
      setAadhaarVerificationError(null);
      setAadhaarOTP('');
      
      // Clear verification data from form data
      setFormData(prev => ({
        ...prev,
        aadhaarVerificationStatus: 'idle',
        aadhaarVerificationData: null,
        aadhaarReferenceId: null,
        verifiedAadhaarDetails: null
      }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!formData.storeUrl.trim()) {
      newErrors.storeUrl = 'Store URL is required';
    }
    
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }
    
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhaar number must be 12 digits';
    }
    
    if (!formData.type) {
      newErrors.type = 'Business type is required';
    }
    
    if (formData.type === 'GST') {
      if (!formData.gstin.trim()) {
        newErrors.gstin = 'GSTIN is required for GST businesses';
      } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin)) {
        newErrors.gstin = 'Invalid GSTIN format';
      }
    } else if (formData.type === 'Non-GST') {
      if (!formData.enrollmentNumber.trim()) {
        newErrors.enrollmentNumber = 'Enrollment number is required for Non-GST businesses';
      }
    }
    
    if (!formData.commission) {
      newErrors.commission = 'Commission rate is required';
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Store className="w-4 h-4 inline mr-2" />
            Store Name *
          </label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.storeName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your store name"
          />
          {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
        </div>

        {/* Store URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Store URL *
          </label>
          <input
            type="text"
            name="storeUrl"
            value={formData.storeUrl}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.storeUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your store URL"
          />
          {errors.storeUrl && <p className="text-red-500 text-sm mt-1">{errors.storeUrl}</p>}
        </div>

        {/* PAN Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            PAN Number *
          </label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.panNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your PAN number"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
        </div>

        {/* Aadhaar Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Aadhaar Number *
          </label>
          <input
            type="text"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
              if (value.length <= 12) {
                handleInputChange({ target: { name: 'aadharNumber', value } });
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.aadharNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength="12"
          />
          {errors.aadharNumber && <p className="text-red-500 text-sm mt-1">{errors.aadharNumber}</p>}
          {formData.aadharNumber && formData.aadharNumber.length === 12 && !errors.aadharNumber && (
            <p className="text-green-600 text-sm mt-1 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Valid Aadhaar number format
            </p>
          )}
        </div>
      </div>

      {/* Categories Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Building2 className="w-4 h-4 inline mr-2" />
          Business Categories *
        </label>
        {categoriesLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.categories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  {formData.categories.includes(category.id) ? (
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2"></div>
                  )}
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
      </div>

      {/* GST Information */}
      <div>
        <label className="block text-sm font-medium text-purple-700 mb-2">
          Business Type *
        </label>
        <div className="flex space-x-4 mb-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="GST"
              checked={formData.type === 'GST'}
              onChange={handleInputChange}
              className="mr-2 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">GST</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="Non-GST"
              checked={formData.type === 'Non-GST'}
              onChange={handleInputChange}
              className="mr-2 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Non-GST</span>
          </label>
        </div>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
      </div>

      {formData.type === 'GST' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN *
          </label>
          <div className="flex space-x-2">
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleInputChange}
              className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.gstin ? 'border-red-500' : 'border-gray-300'
              } ${gstVerificationStatus === 'completed' ? 'bg-green-50 border-green-300' : ''}`}
            placeholder="Enter GSTIN (15 characters)"
            maxLength={15}
              disabled={gstVerificationStatus === 'completed'}
              style={{ textTransform: 'uppercase' }}
            />
            {gstVerificationStatus !== 'completed' && (
              <button
                type="button"
                onClick={handleGstVerification}
                disabled={gstVerificationLoading || !formData.gstin}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                  gstVerificationLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {gstVerificationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            )}
            {gstVerificationStatus === 'completed' && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
                {/* <button
                  type="button"
                  onClick={() => {
                    setGstVerificationStatus('idle');
                    setGstVerificationData(null);
                    setGstVerificationError(null);
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button> */}
              </div>
            )}
          </div>
          {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>}
          {gstVerificationError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-800 text-sm">{gstVerificationError}</p>
              </div>
            </div>
          )}
          
          {/* Display verified GST information */}
          {gstVerificationStatus === 'completed' && gstVerificationData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified GST Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Trade Name:</span>
                  <p className="text-gray-900">{gstVerificationData.trade_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Legal Name:</span>
                  <p className="text-gray-900">{gstVerificationData.legal_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    gstVerificationData.gstin_status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {gstVerificationData.gstin_status || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Constitution:</span>
                  <p className="text-gray-900">{gstVerificationData.constitution_of_business || 'N/A'}</p>
                </div>
                {gstVerificationData.principal_place_of_business_fields?.principal_place_of_business_address && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Business Address:</span>
                    <p className="text-gray-900">
                      {[
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.building_name,
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.door_number,
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.street,
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.dst,
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.state_name,
                        gstVerificationData.principal_place_of_business_fields.principal_place_of_business_address.pincode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Enrollment Number / UIN *
          </label>
          <input
            type="text"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.enrollmentNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter Enrollment Number"
          />
          {errors.enrollmentNumber && <p className="text-red-500 text-sm mt-1">{errors.enrollmentNumber}</p>}
        </div>
      )}

      {/* Commission Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission Rate *
        </label>
        <input
          type="number"
          name="commission"
          value={formData.commission}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          readOnly
        />
        {commissionLoading ? (
          <div className="mt-1">
            <p className="text-xs text-gray-500">Loading commission...</p>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400 mr-1"></div>
              <span>Updating commission for your location</span>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-blue-600 mt-1">Commission is automatically set by the system</p>
            {commissionData && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-xs text-blue-800">
                  <span className="font-medium">Current Commission Rate: </span>
                  <span className="ml-1 font-bold text-sm">{commissionData.value}%</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {commissionData.value === '2'
                    ? 'Within 30km of Jamshedpur - Standard Commission'
                    : 'Beyond 30km of Jamshedpur - Extended Commission'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Commission is calculated based on your business location
                </p>
              </div>
            )}
          </>
        )}
        {errors.commission && <p className="text-red-500 text-sm mt-1">{errors.commission}</p>}
      </div>


      {/* Validation function for parent component */}
      <div style={{ display: 'none' }}>
        {validateStep && (window.validateStep2 = validateStep)}
      </div>
    </div>
  );
};

export default Step2BusinessInfo;
