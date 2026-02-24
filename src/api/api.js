import API_ENDPOINTS from './apiEndPointCollection.js';

// Get API base URL from environment variables with fallbacks
const BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://seller.bringmart.in'
const SUB_URL = import.meta.env.VITE_APP_API_SUBURL || '/api/seller'

// Complete API URL
const API_URL = `${BASE_URL}${SUB_URL}`;
console.log('Final API URL:', API_URL);

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  console.log('Making API Request:', {
    API_URL: API_URL,
    endpoint: endpoint,
    finalURL: url
  });
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  // For form data, remove Content-Type header to let browser set it with boundary
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Parse the response JSON
    const responseData = await response.json().catch(() => ({}));
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Seller Registration API
export const registerSeller = async (formData) => {
  try {
    // Create FormData object for multipart/form-data
    const registrationData = new FormData();
    
    // Basic Information
    registrationData.append('name', formData.userName || '');
    registrationData.append('email', formData.email || '');
    registrationData.append('mobile', formData.mobile || '');
    registrationData.append('password', formData.password || '');
    registrationData.append('confirm_password', formData.confirmPassword || '');
    registrationData.append('store_name', formData.storeName || '');
    registrationData.append('store_url', formData.storeUrl || '');
    registrationData.append('store_description', formData.storeDescription || '');
    
    // Categories (assuming it's a comma-separated string of IDs)
    registrationData.append('categories_ids', formData.categories || '');
    
    // Document Numbers
    registrationData.append('pan_number', formData.panNumber || '');
    registrationData.append('aadharNumber', formData.aadharNumber || '');
    registrationData.append('fssai_lic_no', formData.fssaiNumber || '');
    
    // GST Information
    registrationData.append('gsttype', formData.type?.toLowerCase() || 'non-gst');
    registrationData.append('isgstverified', formData.type === 'GST' ? 'true' : 'false');
    registrationData.append('gstin', formData.gstin || '');
    registrationData.append('enrollmentNumber', formData.enrollmentNumber || '');
    
    // Location Information
    registrationData.append('latitude', formData.latitude || '');
    registrationData.append('longitude', formData.longitude || '');
    registrationData.append('street', formData.street || '');
    registrationData.append('state', formData.state || '');
    registrationData.append('place_name', formData.placeName || '');
    registrationData.append('formatted_address', formData.formattedAddress || '');
    
    // Commission
    registrationData.append('commission', formData.commission || '2');
    
    // Bank Account Details
    registrationData.append('bank_name', formData.bankName || '');
    registrationData.append('bank_account_no', formData.accountNumber || '');
    registrationData.append('bank_ifsc_code', formData.ifscCode || '');
    registrationData.append('bank_account_name', formData.bankAccountName || '');
    
    // Bank Verification Details (if available)
    if (formData.isBankVerified !== undefined) {
      registrationData.append('isBankVerified', formData.isBankVerified);
    }
    if (formData.bankVerificationDetails) {
      registrationData.append('bankVerificationDetails', JSON.stringify(formData.bankVerificationDetails));
    }
    
    // File Uploads
    if (formData.profileImage) {
      registrationData.append('profile_image', formData.profileImage);
    }
    if (formData.storeImage) {
      registrationData.append('store_logo', formData.storeImage);
    }
    if (formData.aadharCardFront) {
      registrationData.append('national_id_card', formData.aadharCardFront);
    }
    if (formData.aadharCardBack) {
      registrationData.append('address_proof', formData.aadharCardBack);
    }
    if (formData.panCard) {
      registrationData.append('pan_card', formData.panCard);
    }
    if (formData.fssaiCertificate) {
      registrationData.append('fssai_certificate', formData.fssaiCertificate);
    }
    
    // Verified GST Details (JSON string)
    const verifiedGstDetails = {
      activeStatus: '',
      leagleName: '',
      trade_name: '',
      address: {}
    };
    registrationData.append('verified_gst_details', JSON.stringify(verifiedGstDetails));
    
    const response = await apiRequest(API_ENDPOINTS.SELLER_REGISTER, {
      method: 'POST',
      body: registrationData,
    });
    
    return response;
  } catch (error) {
    console.error('Seller Registration Error:', error);
    
    // If it's a validation error from the backend, throw it as is
    if (error.message && error.message !== 'An error occurred') {
      throw error;
    }
    
    // For other errors, provide a generic message
    throw new Error('Registration failed. Please try again.');
  }
};

// Seller Login API
export const loginSeller = async (credentials) => {
  try {
    const loginData = {
      email: credentials.email,
      password: credentials.password,
      type: 3 // Seller type as per API specification
    };
    
    const loginUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_LOGIN}`;
    
    console.log('Login Request Details:', {
      url: loginUrl,
      payload: loginData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Login Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Login failed');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Store token and user data if login is successful
    if (responseData.data && responseData.data.access_token) {
      localStorage.setItem('sellerToken', responseData.data.access_token);
      localStorage.setItem('sellerData', JSON.stringify(responseData.data.user));
    }
    
    return responseData;
  } catch (error) {
    console.error('Seller Login Error:', error);
    
    // If it's a validation error from the backend, throw it as is
    if (error.message && error.message !== 'An error occurred') {
      throw error;
    }
    
    // For other errors, provide a generic message
    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

// Get Seller Profile API
export const getSellerProfile = async (sellerId, token) => {
  try {
    // Construct the full URL with seller ID
    const profileEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_PROFILE}${sellerId}`;
    
    console.log('Get Seller Profile Request:', {
      endpoint: profileEndpoint,
      sellerId: sellerId,
      token: token ? 'Present' : 'Missing'
    });
    
    const response = await fetch(profileEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Get Seller Profile Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch profile');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Profile Error:', error);
    throw error;
  }
};

