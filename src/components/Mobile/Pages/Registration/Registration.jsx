import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { registerSeller, getSellerCategories, createGstVerificationTask, getGstVerificationTask, getSellerCommission, createBankVerificationTask, getBankVerificationTask } from '../../../../api/api.js';
import { useToast } from '../../../../contexts/ToastContext';
import MapComponent from './Map';
import PlacesAutocomplete from './PlacesAutocomplete';

const Registration = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [formData, setFormData] = useState({
    // Basic Information
    userName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    categories: [],
    storeName: '',
    storeUrl: '',
    panNumber: '',
    aadharNumber: '',
    commission: '2',

    // GST Information
    type: 'GST', // GST or Non-GST
    gstin: '',

    // Document Uploads
    profileImage: null,
    aadharCardFront: null,
    aadharCardBack: null,
    panCard: null,
    storeImage: null,
    fssaiCertificate: null,
    fssaiNumber: '',

    // Store Description
    storeDescription: '',

    // Location Information
    state: 'Jharkhand',
    street: 'Jamshedpur Jharkhand',
    searchLocation: '',
    latitude: '22.8045665',
    longitude: '86.2028754',
    placeName: 'Jamshedpur',
    formattedAddress: 'Jamshedpur, Jharkhand, India',
    enrollmentNumber: '',

    // Bank Account Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankAccountName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [gstVerification, setGstVerification] = useState({
    taskId: null,
    isVerifying: false,
    tradeName: '',
    location: '',
    isVerified: false
  });
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 22.8046, lng: 86.2029 }); // Jamshedpur coordinates
  const [commissionData, setCommissionData] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(true);

  // Bank verification state
  const [bankVerification, setBankVerification] = useState({
    isVerifying: false,
    isVerified: false,
    requestId: null,
    bankDetails: null
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getSellerCategories();
        console.log('Categories API response:', response);

        let categoriesData = [];
        if (response && response.data && Array.isArray(response.data)) {
          console.log('Setting categories from response.data:', response.data);
          categoriesData = response.data;
        } else if (response && Array.isArray(response)) {
          console.log('Setting categories from direct response:', response);
          categoriesData = response;
        } else if (response && response.categories && Array.isArray(response.categories)) {
          console.log('Setting categories from response.categories:', response.categories);
          categoriesData = response.categories;
        } else {
          console.log('Using fallback categories');
          categoriesData = [
            { id: '789', name: 'Electronics' },
            { id: '604', name: 'Fashion & Clothing' },
            { id: '212', name: 'Home & Garden' },
            { id: '345', name: 'Sports & Fitness' },
            { id: '456', name: 'Books & Media' },
            { id: '567', name: 'Health & Beauty' },
            { id: '678', name: 'Food & Beverages' },
            { id: '890', name: 'Automotive' },
            { id: '901', name: 'Toys & Games' },
            { id: '012', name: 'Office Supplies' },
            { id: '123', name: 'Pet Supplies' },
            { id: '234', name: 'Other' }
          ];
        }

        console.log('Final categories data:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to static categories on error
        setCategories([
          { id: '789', name: 'Electronics' },
          { id: '604', name: 'Fashion & Clothing' },
          { id: '212', name: 'Home & Garden' },
          { id: '345', name: 'Sports & Fitness' },
          { id: '456', name: 'Books & Media' },
          { id: '567', name: 'Health & Beauty' },
          { id: '678', name: 'Food & Beverages' },
          { id: '890', name: 'Automotive' },
          { id: '901', name: 'Toys & Games' },
          { id: '012', name: 'Office Supplies' },
          { id: '123', name: 'Pet Supplies' },
          { id: '234', name: 'Other' }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch commission data on component mount
  useEffect(() => {
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

    fetchCommission();
  }, []);

  // Request location permission and get current location
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        return;
      }

      try {
        setLocationLoading(true);

        // Check if geolocation permission is already granted
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(permission.state);

          if (permission.state === 'granted') {
            getCurrentLocation();
          } else if (permission.state === 'prompt') {
            // Request permission
            getCurrentLocation();
          }
        } else {
          // Fallback for browsers that don't support permissions API
          getCurrentLocation();
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setLocationLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = {
          latitude,
          longitude,
          accuracy: position.coords.accuracy
        };

        setCurrentLocation(location);
        setLocationPermission('granted');
        setLocationLoading(false);

        // Update form data with current location
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        // Reverse geocode to get address
        reverseGeocode(latitude, longitude);

        // Fetch commission for current location
        fetchCommissionForLocation(latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setLocationLoading(false);

        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }

        alert(`Location Error: ${errorMessage}\n\nPlease enable location access in your browser settings or enter your location manually.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using a free reverse geocoding service (you can replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (response.ok) {
        const data = await response.json();

        // Extract more detailed address information
        const state = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name || '';
        const city = data.city || data.locality || '';
        const locality = data.locality || data.city || '';
        const street = data.localityInfo?.administrative?.[2]?.name || locality || city || '';

        // Update form data with reverse geocoded information
        setFormData(prev => ({
          ...prev,
          placeName: city,
          formattedAddress: `${locality}, ${state}, India`,
          state: state,
          street: street
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const requestLocationAgain = () => {
    setLocationLoading(true);
    getCurrentLocation();
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Fetch commission for specific location
  const fetchCommissionForLocation = async (latitude, longitude) => {
    try {
      setCommissionLoading(true);
      console.log('Fetching commission for location:', latitude, longitude);

      // Jamshedpur coordinates
      const jamshedpurLat = 22.8045665;
      const jamshedpurLng = 86.2028754;

      // Calculate distance from Jamshedpur
      const distance = calculateDistance(latitude, longitude, jamshedpurLat, jamshedpurLng);
      console.log('Distance from Jamshedpur:', distance.toFixed(2), 'km');

      // Determine commission based on distance
      const commission = distance <= 30 ? '2' : '5';
      console.log('Calculated commission:', commission + '%');

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
      console.error('Error calculating commission for location:', error);
      // Keep current commission value on error
    } finally {
      setCommissionLoading(false);
    }
  };

  // Handle location selection from map
  const handleMapLocationSelect = (locationData) => {
    const { position, formattedAddress, name } = locationData;

    // Update form data with new coordinates
    setFormData(prev => ({
      ...prev,
      latitude: position.lat.toString(),
      longitude: position.lng.toString(),
      searchLocation: formattedAddress || name || ''
    }));

    // Update map center
    setMapCenter(position);

    // Update current location state
    setCurrentLocation({
      latitude: position.lat,
      longitude: position.lng,
      accuracy: null
    });

    // Reverse geocode to get address details
    reverseGeocode(position.lat, position.lng);

    // Fetch commission for new location
    fetchCommissionForLocation(position.lat, position.lng);
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (placeData) => {
    const { position, formattedAddress, name } = placeData;

    // Update form data with new coordinates and address
    setFormData(prev => ({
      ...prev,
      latitude: position.lat.toString(),
      longitude: position.lng.toString(),
      searchLocation: formattedAddress || name || ''
    }));

    // Update map center to show selected place
    setMapCenter(position);

    // Update current location state
    setCurrentLocation({
      latitude: position.lat,
      longitude: position.lng,
      accuracy: null
    });

    // Reverse geocode to get address details
    reverseGeocode(position.lat, position.lng);

    // Fetch commission for new location
    fetchCommissionForLocation(position.lat, position.lng);
  };

  const handleCategorySelect = (categoryId) => {
    if (formData.categories.includes(categoryId)) {
      // Remove category if already selected
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(id => id !== categoryId)
      }));
    } else {
      // Add category if not selected
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryId]
      }));
    }

    // Clear error when user makes selection
    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  };

  const removeCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(id => id !== categoryId)
    }));
  };


  // IFSC Code validation function
  const validateIFSC = (ifscCode) => {
    // IFSC format: 4 letters, 0, 6 alphanumeric (e.g., PUNB0038800)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifscCode);
  };

  // Handle bank verification
  const handleBankVerification = async () => {
    if (!formData.accountNumber || !formData.ifscCode) {
      showError('Invalid Bank Details', 'Please enter both account number and IFSC code');
      return;
    }

    if (!validateIFSC(formData.ifscCode)) {
      showError('Invalid IFSC Code', 'Please enter a valid IFSC code format: 4 letters, 0, 6 alphanumeric (e.g., PUNB0038800)');
      return;
    }

    try {
      setBankVerification(prev => ({ ...prev, isVerifying: true }));

      // Create verification task
      const payload = {
        bank_account_no: formData.accountNumber,
        bank_ifsc_code: formData.ifscCode,
        nf_verification: true
      };

      const createResponse = await createBankVerificationTask(null, payload);
      
      if (createResponse.status === 'success' && createResponse.data?.request_id) {
        const requestId = createResponse.data.request_id;
        setBankVerification(prev => ({ ...prev, requestId }));

        // Poll for task completion with timeout and retry limits
        let pollCount = 0;
        const maxPolls = 30; // Maximum 30 polls (60 seconds)
        const pollInterval = 2000; // 2 seconds between polls

        const pollForResult = async () => {
          try {
            pollCount++;
            console.log(`Polling attempt ${pollCount}/${maxPolls} for bank verification result`);

            const getResponse = await getBankVerificationTask(null, requestId);
            console.log('Bank verification task result:', getResponse);

            if (getResponse && getResponse.status === 'success' && getResponse.data && Array.isArray(getResponse.data) && getResponse.data.length > 0) {
              const bankData = getResponse.data[0];

              // Check if task is completed with result data
              if (bankData.status === 'completed' && bankData.result) {
                const bankDetails = bankData.result;

                setBankVerification(prev => ({
                  ...prev,
                  isVerifying: false,
                  isVerified: true,
                  bankDetails: bankDetails
                }));
                
                // Auto-populate Bank Account Name from verification result
                if (bankDetails.name_at_bank) {
                  setFormData(prev => ({
                    ...prev,
                    bankAccountName: bankDetails.name_at_bank.trim()
                  }));
                }
                
                showSuccess('Bank Verification Successful', `Bank account verified for ${bankDetails.name_at_bank}`);
                return; // Stop polling - success!
              }
              // Check if task is still in progress
              else if (bankData.status === 'in_progress') {
                console.log('Bank verification still in progress, continuing to poll...');
                if (pollCount >= maxPolls) {
                  // Max polls reached, stop polling
                  setBankVerification(prev => ({ ...prev, isVerifying: false }));
                  showWarning('Bank Verification Timeout', 'Bank verification is taking longer than expected. Please try again later.');
                  return;
                } else {
                  // Still processing, poll again after interval
                  setTimeout(pollForResult, pollInterval);
                }
              }
              // Check if task failed
              else if (bankData.status === 'failed') {
                setBankVerification(prev => ({
                  ...prev,
                  isVerifying: false,
                  isVerified: false
                }));
                showError('Bank Verification Failed', 'Bank verification failed. Please check your bank details.');
                return; // Stop polling
              }
              // Unknown status
              else {
                console.log('Unknown bank verification status:', bankData.status);
                if (pollCount >= maxPolls) {
                  setBankVerification(prev => ({ ...prev, isVerifying: false }));
                  alert('Bank verification completed with unknown status. Please try again.');
                  return;
                } else {
                  setTimeout(pollForResult, pollInterval);
                }
              }
            } else {
              console.log('Invalid response structure:', getResponse);
              if (pollCount >= maxPolls) {
                setBankVerification(prev => ({ ...prev, isVerifying: false }));
                alert('Bank verification failed due to invalid response. Please try again.');
                return;
              } else {
                setTimeout(pollForResult, pollInterval);
              }
            }
          } catch (error) {
            console.error('Error getting bank verification result:', error);
            if (pollCount >= maxPolls) {
              setBankVerification(prev => ({ ...prev, isVerifying: false }));
              alert('Error verifying bank after multiple attempts. Please try again.');
              return;
            } else {
              // Retry on error for a few attempts
              setTimeout(pollForResult, pollInterval);
            }
          }
        };

        pollForResult();
      } else {
        setBankVerification(prev => ({ ...prev, isVerifying: false }));
        showError('Bank Verification Failed', 'Failed to create bank verification task. Please try again.');
      }
    } catch (error) {
      console.error('Bank verification error:', error);
      setBankVerification(prev => ({ ...prev, isVerifying: false }));
      const errorMessage = error.message || 'Unknown error occurred';
      showError('Bank Verification Error', errorMessage);
    }
  };

  const handleGstVerification = async () => {
    if (!formData.gstin || formData.gstin.length < 15) {
      alert('Please enter a valid GSTIN (15 characters)');
      return;
    }

    try {
      setGstVerification(prev => ({ ...prev, isVerifying: true }));

      // Create verification task
      const createResponse = await createGstVerificationTask(formData.gstin);

      // Check for different possible response structures
      const requestId = createResponse?.data?.request_id ||
        createResponse?.request_id ||
        createResponse?.taskId ||
        createResponse?.id ||
        createResponse?.task_id ||
        createResponse?.requestId;

      if (createResponse && requestId) {
        // Poll for task completion with timeout and retry limits
        let pollCount = 0;
        const maxPolls = 30; // Maximum 30 polls (60 seconds)
        const pollInterval = 2000; // 2 seconds between polls

        const pollForResult = async () => {
          try {
            pollCount++;
            console.log(`Polling attempt ${pollCount}/${maxPolls} for GST verification result`);

            const getResponse = await getGstVerificationTask(requestId);
            console.log('GST verification task result:', getResponse);

            if (getResponse && getResponse.status === 'success' && getResponse.data && Array.isArray(getResponse.data) && getResponse.data.length > 0) {
              const gstData = getResponse.data[0];

              // Check if task is completed with result data
              if (gstData.status === 'completed' && gstData.result && gstData.result.source_output) {
                const sourceOutput = gstData.result.source_output;

                // Extract trade name and location from the response structure
                const tradeName = sourceOutput?.trade_name || sourceOutput?.legal_name || '';
                const businessAddress = sourceOutput?.principal_place_of_business_fields?.principal_place_of_business_address;
                const location = businessAddress ?
                  `${businessAddress.location || businessAddress.dst || ''}, ${businessAddress.state_name || ''}`.trim() : '';

                setGstVerification(prev => ({
                  ...prev,
                  isVerifying: false,
                  isVerified: true,
                  tradeName: tradeName,
                  location: location,
                  taskId: requestId
                }));
                return; // Stop polling - success!
              }
              // Check if task is still in progress
              else if (gstData.status === 'in_progress') {
                console.log('GST verification still in progress, continuing to poll...');
                if (pollCount >= maxPolls) {
                  // Max polls reached, stop polling
                  setGstVerification(prev => ({ ...prev, isVerifying: false }));
                  alert('GST verification is taking longer than expected. Please try again later.');
                  return;
                } else {
                  // Still processing, poll again after interval
                  setTimeout(pollForResult, pollInterval);
                }
              }
              // Check if task failed
              else if (gstData.status === 'failed') {
                setGstVerification(prev => ({
                  ...prev,
                  isVerifying: false,
                  isVerified: false
                }));
                alert('GST verification failed. Please check your GSTIN.');
                return; // Stop polling
              }
              // Unknown status
              else {
                console.log('Unknown GST verification status:', gstData.status);
                if (pollCount >= maxPolls) {
                  setGstVerification(prev => ({ ...prev, isVerifying: false }));
                  alert('GST verification completed with unknown status. Please try again.');
                  return;
                } else {
                  setTimeout(pollForResult, pollInterval);
                }
              }
            } else {
              console.log('Invalid response structure:', getResponse);
              if (pollCount >= maxPolls) {
                setGstVerification(prev => ({ ...prev, isVerifying: false }));
                alert('GST verification failed due to invalid response. Please try again.');
                return;
              } else {
                setTimeout(pollForResult, pollInterval);
              }
            }
          } catch (error) {
            console.error('Error getting GST verification result:', error);
            if (pollCount >= maxPolls) {
              setGstVerification(prev => ({ ...prev, isVerifying: false }));
              alert('Error verifying GST after multiple attempts. Please try again.');
              return;
            } else {
              // Retry on error for a few attempts
              setTimeout(pollForResult, pollInterval);
            }
          }
        };

        pollForResult();
      } else {
        setGstVerification(prev => ({ ...prev, isVerifying: false }));

        // Check if the response indicates success even without a request ID
        if (createResponse && (createResponse.status === 'success' || createResponse.success === true)) {
          alert('GST verification request submitted successfully, but response structure is unexpected. Please check with support.');
        } else {
          alert(`Failed to create GST verification task. Invalid response structure. Response: ${JSON.stringify(createResponse)}`);
        }
      }
    } catch (error) {
      console.error('GST verification error:', error);
      setGstVerification(prev => ({ ...prev, isVerifying: false }));
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error verifying GST: ${errorMessage}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Convert IFSC code to uppercase
      const processedValue = name === 'ifscCode' ? value.toUpperCase() : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));

      // If latitude or longitude is changed manually, fetch commission for new location
      if ((name === 'latitude' || name === 'longitude') && value) {
        const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude);
        const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude);

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          // Debounce the commission fetch to avoid too many API calls
          setTimeout(() => {
            fetchCommissionForLocation(lat, lng);
          }, 1000);
        }
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = [
      'userName', 'email', 'mobile', 'password', 'confirmPassword',
      'categories', 'storeName', 'panNumber', 'aadharNumber',
      'profileImage', 'aadharCardFront', 'aadharCardBack', 'panCard',
      'storeDescription', 'latitude', 'longitude',
      'bankName', 'accountNumber', 'ifscCode', 'bankAccountName'
    ];

    requiredFields.forEach(field => {
      if (field === 'categories') {
        if (!formData[field] || formData[field].length === 0) {
          newErrors[field] = 'Categories is required';
        }
      } else if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Please enter a valid PAN number';
    }

    // Aadhar validation
    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber.replace(/\D/g, ''))) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting registration data:', formData);

      // Call the registration API
      const response = await registerSeller(formData);

      console.log('Registration successful:', response);

      // Show success message
      showSuccess('Registration Successful', 'Your account has been created successfully! Please check your email for verification.');

      // Redirect to success page after a delay
      setTimeout(() => {
        navigate('/registration-success');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);

      // Show error message
      const errorMessage = error.message || 'Registration failed. Please try again.';
      showError('Registration Failed', errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };


  const sections = [
    { id: 'basic', title: 'Basic Info', icon: User, color: 'blue' },
    { id: 'gst', title: 'GST Info', icon: Building2, color: 'emerald' },
    { id: 'documents', title: 'Documents', icon: FileText, color: 'amber' },
    { id: 'bank', title: 'Bank Details', icon: CreditCard, color: 'indigo' },
    { id: 'description', title: 'Description', icon: FileText, color: 'purple' },
    { id: 'location', title: 'Location', icon: MapPin, color: 'red' }
  ];

  const renderBasicSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          User Name *
        </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.userName ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter name"
        />
        {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter email"
          />
        </div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter mobile number"
          />
        </div>
        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter confirm password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categories *
        </label>

        {/* Categories Dropdown */}
        <div className="relative">
          <select
            name="categorySelect"
            onChange={(e) => {
              if (e.target.value) {
                handleCategorySelect(e.target.value);
                e.target.value = ''; // Reset selection
              }
            }}
            disabled={categoriesLoading}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.categories ? 'border-red-500' : 'border-gray-300'
              } ${categoriesLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {categoriesLoading ? 'Loading categories...' : 'Select Categories'}
            </option>
            {categories
              .filter(category => !formData.categories.some(selectedId =>
                category.id === selectedId ||
                category.id === String(selectedId) ||
                String(category.id) === String(selectedId)
              ))
              .map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        {errors.categories && <p className="text-red-500 text-xs mt-1">{errors.categories}</p>}

        {/* Selected Categories Display */}
        {formData?.categories?.length > 0 && (
          <div className="mb-2 mt-1">
            <div className="flex flex-wrap gap-1">
              {formData.categories.map(categoryId => {
                console.log('Rendering category ID:', categoryId, 'Type:', typeof categoryId);
                console.log('Available categories:', categories);
                // Try multiple comparison methods to handle different data types
                const category = categories.find(cat =>
                  cat.id === categoryId ||
                  cat.id === String(categoryId) ||
                  String(cat.id) === String(categoryId)
                );
                console.log('Found category:', category);
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black border border-gray-300"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryId)}
                      className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      <span className="sr-only">Remove {category.name}</span>
                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ) : (
                  // Fallback display if category not found
                  <span
                    key={categoryId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300"
                  >
                    ID: {categoryId} (Not Found)
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryId)}
                      className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full bg-red-200 hover:bg-red-300 text-red-700 transition-colors"
                    >
                      <span className="sr-only">Remove category {categoryId}</span>
                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Name *
        </label>
        <input
          type="text"
          name="storeName"
          value={formData.storeName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.storeName ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter store name"
        />
        {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store URL
        </label>
        <input
          type="url"
          name="storeUrl"
          value={formData.storeUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter store URL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PAN Number *
        </label>
        <input
          type="text"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.panNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter PAN number"
        />
        {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aadhar Number *
        </label>
        <input
          type="text"
          name="aadharNumber"
          value={formData.aadharNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
            if (value.length <= 12) {
              setFormData(prev => ({ ...prev, aadharNumber: value }));
              // Clear error when user starts typing
              if (errors.aadharNumber) {
                setErrors(prev => ({ ...prev, aadharNumber: '' }));
              }
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.aadharNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter 12-digit Aadhar Number"
          maxLength={12}
        />
        {errors.aadharNumber && <p className="text-red-500 text-xs mt-1">{errors.aadharNumber}</p>}
        {formData.aadharNumber && formData.aadharNumber.length === 12 && !errors.aadharNumber && (
          <p className="text-green-600 text-xs mt-1 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Valid Aadhaar number format
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission *
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
                  Commission updates automatically when you change your location
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderBusinessSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name *
        </label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.businessName ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter business name"
        />
        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Type *
        </label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.businessType ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">Select Business Type</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Registration Number
        </label>
        <input
          type="text"
          name="businessRegistrationNumber"
          value={formData.businessRegistrationNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter registration number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Address *
        </label>
        <textarea
          name="businessAddress"
          value={formData.businessAddress}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.businessAddress ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter complete address"
        />
        {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="City"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="State"
          />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ZIP code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderBankSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name *
        </label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bankName ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter bank name"
        />
        {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Number *
        </label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter account number"
        />
        {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          IFSC Code *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleInputChange}
            className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ifscCode || (formData.ifscCode && !validateIFSC(formData.ifscCode)) ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter IFSC code"
            maxLength={11}
          />
                {!bankVerification.isVerified ? (
                  <button
                    type="button"
                    onClick={handleBankVerification}
                    disabled={bankVerification.isVerifying || !formData.accountNumber || !formData.ifscCode || !validateIFSC(formData.ifscCode)}
                    className={`px-3 py-2 rounded-lg text-xs transition-colors ${bankVerification.isVerifying || !formData.accountNumber || !formData.ifscCode || !validateIFSC(formData.ifscCode)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                  >
                    {bankVerification.isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                ) : (
                  <div className="flex items-center px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-700 font-medium text-xs">Verified</span>
                  </div>
                )}
        </div>
        {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
        {formData.ifscCode && !validateIFSC(formData.ifscCode) && (
          <p className="text-red-500 text-xs mt-1">
            Invalid IFSC Code. Format: 4 letters, 0, 6 alphanumeric (e.g., PUNB0038800).
          </p>
        )}
      </div>

      {/* Bank Verification Results */}
      {bankVerification.isVerified && bankVerification.bankDetails && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-xs font-medium text-green-800">Bank Account Verified Successfully</span>
          </div>
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-medium text-gray-700">Account:</span>
              <span className="ml-1 text-gray-900">{bankVerification.bankDetails.bank_account_number}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">IFSC:</span>
              <span className="ml-1 text-gray-900">{bankVerification.bankDetails.ifsc_code}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Holder:</span>
              <span className="ml-1 text-gray-900">{bankVerification.bankDetails.name_at_bank}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-1 text-gray-900">{bankVerification.bankDetails.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Exists:</span>
              <span className="ml-1 text-gray-900">{bankVerification.bankDetails.account_exists}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank Account Name *
        </label>
        <input
          type="text"
          name="bankAccountName"
          value={formData.bankAccountName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bankAccountName ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter account holder name"
        />
        {errors.bankAccountName && <p className="text-red-500 text-xs mt-1">{errors.bankAccountName}</p>}
      </div>
    </div>
  );



  const renderGstSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-purple-700 mb-2">
          Type
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
      </div>

      {formData.type === 'GST' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GSTIN
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter GSTIN"
              maxLength={15}
            />
            <button
              type="button"
              onClick={handleGstVerification}
              disabled={gstVerification.isVerifying || !formData.gstin}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${gstVerification.isVerifying || !formData.gstin
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
                } text-white`}
            >
              {gstVerification.isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* GST Verification Results */}
          {gstVerification.isVerified && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-1">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-800">GST Verified</span>
              </div>
              {gstVerification.tradeName && (
                <p className="text-xs text-green-700">
                  <strong>Trade Name:</strong> {gstVerification.tradeName}
                </p>
              )}
              {gstVerification.location && (
                <p className="text-xs text-green-700">
                  <strong>Location:</strong> {gstVerification.location}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-1">
            Enrollment Number / UIN
            <span className="ml-2 inline-flex items-center justify-center w-3 h-3 bg-red-100 text-red-600 rounded-full text-xs">
              i
            </span>
          </label>
          <input
            type="text"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter Enrollment Number"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          FSSAI Number (Optional)
        </label>
        <input
          type="text"
          name="fssaiNumber"
          value={formData.fssaiNumber}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter FSSAI Number"
        />
      </div>
    </div>
  );

  const renderDescriptionSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Store Description *
        </label>
        <textarea
          name="storeDescription"
          value={formData.storeDescription}
          onChange={handleInputChange}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.storeDescription ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter your store description here..."
        />
        {errors.storeDescription && <p className="text-red-500 text-xs mt-1">{errors.storeDescription}</p>}
      </div>
    </div>
  );

  const renderLocationSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="State"
          readOnly
        />
        <p className="text-xs text-gray-500 mt-1">State is automatically detected from your location</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="Street"
          readOnly
        />
        <p className="text-xs text-gray-500 mt-1">Street is automatically detected from your location</p>
      </div>

      {/* Location Permission Status */}
      {locationPermission === 'granted' && currentLocation ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <div>
              <p className="text-xs font-medium text-green-800">Location Access Granted</p>
              <p className="text-xs text-green-600">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      ) : locationPermission === 'denied' ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <div>
                <p className="text-xs font-medium text-red-800">Location Access Denied</p>
                <p className="text-xs text-red-600">Enable location or enter manually</p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestLocationAgain}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : locationLoading ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
            <div>
              <p className="text-xs font-medium text-blue-800">Requesting Location Access...</p>
              <p className="text-xs text-blue-600">Please allow location access when prompted</p>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <PlacesAutocomplete
          value={formData.searchLocation}
          onChange={(value) => setFormData(prev => ({ ...prev, searchLocation: value }))}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Search your location (use map below to select precise location)"
        />
        <p className="text-xs text-gray-600 mt-1">
          Search for your location above or use the interactive map below to select your exact shop location
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Latitude *
        </label>
        <input
          type="text"
          name="latitude"
          value={formData.latitude}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.latitude ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Latitude"
        />
        {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Longitude *
        </label>
        <input
          type="text"
          name="longitude"
          value={formData.longitude}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.longitude ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Longitude"
        />
        {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
      </div>

      {/* Map Section */}
      <div className="mt-4">
        <MapComponent
          onLocationSelect={handleMapLocationSelect}
          initialCenter={mapCenter}
          initialZoom={13}
          height="300px"
          width="100%"
        />
      </div>
    </div>
  );

  const renderDocumentsSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image *
        </label>
        <label
          htmlFor="profileImage"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="profileImage"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
            id="profileImage"
          />
          {formData.profileImage && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.profileImage)}
                alt="Profile preview"
                className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.profileImage.name}</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aadhar Card Front *
        </label>
        <label
          htmlFor="aadharCardFront"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="aadharCardFront"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
            id="aadharCardFront"
          />
          {formData.aadharCardFront && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.aadharCardFront)}
                alt="Aadhar front preview"
                className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.aadharCardFront.name}</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aadhar Card Back *
        </label>
        <label
          htmlFor="aadharCardBack"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="aadharCardBack"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
            id="aadharCardBack"
          />
          {formData.aadharCardBack && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.aadharCardBack)}
                alt="Aadhar back preview"
                className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.aadharCardBack.name}</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pan Card *
        </label>
        <label
          htmlFor="panCard"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="panCard"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
            id="panCard"
          />
          {formData.panCard && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.panCard)}
                alt="PAN card preview"
                className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.panCard.name}</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Image
        </label>
        <label
          htmlFor="storeImage"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="storeImage"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png"
            className="hidden"
            id="storeImage"
          />
          {formData.storeImage && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.storeImage)}
                alt="Store image preview"
                className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.storeImage.name}</p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FSSAI Certificate (Optional)
        </label>
        <label
          htmlFor="fssaiCertificate"
          className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-2">Drop Files here or click to upload</p>
          <input
            type="file"
            name="fssaiCertificate"
            onChange={handleInputChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            id="fssaiCertificate"
          />
          {formData.fssaiCertificate && (
            <div className="mt-2">
              {formData.fssaiCertificate.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(formData.fssaiCertificate)}
                  alt="FSSAI certificate preview"
                  className="w-16 h-16 object-cover rounded-lg mx-auto border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto border border-gray-200 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1 truncate">{formData.fssaiCertificate.name}</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic':
        return renderBasicSection();
      case 'gst':
        return renderGstSection();
      case 'documents':
        return renderDocumentsSection();
      case 'bank':
        return renderBankSection();
      case 'description':
        return renderDescriptionSection();
      case 'location':
        return renderLocationSection();
      default:
        return renderBasicSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Seller Complete Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Please Complete the form to complete your registration</p>
          <p className="text-xs text-red-600 mt-1">* Required fields</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-20">
        {/* Progress Sections */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive
                      ? `bg-${section.color}-100 text-${section.color}-700 border border-${section.color}-200`
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center mb-4">
              {React.createElement(sections.find(s => s.id === activeSection)?.icon, {
                className: `w-5 h-5 text-${sections.find(s => s.id === activeSection)?.color}-600 mr-2`
              })}
              <h2 className="text-lg font-semibold text-gray-800">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
            </div>

            {renderSectionContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(sections[currentIndex - 1].id);
                }
              }}
              disabled={activeSection === 'basic'}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeSection === 'basic'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              Previous
            </button>

            {activeSection !== 'location' ? (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-sm font-medium ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  } flex items-center`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Registration;