// Create GST Verification Task
export const createGstVerificationTask = async (gstNumber) => {
  try {
    // GST verification endpoints use different URL structure: BASE_URL + /api + endpoint
    const gstApiUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_GST_VERIFICATION_CREATE_TASK}`;
    
    const response = await fetch(gstApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ gst_number: gstNumber }),
    });
    
    const responseData = await response.json();
    
    console.log('Create GST Verification Task Response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle the new response format
    if (responseData.status === 'success' && responseData.data && responseData.data.request_id) {
      return responseData;
    } else {
      throw new Error(responseData.message || 'Failed to create GST verification task');
    }
    
    return responseData;
  } catch (error) {
    console.error('Create GST Verification Task Error:', error);
    throw error;
  }
};

// Get GST Verification Task Result
export const getGstVerificationTask = async (requestId) => {
  try {
    // GST verification endpoints use different URL structure: BASE_URL + /api + endpoint
    const gstApiUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_GST_VERIFICATION_GET_TASK}`;
    
    const response = await fetch(gstApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ request_id: requestId }),
    });
    
    const responseData = await response.json();
    
    console.log('Get GST Verification Task Response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle the new response format
    if (responseData.status === 'success' && Array.isArray(responseData.data)) {
      return responseData;
    } else {
      throw new Error(responseData.message || 'Failed to get GST verification task result');
    }
    
    return responseData;
  } catch (error) {
    console.error('Get GST Verification Task Error:', error);
    throw error;
  }
};

// Get Seller Commission
export const getSellerCommission = async () => {
  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_COMMISSION, {
      method: 'GET',
    });
    
    return response;
  } catch (error) {
    console.error('Get Seller Commission Error:', error);
    throw error;
  }
};

// Get Seller Dashboard Data
export const getSellerDashboard = async (token) => {
  try {
    const response = await apiRequest(API_ENDPOINTS.SELLER_DASHBOARD, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Get Seller Dashboard Error:', error);
    throw error;
  }
};

// Get Seller Orders Data
export const getSellerOrders = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_ORDERS}?${queryString}` : API_ENDPOINTS.SELLER_ORDERS;

    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Get Seller Orders Error:', error);
    throw error;
  }
};

// Get Seller Categories Data (Public - for registration)
export const getSellerCategories = async (params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_CATEGORY}?${queryString}` : API_ENDPOINTS.SELLER_CATEGORY;

    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Get Seller Categories Error:', error);
    throw error;
  }
};

// Get Seller Categories for Product Creation (with seller_id parameter)
export const getSellerCategoriesForProduct = async (sellerId, token) => {
  try {
    // Use the correct base URL for this endpoint (without /api/seller prefix)
    const BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://seller.bringmart.in';
    const endpoint = `${API_ENDPOINTS.SELLER_CATEGORIES_FOR_PRODUCT}?seller_id=${sellerId}`;
    const url = `${BASE_URL}/api${endpoint}`;

    console.log('Making Seller Categories API Request:', {
      BASE_URL: BASE_URL,
      endpoint: endpoint,
      finalURL: url,
      sellerId: sellerId
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text(); // Get as text since it's HTML
    console.log('Seller Categories Response:', data);
    
    return data;
  } catch (error) {
    console.error('Get Seller Categories for Product Error:', error);
    throw error;
  }
};

// Get Seller Categories Data (Authenticated - for logged in users)
export const getSellerCategoriesAuth = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_CATEGORIES}?${queryString}` : API_ENDPOINTS.SELLER_CATEGORIES;

    const response = await apiRequest(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error('Get Seller Categories Error:', error);
    throw error;
  }
};

// Get Order Statuses Data
export const getOrderStatuses = async (token) => {
  try {
    const orderStatusEndpoint = `${BASE_URL}/api${API_ENDPOINTS.ORDER_STATUS}`;
    const response = await fetch(orderStatusEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Order Statuses Error:', error);
    throw error;
  }
};

// Get Stock Management Data
export const getStockManagement = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const stockEndpoint = `${BASE_URL}/api${API_ENDPOINTS.STOCK_MANAGEMENT}`;
    const endpoint = queryString ? `${stockEndpoint}?${queryString}` : stockEndpoint;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Stock Management Error:', error);
    throw error;
  }
};

// Update Stock Data
export const updateStock = async (token, payload) => {
  try {
    const updateStockEndpoint = `${BASE_URL}/api${API_ENDPOINTS.UPDATE_STOCK}`;
    
    const response = await fetch(updateStockEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Update Stock Error:', error);
    throw error;
  }
};

// Get Seller Withdrawal Requests
export const getSellerWithdrawalRequests = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const withdrawalEndpoint = `${BASE_URL}/api${API_ENDPOINTS.GET_SELLER_WITHDRAW_REQUEST}`;
    const endpoint = queryString ? `${withdrawalEndpoint}?${queryString}` : withdrawalEndpoint;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Withdrawal Requests Error:', error);
    throw error;
  }
};

// Get Seller Wallet Transactions
export const getSellerWalletTransactions = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const walletEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_WALLET_TRANSACTIONS}`;
    const endpoint = queryString ? `${walletEndpoint}?${queryString}` : walletEndpoint;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Wallet Transactions Error:', error);
    throw error;
  }
};

// Create Seller Withdrawal Request
export const createSellerWithdrawalRequest = async (token, payload) => {
  try {
    const withdrawalEndpoint = `${BASE_URL}/api${API_ENDPOINTS.CREATE_SELLER_WITHDRAW_REQUEST}`;
    
    // Prepare the payload with the correct structure
    const requestPayload = {
      id: null,
      type: 'seller',
      type_id: payload.type_id || 32, // Default to 32 if not provided
      amount: payload.amount,
      message: payload.message
    };
    
    const response = await fetch(withdrawalEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Create Seller Withdrawal Request Error:', error);
    throw error;
  }
};

// Aadhaar OTP API functions
export const sendAadhaarOTP = async (aadhaarNumber) => {
  try {
    const otpEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SEND_AADHAR_OTP}`;
    
    const response = await fetch(otpEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber
      }),
    });
    
    const responseData = await response.json();
    
    console.log('Send Aadhaar OTP Response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle the new response format
    if (responseData.success && responseData.data && responseData.data.data && responseData.data.data.reference_id) {
      return responseData;
    } else {
      throw new Error(responseData.message || 'Failed to send Aadhaar OTP');
    }
    
    return responseData;
  } catch (error) {
    console.error('Send Aadhaar OTP Error:', error);
    throw error;
  }
};

export const verifyAadhaarOTP = async (referenceId, otp) => {
  try {
    const verifyEndpoint = `${BASE_URL}/api${API_ENDPOINTS.VERIFY_AADHAR_OTP}`;
    
    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        reference_id: referenceId,
        otp: otp
      }),
    });
    
    const responseData = await response.json();
    
    console.log('Verify Aadhaar OTP Response:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle the new response format
    if (responseData.success && responseData.data && responseData.data.data) {
      return responseData;
    } else {
      throw new Error(responseData.message || 'Failed to verify Aadhaar OTP');
    }
    
    return responseData;
  } catch (error) {
    console.error('Verify Aadhaar OTP Error:', error);
    throw error;
  }
};

// Bank Verification API functions
export const createBankVerificationTask = async (token, payload) => {
  try {
    const createEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_BANK_VERIFICATION_CREATE_TASK}`;
    
    const response = await fetch(createEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Create Bank Verification Task Error:', error);
    throw error;
  }
};

export const getBankVerificationTask = async (token, requestId) => {
  try {
    const getEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_BANK_VERIFICATION_GET_TASK}`;
    
    const response = await fetch(getEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId
      }),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Bank Verification Task Error:', error);
    throw error;
  }
};

// Get Seller Brands
export const getSellerBrands = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_BRANDS}?${queryString}` : API_ENDPOINTS.SELLER_BRANDS;

    // Brands endpoint uses different URL structure: BASE_URL + /api + endpoint
    const brandsApiUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_BRANDS}`;
    const finalUrl = queryString ? `${brandsApiUrl}?${queryString}` : brandsApiUrl;

    console.log('Brands API Request:', {
      endpoint: API_ENDPOINTS.SELLER_BRANDS,
      finalUrl: finalUrl,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Brands API Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch brands');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Brands Error:', error);
    throw error;
  }
};

// Get Seller Taxes
export const getSellerTaxes = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_TAXES}?${queryString}` : API_ENDPOINTS.SELLER_TAXES;

    // Taxes endpoint uses different URL structure: BASE_URL + /api + endpoint
    const taxesApiUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_TAXES}`;
    const finalUrl = queryString ? `${taxesApiUrl}?${queryString}` : taxesApiUrl;

    console.log('Taxes API Request:', {
      endpoint: API_ENDPOINTS.SELLER_TAXES,
      finalUrl: finalUrl,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Taxes API Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch taxes');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Taxes Error:', error);
    throw error;
  }
};

// Get All Brands
export const getAllBrands = async (token) => {
  try {
    console.log('All Brands API Request:', {
      endpoint: API_ENDPOINTS.ALL_BRANDS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_BRANDS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Brands API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch brands');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Brands Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Colors
export const getAllColors = async (token) => {
  try {
    console.log('All Colors API Request:', {
      endpoint: API_ENDPOINTS.ALL_COLORS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_COLORS}?per_page=100000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Colors API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch colors');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Colors Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Sizes
export const getAllSizes = async (token) => {
  try {
    console.log('All Sizes API Request:', {
      endpoint: API_ENDPOINTS.ALL_SIZES,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_SIZES}?per_page=100000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Sizes API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch sizes');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Sizes Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Materials
export const getAllMaterials = async (token) => {
  try {
    console.log('All Materials API Request:', {
      endpoint: API_ENDPOINTS.ALL_MATERIALS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_MATERIALS}?per_page=100000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Materials API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch materials');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Materials Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Patterns
export const getAllPatterns = async (token) => {
  try {
    console.log('All Patterns API Request:', {
      endpoint: API_ENDPOINTS.ALL_PATTERNS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_PATTERNS}?per_page=100000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Patterns API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch patterns');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Patterns Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Units
export const getAllUnits = async (token) => {
  try {
    console.log('All Units API Request:', {
      endpoint: API_ENDPOINTS.ALL_UNITS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_UNITS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Units API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch units');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Units Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Countries
export const getAllCountries = async (token) => {
  try {
    console.log('All Countries API Request:', {
      endpoint: API_ENDPOINTS.ALL_COUNTRIES,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_COUNTRIES}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Countries API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch countries');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Countries Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Tags
export const getAllTags = async (token) => {
  try {
    console.log('All Tags API Request:', {
      endpoint: API_ENDPOINTS.ALL_TAGS,
      token: token ? 'Present' : 'Missing'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.ALL_TAGS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('All Tags API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch tags');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Tags Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Warranties
export const getAllWarranties = async (token) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`https://seller.bringmart.in/api${API_ENDPOINTS.ALL_WARRANTIES}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the response JSON
    const responseData = await response.json();
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch warranties');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Warranties Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Get All Product Attributes
export const getAllProductAttributes = async (token, params = {}) => {
  try {
    // Build query string from parameters (optional)
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const base = `${BASE_URL}/api${API_ENDPOINTS.ALL_PRODUCT_ATTRIBUTES}`;
    const url = queryString ? `${base}?${queryString}` : base;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch product attributes');
    }

    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get All Product Attributes Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Update Product
export const updateProduct = async (token, {
  // Basic product information
  id,
  name,
  slug,
  seller_id,
  tag_ids,
  tax_id,
  brand_id,
  description,
  type,
  is_unlimited_stock,
  fssai_lic_no,
  warranty_id,
  accessories_warranty_id,
  category_id,
  product_type,
  manufacturer,
  made_in,
  shipping_type,
  pincode_ids_exc,
  return_status,
  return_days,
  cancelable_status,
  till_status,
  cod_allowed_status,
  max_allowed_quantity,
  delivery_option,
  delivery_charges,
  is_approved,
  tax_included_in_price,
  sku,
  hsn_code,
  self_life,
  no_of_pics,
  weight_in_grams,
  loose_stock,
  loose_stock_unit_id,
  status,
  
  // Images
  image,
  other_images,
  deleteImageIds,
  
  // Product Attributes (Specifications)
  product_attributes,
  
  // Variants data
  variants
}) => {
  try {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file uploads

    // Create FormData for the API
    const formData = new FormData();
    
    // Basic product information (match the exact order from previous payload)
    formData.append('id', id || '');
    
    // Add delete image IDs right after id (as per previous payload)
    if (deleteImageIds && deleteImageIds.length > 0) {
      deleteImageIds.forEach((imageId) => {
        formData.append('deleteImageIds', imageId);
      });
    } else {
      formData.append('deleteImageIds', JSON.stringify([]));
    }
    
    formData.append('name', name || '');
    formData.append('slug', slug || '');
    formData.append('seller_id', seller_id || '');
    formData.append('tag_ids', tag_ids || '');
    formData.append('tax_id', tax_id || '');
    formData.append('brand_id', brand_id || '');
    formData.append('description', description || '');
    formData.append('type', type || 'packet');
    formData.append('is_unlimited_stock', is_unlimited_stock || '0');
    formData.append('fssai_lic_no', fssai_lic_no || '');
    formData.append('warranty_id', warranty_id || '');
    formData.append('accessories_warranty_id', accessories_warranty_id || '');
    
    // Add variants data BEFORE other fields (as per previous payload structure)
    if (variants && variants.length > 0) {
      variants.forEach((variant, index) => {
        formData.append('variant_id[]', variant.variant_id || '');
        formData.append('packet_measurement[]', variant.measurement || '');
        formData.append('packet_title[]', variant.productTitle || '');
        formData.append('packet_price[]', variant.price || '');
        formData.append('packet_discounted_price[]', variant.discountedPrice || '');
        formData.append('packet_stock[]', variant.stock || '');
        formData.append('packet_stock_unit_id[]', variant.unit || '');
        formData.append('packet_status[]', variant.status === 'active' ? '1' : '0');
        formData.append('color_id[]', variant.color || '');
        formData.append('size_id[]', variant.size || '');
        formData.append('material_id[]', variant.material || '');
        formData.append('mattress_size[]', variant.mattressSize || '');
        formData.append('pack[]', variant.pack || '');
        formData.append('pd_type[]', variant.variantType || '');
        formData.append('pattern_id[]', variant.pattern || '');
        formData.append('packet_no_of_pics[]', variant.noOfPics || '');
        formData.append('packet_weight_in_grams[]', variant.weightInGrams || '');
        formData.append('packet_capacity[]', variant.capacity || '');
        formData.append('packet_dimensions[]', variant.dimensions || '');
        formData.append('packet_height[]', variant.height || '');
        formData.append('packet_flavour[]', variant.flavour || '');

        // Add variant images with proper naming convention
        if (variant.variantImages && variant.variantImages.length > 0) {
          variant.variantImages.forEach((img) => {
            formData.append(`packet_variant_images_${index}[]`, img);
          });
        }
      });
    }
    
    // Add remaining product fields after variants (as per previous payload structure)
    formData.append('loose_stock', loose_stock || '0');
    formData.append('loose_stock_unit_id', loose_stock_unit_id || '');
    formData.append('status', status || '1');
    formData.append('category_id', category_id || '');
    formData.append('product_type', product_type || '0');
    formData.append('manufacturer', manufacturer || '');
    formData.append('made_in', made_in || '');
    formData.append('shipping_type', shipping_type || 'undefined');
    formData.append('pincode_ids_exc', pincode_ids_exc || 'null');
    formData.append('return_status', return_status || '0');
    formData.append('return_days', return_days || '0');
    formData.append('cancelable_status', cancelable_status || '0');
    formData.append('till_status', till_status || 'null');
    formData.append('cod_allowed_status', cod_allowed_status || '0');
    formData.append('max_allowed_quantity', max_allowed_quantity || '10');
    formData.append('delivery_option', delivery_option || 'pay_by_yourself');
    formData.append('delivery_charges', delivery_charges || '0');
    formData.append('is_approved', is_approved || '0');
    formData.append('tax_included_in_price', tax_included_in_price || '0');
    
    // Add main image - IMPORTANT: must be sent
    if (image) {
      // If image is a File object, append it; otherwise it's a path string
      formData.append('image', image);
    }
    
    formData.append('sku', sku || 'null');
    formData.append('hsn_code', hsn_code || '');
    formData.append('self_life', self_life || '');
    formData.append('no_of_pics', no_of_pics || '0');
    formData.append('weight_in_grams', weight_in_grams || '0');
    
    // Add product attributes (specifications)
    if (product_attributes && Object.keys(product_attributes).length > 0) {
      formData.append('product_attributes', JSON.stringify(product_attributes));
    }
    
    // Add other images
    if (other_images && other_images.length > 0) {
      other_images.forEach((img) => {
        formData.append('other_images[]', img);
      });
    }

    // Validate required fields
    if (!id || !name || !seller_id || !category_id) {
      throw new Error('Missing required fields: id, name, seller_id, or category_id');
    }

    // Validate token
    if (!token) {
      throw new Error('Authentication token is required');
    }

    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.UPDATE_PRODUCT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Accept': 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    // Try to get response text first to check if it's HTML
    const responseText = await response.text();
    
    // Check if response starts with HTML
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      throw new Error(`Server returned an HTML error page. Status: ${response.status}, Content-Type: ${contentType}`);
    }
    
    // Parse the response JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Response text:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response from server. Please check the API endpoint.');
    }
    
    console.log('Update Product API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to update product');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Update Product Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Save Product
export const saveProduct = async (token, {
  // Basic product information
  name,
  slug,
  seller_id,
  tag_ids,
  tax_id,
  brand_id,
  description,
  type,
  is_unlimited_stock,
  fssai_lic_no,
  warranty_id,
  accessories_warranty_id,
  category_id,
  product_type,
  manufacturer,
  made_in,
  shipping_type,
  pincode_ids_exc,
  return_status,
  return_days,
  cancelable_status,
  till_status,
  cod_allowed_status,
  max_allowed_quantity,
  delivery_option,
  delivery_charges,
  is_approved,
  tax_included_in_price,
  sku,
  hsn_code,
  self_life,
  no_of_pics,
  weight_in_grams,
  loose_stock,
  loose_stock_unit_id,
  status,
  
  // Images
  image,
  other_images,
  
  // Product Attributes (Specifications)
  product_attributes,
  
  // Variants data
  variants
}) => {
  try {
    console.log('Save Product API Request:', {
      endpoint: API_ENDPOINTS.SAVE_PRODUCT,
      fullUrl: `${BASE_URL}/api${API_ENDPOINTS.SAVE_PRODUCT}`,
      token: token ? `Bearer ${token.substring(0, 20)}...` : 'Missing',
      name,
      seller_id,
      variants_count: variants?.length || 0
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file uploads

    // Create FormData for the API
    const formData = new FormData();
    
    // Basic product information
    formData.append('name', name || '');
    formData.append('slug', slug || '');
    formData.append('seller_id', seller_id || '');
    formData.append('tag_ids', tag_ids || '');
    formData.append('tax_id', tax_id || '');
    formData.append('brand_id', brand_id || '');
    formData.append('description', description || '');
    formData.append('type', type || 'packet');
    formData.append('is_unlimited_stock', is_unlimited_stock || '0');
    formData.append('fssai_lic_no', fssai_lic_no || '');
    formData.append('warranty_id', warranty_id || '');
    formData.append('accessories_warranty_id', accessories_warranty_id || '');
    formData.append('category_id', category_id || '');
    formData.append('product_type', product_type || '0');
    formData.append('manufacturer', manufacturer || '');
    formData.append('made_in', made_in || '');
    formData.append('shipping_type', shipping_type || 'undefined');
    formData.append('pincode_ids_exc', pincode_ids_exc || 'null');
    formData.append('return_status', return_status || '0');
    formData.append('return_days', return_days || '0');
    formData.append('cancelable_status', cancelable_status || '0');
    formData.append('till_status', till_status || '1');
    formData.append('cod_allowed_status', cod_allowed_status || '1');
    formData.append('max_allowed_quantity', max_allowed_quantity || '10');
    formData.append('delivery_option', delivery_option || 'pay_by_yourself');
    formData.append('delivery_charges', delivery_charges || '0');
    formData.append('is_approved', is_approved || '0');
    formData.append('tax_included_in_price', tax_included_in_price || '0');
    formData.append('sku', sku || '');
    formData.append('hsn_code', hsn_code || '');
    formData.append('self_life', self_life || '');
    formData.append('no_of_pics', no_of_pics || 'undefined');
    formData.append('weight_in_grams', weight_in_grams || 'undefined');
    formData.append('loose_stock', loose_stock || '0');
    formData.append('loose_stock_unit_id', loose_stock_unit_id || '');
    formData.append('status', status || '1');

    // Add main image
    if (image) {
      formData.append('image', image);
    }

    // Add other images
    if (other_images && other_images.length > 0) {
      other_images.forEach((img) => {
        formData.append('other_images[]', img);
      });
    }

    // Add product attributes (specifications)
    if (product_attributes && Object.keys(product_attributes).length > 0) {
      formData.append('product_attributes', JSON.stringify(product_attributes));
    }

    // Add variants data
    if (variants && variants.length > 0) {
      variants.forEach((variant, index) => {
        formData.append('variant_id[]', '');
        formData.append('packet_measurement[]', variant.measurement || '');
        formData.append('packet_title[]', variant.productTitle || '');
        formData.append('packet_price[]', variant.price || '');
        formData.append('packet_discounted_price[]', variant.discountedPrice || '');
        formData.append('packet_stock[]', variant.stock || '');
        formData.append('packet_stock_unit_id[]', variant.unit || '');
        formData.append('packet_status[]', variant.status === 'active' ? '1' : '0');
        formData.append('color_id[]', variant.color || '');
        formData.append('size_id[]', variant.size || '');
        formData.append('material_id[]', variant.material || '');
        formData.append('mattress_size[]', variant.mattressSize || '');
        formData.append('pack[]', variant.pack || '');
        formData.append('pd_type[]', variant.variantType || '');
        formData.append('pattern_id[]', variant.pattern || '');
        formData.append('packet_no_of_pics[]', variant.noOfPics || '');
        formData.append('packet_weight_in_grams[]', variant.weightInGrams || '');
        formData.append('packet_capacity[]', variant.capacity || '');
        formData.append('packet_dimensions[]', variant.dimensions || '');
        formData.append('packet_height[]', variant.height || '');
        formData.append('packet_flavour[]', variant.flavour || '');

        // Add variant images with proper naming convention
        if (variant.variantImages && variant.variantImages.length > 0) {
          variant.variantImages.forEach((img) => {
            formData.append(`packet_variant_images_${index}[]`, img);
          });
        }
      });
    }

    // Validate required fields
    if (!name || !seller_id || !category_id) {
      throw new Error('Missing required fields: name, seller_id, or category_id');
    }

    // Validate token
    if (!token) {
      throw new Error('Authentication token is required');
    }

    // Debug FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.SAVE_PRODUCT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
        'Accept': 'application/json',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get response text first to check if it's HTML
    const responseText = await response.text();
    console.log('Response text (first 200 chars):', responseText.substring(0, 200));
    
    // Check if response starts with HTML
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('HTML response received:', responseText.substring(0, 500));
      throw new Error(`Server returned an HTML error page. Status: ${response.status}, Content-Type: ${contentType}`);
    }
    
    // Parse the response JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Response text:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response from server. Please check the API endpoint.');
    }
    
    console.log('Save Product API Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to save product');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Save Product Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Update Seller Profile API
export const updateSellerProfile = async (formData, token) => {
  try {
    const profileData = new FormData();
    
    // Basic Information
    if (formData.userName) profileData.append('name', formData.userName);
    if (formData.email) profileData.append('email', formData.email);
    if (formData.mobile) profileData.append('mobile', formData.mobile);
    
    // Store Information
    if (formData.storeName) profileData.append('store_name', formData.storeName);
    if (formData.storeUrl) profileData.append('slug', formData.storeUrl);
    if (formData.storeDescription) profileData.append('store_description', formData.storeDescription);
    
    // Document Numbers
    if (formData.panNumber) profileData.append('pan_number', formData.panNumber);
    if (formData.aadharNumber) profileData.append('national_identity_card', formData.aadharNumber);
    if (formData.gstin) profileData.append('tax_number', formData.gstin);
    if (formData.fssaiNumber) profileData.append('fssai_lic_no', formData.fssaiNumber);
    
    // Location Information
    if (formData.state) profileData.append('state', formData.state);
    if (formData.street) profileData.append('street', formData.street);
    if (formData.placeName) profileData.append('city_name', formData.placeName);
    if (formData.formattedAddress) profileData.append('address', formData.formattedAddress);
    if (formData.latitude) profileData.append('latitude', formData.latitude);
    if (formData.longitude) profileData.append('longitude', formData.longitude);
    
    // Bank Information
    if (formData.bankName) profileData.append('bank_name', formData.bankName);
    if (formData.accountNumber) profileData.append('account_number', formData.accountNumber);
    if (formData.ifscCode) profileData.append('ifsc_code', formData.ifscCode);
    if (formData.bankAccountName) profileData.append('account_name', formData.bankAccountName);
    
    // Profile Image
    if (formData.profileImage) {
      profileData.append('profile_image', formData.profileImage);
    }
    
    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.UPDATE_SELLER_PROFILE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: profileData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Update Seller Profile Error:', error);
    throw error;
  }
};

// Update Seller Profile with new endpoint
export const updateSellerProfileNew = async (
  id,
  admin_id,
  name,
  email,
  mobile,
  store_url,
  password,
  confirm_password,
  store_name,
  street,
  pincode_id,
  city_id,
  categories_ids,
  state,
  remark,
  account_number,
  ifsc_code,
  bank_name,
  account_name,
  commission,
  tax_name,
  tax_number,
  pan_number,
  latitude,
  longitude,
  place_name,
  formatted_address,
  store_description,
  require_products_approval,
  customer_privacy,
  view_order_otp,
  assign_delivery_boy,
  change_order_status_delivered,
  status,
  store_logo,
  national_id_card,
  address_proof,
  profile_image,
  pan_card,
  fssai_certificate,
  fssai_lic_no,
  token
) => {
  try {
    const profileData = new FormData();
    
    // Required fields
    if (id) profileData.append('id', id);
    if (admin_id) profileData.append('admin_id', admin_id);
    if (name) profileData.append('name', name);
    if (email) profileData.append('email', email);
    if (mobile) profileData.append('mobile', mobile);
    if (store_name) profileData.append('store_name', store_name);
    if (street) profileData.append('street', street);
    if (city_id) profileData.append('city_id', city_id);
    if (categories_ids) profileData.append('categories_ids', categories_ids);
    if (account_number) profileData.append('account_number', account_number);
    if (ifsc_code) profileData.append('ifsc_code', ifsc_code);
    if (bank_name) profileData.append('bank_name', bank_name);
    if (account_name) profileData.append('account_name', account_name);
    if (commission) profileData.append('commission', commission);
    if (pan_number) profileData.append('pan_number', pan_number);
    if (latitude) profileData.append('latitude', latitude);
    if (longitude) profileData.append('longitude', longitude);
    if (place_name) profileData.append('place_name', place_name);
    if (formatted_address) profileData.append('formatted_address', formatted_address);
    if (require_products_approval !== undefined) profileData.append('require_products_approval', require_products_approval);
    if (customer_privacy !== undefined) profileData.append('customer_privacy', customer_privacy);
    if (view_order_otp !== undefined) profileData.append('view_order_otp', view_order_otp);
    if (assign_delivery_boy !== undefined) profileData.append('assign_delivery_boy', assign_delivery_boy);
    if (change_order_status_delivered !== undefined) profileData.append('change_order_status_delivered', change_order_status_delivered);
    if (status !== undefined) profileData.append('status', status);
    
    // Optional fields
    if (store_url) profileData.append('store_url', store_url);
    if (password) profileData.append('password', password);
    if (confirm_password) profileData.append('confirm_password', confirm_password);
    if (pincode_id) profileData.append('pincode_id', pincode_id);
    if (state) profileData.append('state', state);
    if (remark) profileData.append('remark', remark);
    if (tax_name) profileData.append('tax_name', tax_name);
    if (tax_number) profileData.append('tax_number', tax_number);
    if (store_description) profileData.append('store_description', store_description);
    if (fssai_lic_no) profileData.append('fssai_lic_no', fssai_lic_no);
    
    // File uploads
    if (store_logo && store_logo !== 'undefined') profileData.append('store_logo', store_logo);
    if (national_id_card) profileData.append('national_id_card', national_id_card);
    if (address_proof) profileData.append('address_proof', address_proof);
    if (profile_image) profileData.append('profile_image', profile_image);
    if (pan_card) profileData.append('pan_card', pan_card);
    if (fssai_certificate) profileData.append('fssai_certificate', fssai_certificate);
    
    console.log('Update Seller Profile Request:', {
      endpoint: API_ENDPOINTS.SELLER_PROFILE_UPDATE,
      token: token ? 'Present' : 'Missing',
      id,
      name,
      email,
      mobile,
      store_name
    });

    const response = await fetch(`${BASE_URL}/api${API_ENDPOINTS.SELLER_PROFILE_UPDATE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: profileData,
    });
    
    console.log('Update Seller Profile Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}, Content-Type: ${contentType}`);
    }
    
    const responseData = await response.json();
    
    console.log('Update Seller Profile Response Data:', responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Update Seller Profile Error:', error);
    throw error;
  }
};

// Get Seller Units
export const getSellerUnits = async (token, params = {}) => {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();
    
    // Add all parameters to query string
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.SELLER_UNITS}?${queryString}` : API_ENDPOINTS.SELLER_UNITS;

    // Units endpoint uses different URL structure: BASE_URL + /api + endpoint
    const unitsApiUrl = `${BASE_URL}/api${API_ENDPOINTS.SELLER_UNITS}`;
    const finalUrl = queryString ? `${unitsApiUrl}?${queryString}` : unitsApiUrl;

    console.log('Units API Request:', {
      endpoint: API_ENDPOINTS.SELLER_UNITS,
      finalUrl: finalUrl,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Units API Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch units');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Seller Units Error:', error);
    throw error;
  }
};

// Generic API functions for other endpoints
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'POST', 
    body: data instanceof FormData ? data : JSON.stringify(data) 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: data instanceof FormData ? data : JSON.stringify(data) 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// Get all cities
export const getAllCities = async (token) => {
  try {
    const citiesEndpoint = `${BASE_URL}/api${API_ENDPOINTS.ALL_CITIES}`;

    console.log('Get All Cities Request:', {
      endpoint: citiesEndpoint,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(citiesEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get All Cities Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch cities');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get All Cities Error:', error);
    throw error;
  }
};

// Get Seller Store Status
export const getSellerStoreStatus = async (token) => {
  try {
    const storeStatusEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_STORE_STATUS}`;

    console.log('Get Seller Store Status Request:', {
      endpoint: storeStatusEndpoint,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(storeStatusEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to get store status');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Seller Store Status Error:', error);
    throw error;
  }
};

// Toggle Store Status
export const toggleStoreStatus = async (token, status) => {
  try {
    const storeStatusEndpoint = `${BASE_URL}/api${API_ENDPOINTS.TOGGLE_STORE_STATUS}`;

    console.log('Toggle Store Status Request:', {
      endpoint: storeStatusEndpoint,
      token: token ? 'Present' : 'Missing',
      status: status
    });

    const response = await fetch(storeStatusEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ status: status }),
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Toggle Store Status Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to toggle store status');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Toggle Store Status Error:', error);
    throw error;
  }
};

// Get All Products
export const getAllProducts = async (token, category = '', seller = '', is_approved = '', page = 1, per_page = 5, filter = '') => {
  try {
    // Build query string from individual parameters
    const queryParams = new URLSearchParams();
    
    // Add parameters only if they have values
    if (category !== null && category !== undefined && category !== '') {
      queryParams.append('category', category);
    }
    if (seller !== null && seller !== undefined && seller !== '') {
      queryParams.append('seller', seller);
    }
    if (is_approved !== null && is_approved !== undefined && is_approved !== '') {
      queryParams.append('is_approved', is_approved);
    }
    if (page !== null && page !== undefined && page !== '') {
      queryParams.append('page', page);
    }
    if (per_page !== null && per_page !== undefined && per_page !== '') {
      queryParams.append('per_page', per_page);
    }
    if (filter !== null && filter !== undefined && filter !== '') {
      queryParams.append('filter', filter);
    }

    const queryString = queryParams.toString();
    const productsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_ALL_PRODUCTS}`;
    const endpoint = queryString ? `${productsEndpoint}?${queryString}` : productsEndpoint;

    console.log('Get All Products Request:', {
      endpoint: endpoint,
      token: token ? 'Present' : 'Missing',
      category: category,
      seller: seller,
      is_approved: is_approved,
      page: page,
      per_page: per_page,
      filter: filter
    });

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get All Products Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch products');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get All Products Error:', error);
    throw error;
  }
};

// Get Seller Product Details
export const getSellerProduct = async (token, productId) => {
  try {
    const productEndpoint = `${BASE_URL}/api${API_ENDPOINTS.VIEW_SELLER_PRODUCT}/${productId}`;

    console.log('Get Seller Product Request:', {
      endpoint: productEndpoint,
      token: token ? 'Present' : 'Missing',
      productId: productId
    });

    const response = await fetch(productEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get Seller Product Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch product details');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Seller Product Error:', error);
    throw error;
  }
};

// Get Product by ID for Editing
export const getProductById = async (token, productId) => {
  try {
    const productEndpoint = `${BASE_URL}/api${API_ENDPOINTS.GET_PRODUCT_BY_ID}/${productId}`;

    console.log('Get Product by ID Request:', {
      endpoint: productEndpoint,
      token: token ? 'Present' : 'Missing',
      productId: productId
    });

    const response = await fetch(productEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get Product by ID Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch product details');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Product by ID Error:', error);
    throw error;
  }
};

// Delete Product
export const deleteProduct = async (token, productId) => {
  try {
    const deleteEndpoint = `${BASE_URL}/api${API_ENDPOINTS.PRODUCT_DELETE}`;

    console.log('Delete Product Request:', {
      endpoint: deleteEndpoint,
      token: token ? 'Present' : 'Missing',
      productId: productId
    });

    const response = await fetch(deleteEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id: productId }),
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Delete Product Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to delete product');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Delete Product Error:', error);
    throw error;
  }
};

// Change Product Availability Status
export const changeProductAvailabilityStatus = async (token, productId) => {
  try {
    const changeStatusEndpoint = `${BASE_URL}/api${API_ENDPOINTS.CHANGE_PRODUCT_AVAILABILITY_STATUS}`;

    const response = await fetch(changeStatusEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id: productId }),
    });

    // Parse the response JSON
    const responseData = await response.json();
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to change product availability');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Change Product Availability Error:', error);
    throw error;
  }
};

// Get All Active Products
export const getAllActiveProducts = async (token) => {
  try {
    const activeProductsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.GET_ALL_ACTIVE_PRODUCTS}`;

    console.log('Get All Active Products Request:', {
      endpoint: activeProductsEndpoint,
      token: token ? 'Present' : 'Missing'
    });

    const response = await fetch(activeProductsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get All Active Products Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch active products');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get All Active Products Error:', error);
    throw error;
  }
};

// Get Customer Ratings
export const getCustomerRatings = async (productId) => {
  try {
    const ratingsEndpoint = `${BASE_URL}${API_ENDPOINTS.GET_CUSTOMER_RATINGS}`;

    console.log('Get Customer Ratings Request:', {
      endpoint: ratingsEndpoint,
      productId: productId
    });

    const response = await fetch(`${ratingsEndpoint}?product_id=${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Parse the response JSON
    const responseData = await response.json();

    console.log('Get Customer Ratings Response:', {
      status: response.status,
      responseData: responseData
    });

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch customer ratings');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Customer Ratings Error:', error);
    throw error;
  }
};

// Get Seller Mail and SMS Settings
export const getSellerMailAndSmsSettings = async (token) => {
  try {
    const mailSettingsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SELLER_MAIL_AND_SMS_SETTINGS}`;
    const response = await fetch(mailSettingsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch mail settings');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Get Seller Mail and SMS Settings Error:', error);
    throw error;
  }
};

// Save Seller Mail and SMS Settings
export const saveSellerMailAndSmsSettings = async (token, settingsData) => {
  try {
    const saveSettingsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.BUYER_MAIL_AND_SMS_SETTINGS_SAVE}`;
    
    // Build the payload with individual parameters
    const payload = new URLSearchParams();
    
    settingsData.forEach((setting, index) => {
      payload.append('status_ids[]', setting.status_id);
      payload.append('mail_statuses[]', setting.mail_status ? '1' : '0');
      payload.append('mobile_statuses[]', setting.mobile_status ? '1' : '0');
      payload.append('sms_statuses[]', setting.sms_status ? '1' : '0');
    });

    const response = await fetch(saveSettingsEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: payload.toString(),
    });
    
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to save mail settings');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Save Seller Mail and SMS Settings Error:', error);
    throw error;
  }
};

// Change Password
export const changePassword = async (token, passwordData) => {
  try {
    const changePasswordEndpoint = `${BASE_URL}/api${API_ENDPOINTS.SAVE_CHANGE_PASSWORD}`;
    
    const response = await fetch(changePasswordEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });
    
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to change password');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Change Password Error:', error);
    throw error;
  }
};

// Get View Order Details
export const getViewOrderDetails = async (token, orderId) => {
  try {
    const viewOrderDetailsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.VIEW_ORDER_DETAILS}/${orderId}`;
    
    const response = await fetch(viewOrderDetailsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch order details');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Get View Order Details Error:', error);
    throw error;
  }
};

// Assign Delivery Boy
export const assignDeliveryBoy = async (token, orderId, deliveryBoyId) => {
  try {
    const assignDeliveryBoyEndpoint = `${BASE_URL}/api${API_ENDPOINTS.ASSIGN_DELIVERY_BOY}`;
    
    const payload = {
      order_id: orderId,
      delivery_boy_id: deliveryBoyId
    };
    
    const response = await fetch(assignDeliveryBoyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to assign delivery boy');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Assign Delivery Boy Error:', error);
    throw error;
  }
};

// Accept or Reject Order
export const acceptOrRejectOrder = async (token, orderId, status, reason = null) => {
  try {
    const acceptRejectOrderEndpoint = `${BASE_URL}/api${API_ENDPOINTS.ORDER_ACCEPT_AND_REJECT}`;
    
    const payload = {
      order_id: orderId,
      status: status, // 1 for accept, 2 for reject
      reason: reason
    };
    
    const response = await fetch(acceptRejectOrderEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to update order status');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Accept/Reject Order Error:', error);
    throw error;
  }
};

export const generateInvoice = async (token, orderId) => {
  try {
    const generateInvoiceEndpoint = `${BASE_URL}/api${API_ENDPOINTS.GENERATE_INVOICE}?order_id=${orderId}`;
    const response = await fetch(generateInvoiceEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    const responseData = await response.json();
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to generate invoice');
    }
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    return responseData;
  } catch (error) {
    console.error('Generate Invoice Error:', error);
    throw error;
  }
};

export const downloadInvoice = async (token, orderId) => {
  try {
    const downloadInvoiceEndpoint = `${BASE_URL}/api${API_ENDPOINTS.DOWNLOAD_INVOICE}`;
    const payload = {
      order_id: orderId
    };
    const response = await fetch(downloadInvoiceEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Invoice downloaded successfully' };
  } catch (error) {
    console.error('Download Invoice Error:', error);
    throw error;
  }
};

// Get Top Notifications
export const getTopNotifications = async (token) => {
  try {
    const notificationsEndpoint = `${BASE_URL}/api${API_ENDPOINTS.GET_TOP_NOTIFICATIONS}`;
    
    const response = await fetch(notificationsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch notifications');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Top Notifications Error:', error);
    throw error;
  }
};

// Mark Notification as Read
export const markNotificationAsRead = async (token, id) => {
  try {
    // Validate token
    if (!token) {
      throw new Error('Authentication token is required');
    }
    
    // Validate notificationId
    if (!id) {
      throw new Error('Notification ID is required');
    }
    
    // Build query string with notification id
    const queryParams = new URLSearchParams();
    queryParams.append('id', id);
    
    const notificationReadEndpoint = `${BASE_URL}/api${API_ENDPOINTS.NOTIFICATION_READ}?${queryParams.toString()}`;
    
    const response = await fetch(notificationReadEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    console.log('Mark Notification as Read Response:', {
      status: response.status,
      responseData: responseData
    });
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to mark notification as read');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Mark Notification as Read Error:', error);
    throw error;
  }
};

export const clearCache = async (token) => {
  try {
    const clearCacheEndpoint = `${BASE_URL}${API_ENDPOINTS.CLEAR_CACHE}`;
    
    console.log('Clear Cache Request:', {
      endpoint: clearCacheEndpoint,
      token: token ? 'Present' : 'Missing'
    });
    
    const response = await fetch(clearCacheEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    console.log('Clear Cache Response:', {
      status: response.status,
      responseData: responseData
    });
    
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to clear cache');
    }
    
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Clear Cache Error:', error);
    throw error;
  }
};

// Get Seller Packet Products
export const getSellerPacketProducts = async (token, category = '', type = 'packet_products') => {
  try {
    // Validate token
    if (!token) {
      throw new Error('Authentication token is required');
    }

    // Build query string with individual parameters
    const queryParams = new URLSearchParams();
    queryParams.append('category', category || '');
    queryParams.append('type', type);

    const queryString = queryParams.toString();
    const packetProductsEndpoint = `${BASE_URL}${SUB_URL}${API_ENDPOINTS.SELLER_PRODUCT_INFO}`;
    const endpoint = `${packetProductsEndpoint}?${queryString}`;

    console.log('Get Seller Packet Products Request:', {
      endpoint: endpoint,
      token: token ? 'Present' : 'Missing',
      category: category,
      type: type
    });

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    console.log('Response Content-Type:', contentType);
    console.log('Response Status:', response.status);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse.substring(0, 500));
      
      // Check if it's an authentication error
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Check if it's a 404 error
      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the endpoint configuration.');
      }
      
      throw new Error(`Server returned non-JSON response. Status: ${response.status}, Content-Type: ${contentType}. Response: ${textResponse.substring(0, 200)}`);
    }

    // Parse the response JSON
    const responseData = await response.json();

    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'Failed to fetch packet products');
    }

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Seller Packet Products Error:', error);
    throw error;
  }
};

// Get Seller Product Sales Report
export const getSellerProductSalesReport = async (token, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.SELLER_PRODUCT_SALES_REPORT}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const responseData = await response.json();

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Seller Product Sales Report Error:', error);
    throw error;
  }
};

// Get Seller Sales Report
export const getSellerSalesReport = async (token, startDate, endDate, seller = '', category = '') => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,
      endDate: endDate,
      seller: seller,
      category: category
    });

    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.SELLER_SALES_REPORT}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const responseData = await response.json();

    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('Get Seller Sales Report Error:', error);
    throw error;
  }
};

// Get All Support Ticket Categories
export const getAllSupportTicketCategories = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.GET_ALL_SUPPORT_TICKETS_CATEGORIES}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Support Ticket Categories Error:', error);
    throw error;
  }
};

// Create Support Ticket
export const createSupportTicket = async (token, ticketData) => {
  try {
    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.CREATE_SUPPORT_TICKET}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Create Support Ticket Error:', error);
    throw error;
  }
};

// Get All Support Tickets
export const getAllSupportTickets = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.GET_ALL_SUPPORT_TICKETS}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get All Support Tickets Error:', error);
    throw error;
  }
};

// Get Support Ticket Details by ID
export const getSupportTicketDetails = async (token, ticketId) => {
  try {
    const response = await fetch(`${BASE_URL}${SUB_URL}${API_ENDPOINTS.GET_SUPPORT_TICKET_DETAILS}/${ticketId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Parse the response JSON
    const responseData = await response.json();
    
    // Check if the response indicates an error (status: 0)
    if (responseData.status === 0) {
      throw new Error(responseData.message || 'An error occurred');
    }
    
    // Check for HTTP error status
    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error('Get Support Ticket Details Error:', error);
    throw error;
  }
};

export default api;
