import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Store,
  Image as ImageIcon,
  Save,
  Edit2,
  X,
  Globe,
  Package,
  Briefcase,
  Shield,
  ChevronRight,
  Search
} from 'lucide-react';
import { useToast } from '../../../../contexts/ToastContext';
import { updateUser } from '../../../../redux/reducer/userReducer';
import { updateSellerProfile, updateSellerProfileNew, getSellerProfile, getAllCities, getSellerCategories } from '../../../../api/api';
import MapComponent from '../Registration/Map';
import { loadGoogleMaps, isGoogleMapsLoaded } from '../../../../utils/googleMaps';

const MyProfile = () => {
  const { user, token } = useSelector((state) => state.user);
  const { showSuccess, showError } = useToast();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('personal');
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [placesServiceReady, setPlacesServiceReady] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobile: '',
    storeName: '',
    storeUrl: '',
    storeDescription: '',
    storeImage: null,
    storeImageUrl: '',
    categories: '',
    categoriesArray: '',
    panNumber: '',
    panCardUrl: '',
    aadharNumber: '',
    aadharCardFrontUrl: '',
    aadharCardBackUrl: '',
    gstin: '',
    gstType: '',
    enrollmentNumber: '',
    verifiedGstDetails: null,
    taxName: '',
    taxNumber: '',
    fssaiNumber: '',
    fssaiCertificateUrl: '',
    cityId: '',
    state: '',
    street: '',
    placeName: '',
    formattedAddress: '',
    latitude: '',
    longitude: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankAccountName: '',
    commission: '',
    profileImage: null,
    profileImageUrl: '',
  });

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.seller?.id && token) {
        try {
          setIsLoading(true);
          const response = await getSellerProfile(user.seller.id, token);
          
          if (response.status === 1 && response.data) {
            const profileData = response.data;
            setFormData({
              userName: profileData.name || '',
              email: profileData.email || '',
              mobile: profileData.mobile || '',
              storeName: profileData.store_name || '',
              storeUrl: profileData.store_url || '',
              storeDescription: profileData.store_description?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
              storeImage: null,
              storeImageUrl: profileData.logo_url || '',
              categories: profileData.categories || '',
              categoriesArray: profileData.categories_array || '',
              panNumber: profileData.pan_number || '',
              panCardUrl: profileData.pan_card_url || '',
              aadharNumber: profileData.aadhar_number || '',
              aadharCardFrontUrl: profileData.national_identity_card_url || '',
              aadharCardBackUrl: profileData.address_proof_url || '',
              gstin: profileData.gstin || '',
              gstType: profileData.gst_type || '',
              enrollmentNumber: profileData.enrollment_number || '',
              verifiedGstDetails: profileData.verified_gst_details ? JSON.parse(profileData.verified_gst_details) : null,
              taxName: profileData.tax_name || '',
              taxNumber: profileData.tax_number || '',
              fssaiNumber: profileData.fssai_lic_no || '',
              fssaiCertificateUrl: profileData.fssai_certificate_url || '',
              cityId: profileData.city_id || '',
              state: profileData.state || '',
              street: profileData.street || '',
              placeName: profileData.place_name || '',
              formattedAddress: profileData.formatted_address || '',
              latitude: profileData.latitude || '',
              longitude: profileData.longitude || '',
              bankName: profileData.bank_name || '',
              accountNumber: profileData.account_number || '',
              ifscCode: profileData.bank_ifsc_code || '',
              bankAccountName: profileData.account_name || '',
              commission: profileData.commission || '',
              profileImageUrl: profileData.profile_image_url || '',
              profileImage: null,
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          showError('Error', error.message || 'Failed to load profile data');
          
          // Fallback to user data from Redux if API fails
          if (user) {
            setFormData({
              userName: user.username || user.name || '',
              email: user.email || '',
              mobile: user.mobile || '',
              storeName: user.seller?.store_name || '',
              storeUrl: user.seller?.slug || '',
              storeDescription: user.seller?.store_description || '',
              storeImage: null,
              storeImageUrl: user.seller?.logo_url || '',
              categories: user.seller?.categories || '',
              categoriesArray: user.seller?.categories_array || '',
              panNumber: user.seller?.pan_number || '',
              panCardUrl: user.seller?.pan_card_url || '',
              aadharNumber: user.seller?.aadhar_number || '',
              aadharCardFrontUrl: user.seller?.national_identity_card_url || '',
              aadharCardBackUrl: user.seller?.address_proof_url || '',
              gstin: user.seller?.gstin || '',
              gstType: user.seller?.gst_type || '',
              enrollmentNumber: user.seller?.enrollment_number || '',
              verifiedGstDetails: user.seller?.verified_gst_details ? JSON.parse(user.seller.verified_gst_details) : null,
              taxName: user.seller?.tax_name || '',
              taxNumber: user.seller?.tax_number || '',
              fssaiNumber: user.seller?.fssai_lic_no || '',
              fssaiCertificateUrl: user.seller?.fssai_certificate_url || '',
              cityId: user.seller?.city_id || '',
              state: user.seller?.state || '',
              street: user.seller?.street || '',
              placeName: user.seller?.place_name || '',
              formattedAddress: user.seller?.formatted_address || '',
              latitude: user.seller?.latitude || '',
              longitude: user.seller?.longitude || '',
              bankName: user.seller?.bank_name || '',
              accountNumber: user.seller?.account_number || '',
              ifscCode: user.seller?.bank_ifsc_code || '',
              bankAccountName: user.seller?.account_name || '',
              commission: user.seller?.commission || '',
              profileImageUrl: user.seller?.profile_image_url || user.image || '',
              profileImage: null,
            });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.seller?.id, token]);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      if (token) {
        try {
          const response = await getAllCities(token);
          if (response.status === 1 && response.data) {
            setCities(response.data);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
          showError('Error', 'Failed to load cities');
        }
      }
    };

    fetchCities();
  }, [token]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getSellerCategories();
        if (response.status === 1 && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        showError('Error', 'Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Initialize Google Places API
  useEffect(() => {
    const initializePlacesService = async () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.AutocompleteService();
        window.placesService = service;
        setPlacesServiceReady(true);
        console.log('Google Places service initialized');
      } else {
        // Try to load Google Maps if not already loaded
        if (!isGoogleMapsLoaded()) {
          console.log('Google Maps not loaded, attempting to load...');
          try {
            const apiKey = import.meta.env.VITE_APP_MAP_API || 'AIzaSyDG1cyP1_WXZ5kvWiE6NDJmGc10Dhds5X8';
            await loadGoogleMaps(apiKey);
            console.log('Google Maps loaded successfully');
          } catch (error) {
            console.error('Failed to load Google Maps:', error);
          }
        }
        
        // Retry after a short delay
        console.log('Google Maps not ready, retrying in 1 second...');
        setTimeout(initializePlacesService, 1000);
      }
    };

    // Wait a bit longer for Google Maps to load from the Map component
    setTimeout(initializePlacesService, 2000);
  }, []);

  // Close location suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationSuggestions && !event.target.closest('.location-suggestions')) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationSuggestions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Profile image must be less than 5MB');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
        // Call API to update profile
        const response = await updateSellerProfileNew(
          user?.seller?.id || user?.id, // id
          user?.id, // admin_id
          formData.userName, // name
          formData.email, // email
          formData.mobile, // mobile
          formData.storeUrl, // store_url
          '', // password
          '', // confirm_password
          formData.storeName, // store_name
          formData.street, // street
          '', // pincode_id
          formData.cityId, // city_id
          formData.categories, // categories_ids
          formData.state, // state
          '', // remark
          formData.accountNumber, // account_number
          formData.ifscCode, // ifsc_code
          formData.bankName, // bank_name
          formData.bankAccountName, // account_name
          2, // commission (default)
          formData.taxName, // tax_name
          formData.taxNumber, // tax_number
          formData.panNumber, // pan_number
          formData.latitude, // latitude
          formData.longitude, // longitude
          formData.placeName, // place_name
          formData.formattedAddress, // formatted_address
          formData.storeDescription, // store_description
          1, // require_products_approval
          1, // customer_privacy
          0, // view_order_otp
          0, // assign_delivery_boy
          0, // change_order_status_delivered
          1, // status
          formData.storeImage, // store_logo
          formData.aadharCardFront, // national_id_card
          formData.aadharCardBack, // address_proof
          formData.profileImage, // profile_image
          formData.panCard, // pan_card
          formData.fssaiCertificate, // fssai_certificate
          formData.fssaiNumber, // fssai_lic_no
          token
        );
      
      if (response.status === 1) {
        // Update Redux store
        dispatch(updateUser({
          username: formData.userName,
          email: formData.email,
          mobile: formData.mobile,
        }));
        
        showSuccess('Profile Updated', 'Your profile has been updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      showError('Update Failed', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    // Refetch the data to reset form
    if (user?.seller?.id && token) {
      try {
        const response = await getSellerProfile(user.seller.id, token);
        if (response.status === 1 && response.data) {
          const profileData = response.data;
          setFormData({
            userName: profileData.name || '',
            email: profileData.email || '',
            mobile: profileData.mobile || '',
            storeName: profileData.store_name || '',
            storeUrl: profileData.store_url || '',
            storeDescription: profileData.store_description?.replace(/<[^>]*>/g, '') || '',
            storeImage: null,
            storeImageUrl: profileData.logo_url || '',
            categories: profileData.categories || '',
            categoriesArray: profileData.categories_array || '',
            panNumber: profileData.pan_number || '',
            panCardUrl: profileData.pan_card_url || '',
            aadharNumber: profileData.aadhar_number || '',
            aadharCardFrontUrl: profileData.national_identity_card_url || '',
            aadharCardBackUrl: profileData.address_proof_url || '',
            gstin: profileData.gstin || '',
            gstType: profileData.gst_type || '',
            enrollmentNumber: profileData.enrollment_number || '',
            verifiedGstDetails: profileData.verified_gst_details ? JSON.parse(profileData.verified_gst_details) : null,
            taxName: profileData.tax_name || '',
            taxNumber: profileData.tax_number || '',
            fssaiNumber: profileData.fssai_lic_no || '',
            fssaiCertificateUrl: profileData.fssai_certificate_url || '',
            cityId: profileData.city_id || '',
            state: profileData.state || '',
            street: profileData.street || '',
            placeName: profileData.place_name || '',
            formattedAddress: profileData.formatted_address || '',
            latitude: profileData.latitude || '',
            longitude: profileData.longitude || '',
            bankName: profileData.bank_name || '',
            accountNumber: profileData.account_number || '',
            ifscCode: profileData.bank_ifsc_code || '',
            bankAccountName: profileData.account_name || '',
            commission: profileData.commission || '',
            profileImageUrl: profileData.profile_image_url || '',
            profileImage: null,
          });
        }
      } catch (error) {
        console.error('Error resetting profile:', error);
      }
    }
    setIsEditing(false);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    if (!selectedCities.find(c => c.id === city.id)) {
      setSelectedCities(prev => [...prev, city]);
      setFormData(prev => ({
        ...prev,
        cityId: selectedCities.map(c => c.id).join(',')
      }));
    }
  };

  // Handle city removal
  const handleCityRemove = (cityId) => {
    setSelectedCities(prev => prev.filter(c => c.id !== cityId));
    setFormData(prev => ({
      ...prev,
      cityId: selectedCities.filter(c => c.id !== cityId).map(c => c.id).join(',')
    }));
  };

  // Handle location search
  const handleLocationSearch = async (query) => {
    console.log('Location search triggered with query:', query);
    
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    if (!window.placesService) {
      console.log('Places service not available, retrying...');
      // Try to initialize again
      if (window.google && window.google.maps && window.google.maps.places) {
        window.placesService = new window.google.maps.places.AutocompleteService();
      } else {
        console.error('Google Maps or Places API not loaded');
        return;
      }
    }

    try {
      const request = {
        input: query,
        types: ['establishment', 'geocode']
      };

      console.log('Making Places API request:', request);

      window.placesService.getPlacePredictions(request, (predictions, status) => {
        console.log('Places API response:', { predictions, status });
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          console.log('Setting location suggestions:', predictions);
          setLocationSuggestions(predictions);
          setShowLocationSuggestions(true);
        } else {
          console.log('No predictions or error status:', status);
          setLocationSuggestions([]);
          setShowLocationSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (!selectedCategories.find(c => c.id === category.id)) {
      setSelectedCategories(prev => [...prev, category]);
      setFormData(prev => ({
        ...prev,
        categories: selectedCategories.map(c => c.id).join(',')
      }));
    }
  };

  // Handle category removal
  const handleCategoryRemove = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
    setFormData(prev => ({
      ...prev,
      categories: selectedCategories.filter(c => c.id !== categoryId).map(c => c.id).join(',')
    }));
  };

  // Handle location selection
  const handleLocationSelect = (place) => {
    setFormData(prev => ({
      ...prev,
      placeName: place.description
    }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);

    // Get place details to get coordinates
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId: place.place_id,
          fields: ['geometry', 'formatted_address', 'name']
        },
        (placeDetails, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
            const location = placeDetails.geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            console.log('Selected location coordinates:', { lat, lng });
            
            // Update form data with coordinates
            setFormData(prev => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lng.toString(),
              formattedAddress: placeDetails.formatted_address || place.description
            }));

            // Update map center by triggering a re-render
            // The map component will pick up the new coordinates from formData
            console.log('Map should update to new location:', { lat, lng });
          } else {
            console.error('Failed to get place details:', status);
          }
        }
      );
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm active:bg-green-600 transition-colors flex items-center space-x-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">Manage your personal and business information</p>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full cursor-pointer active:bg-green-600 transition-colors">
                <ImageIcon className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{formData.userName || 'User Name'}</h3>
            <p className="text-sm text-gray-500">{formData.email || 'email@example.com'}</p>
            <div className="mt-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium inline-block">
              Verified Seller
            </div>
          </div>
        </div>
      </div>

      {/* Store Quick Info */}
      <div className="bg-white border-b border-gray-200 p-4 mb-2">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <Store className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Store</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{formData.storeName || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Commission</p>
            <p className="text-sm font-semibold text-gray-800">{formData.commission ? `${formData.commission}%` : 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <MapPin className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{formData.placeName || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white border-b border-gray-200 mb-2">
        <button
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800">Personal Information</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'personal' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'personal' && (
          <div className="px-4 pb-4 space-y-4">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-3 h-3 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-3 h-3 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-3 h-3 inline mr-1" />
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="w-3 h-3 inline mr-1" />
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* PAN Card Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="w-3 h-3 inline mr-1" />
                PAN Card Document
              </label>
              {formData.panCardUrl && formData.panCardUrl !== 'null' ? (
                <a 
                  href={formData.panCardUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={formData.panCardUrl} 
                    alt="PAN Card" 
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  />
                </a>
              ) : (
                <p className="text-xs text-gray-500">No document uploaded</p>
              )}
            </div>

            {/* GST/UIN Number */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                {formData.gstin && formData.gstin !== 'null' ? 'GST Number (GSTIN)' : 
                 formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? 'Enrollment Number (UIN)' : 
                 'GST/UIN Number'}
              </label>
              <input
                type="text"
                name={formData.gstin && formData.gstin !== 'null' ? 'gstin' : 'enrollmentNumber'}
                value={formData.gstin && formData.gstin !== 'null' ? formData.gstin : formData.enrollmentNumber || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder={formData.gstin && formData.gstin !== 'null' ? 'You have GST' : 
                            formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? 'You have Enrollment Number (UIN)' : 
                            'No GST/UIN available'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
              
              {/* Display Verified GST Details - Only show if GST is available, not UIN */}
              {formData.verifiedGstDetails && formData.gstin && formData.gstin !== 'null' && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-xs font-semibold text-green-800 mb-1">Verified GST Details</h4>
                  <div className="space-y-1 text-xs text-gray-700">
                    {formData.verifiedGstDetails.activeStatus && (
                      <p><span className="font-medium">Status:</span> {formData.verifiedGstDetails.activeStatus}</p>
                    )}
                    {formData.verifiedGstDetails.leagleName && (
                      <p><span className="font-medium">Legal Name:</span> {formData.verifiedGstDetails.leagleName}</p>
                    )}
                    {formData.verifiedGstDetails.trade_name && (
                      <p><span className="font-medium">Trade Name:</span> {formData.verifiedGstDetails.trade_name}</p>
                    )}
                    {formData.verifiedGstDetails.bussiness_address && (
                      <div>
                        <p className="font-medium">Business Address:</p>
                        <p className="ml-3">
                          {formData.verifiedGstDetails.bussiness_address.street && `${formData.verifiedGstDetails.bussiness_address.street}, `}
                          {formData.verifiedGstDetails.bussiness_address.location && `${formData.verifiedGstDetails.bussiness_address.location}, `}
                          {formData.verifiedGstDetails.bussiness_address.district && `${formData.verifiedGstDetails.bussiness_address.district}, `}
                          {formData.verifiedGstDetails.bussiness_address.state && `${formData.verifiedGstDetails.bussiness_address.state} `}
                          {formData.verifiedGstDetails.bussiness_address.pincode && `- ${formData.verifiedGstDetails.bussiness_address.pincode}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Aadhar Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-3 h-3 inline mr-1" />
                Aadhar Number
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Aadhar Card Front */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-3 h-3 inline mr-1" />
                Aadhar Card Front
              </label>
              {formData.aadharCardFrontUrl && formData.aadharCardFrontUrl !== 'null' ? (
                <a 
                  href={formData.aadharCardFrontUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={formData.aadharCardFrontUrl} 
                    alt="Aadhar Card Front" 
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  />
                </a>
              ) : (
                <p className="text-xs text-gray-500">No document uploaded</p>
              )}
            </div>

            {/* Aadhar Card Back */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-3 h-3 inline mr-1" />
                Aadhar Card Back
              </label>
              {formData.aadharCardBackUrl && formData.aadharCardBackUrl !== 'null' ? (
                <a 
                  href={formData.aadharCardBackUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src={formData.aadharCardBackUrl} 
                    alt="Aadhar Card Back" 
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  />
                </a>
              ) : (
                <p className="text-xs text-gray-500">No document uploaded</p>
              )}
            </div>

            {/* GST/Enrollment Section */}
            {formData.gstin && formData.gstin !== 'null' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-3 h-3 inline mr-1" />
                    GSTIN
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
                <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                  ✓ You Have GST
                </div>
              </>
            ) : formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Enrollment Number (UIN)
                  </label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={formData.enrollmentNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
                <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                  ✓ You Have Enrollment Number
                </div>
              </>
            ) : (
              <div className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs">
                No GST or Enrollment Number available
              </div>
            )}

            {/* Tax Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                Tax Name
              </label>
              <input
                type="text"
                name="taxName"
                value={formData.taxName && formData.taxName !== 'null' ? formData.taxName : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Tax Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                Tax Number
              </label>
              <input
                type="text"
                name="taxNumber"
                value={formData.taxNumber && formData.taxNumber !== 'null' ? formData.taxNumber : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* FSSAI Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="w-3 h-3 inline mr-1" />
                FSSAI License Number
              </label>
              <input
                type="text"
                name="fssaiNumber"
                value={formData.fssaiNumber && formData.fssaiNumber !== 'null' ? formData.fssaiNumber : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* FSSAI Certificate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="w-3 h-3 inline mr-1" />
                FSSAI Certificate
              </label>
              {formData.fssaiCertificateUrl && formData.fssaiCertificateUrl !== 'null' ? (
                <a 
                  href={formData.fssaiCertificateUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  View Certificate (PDF)
                </a>
              ) : (
                <p className="text-xs text-gray-500">No certificate uploaded</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Business Information Section */}
      <div className="bg-white border-b border-gray-200 mb-2">
        <button
          onClick={() => toggleSection('business')}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Store className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800">Business Information</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'business' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'business' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Store className="w-3 h-3 inline mr-1" />
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Store URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-3 h-3 inline mr-1" />
                Store URL Slug
              </label>
              <input
                type="text"
                name="storeUrl"
                value={formData.storeUrl}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                Store Description
              </label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Store Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Store className="w-3 h-3 inline mr-1" />
                Store Logo/Image
              </label>
              {formData.storeImageUrl && formData.storeImageUrl !== 'null' ? (
                <div className="space-y-2">
                  <img 
                    src={formData.storeImageUrl} 
                    alt="Store Logo" 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <a 
                    href={formData.storeImageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"
                  >
                    <ImageIcon className="w-3 h-3 mr-2" />
                    View Full Image
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No store image uploaded</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="w-3 h-3 inline mr-1" />
                Categories
              </label>
              <div className="relative">
                <select
                  name="categories"
                  onChange={(e) => {
                    const categoryId = e.target.value;
                    if (categoryId) {
                      const category = categories.find(c => c.id.toString() === categoryId);
                      if (category) {
                        handleCategorySelect(category);
                      }
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                >
                  <option value="">Select categories...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selected Categories */}
              {selectedCategories.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.map(category => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                      >
                        {category.name}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleCategoryRemove(category.id)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GST/UIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                GST/UIN
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {formData.gstin && formData.gstin !== 'null' ? (
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">You have GST</p>
                      <p className="text-xs text-gray-600 mt-1">GSTIN: {formData.gstin}</p>
                    </div>
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Shield className="w-2 h-2 mr-1" />
                        GST
                      </span>
                    </div>
                  </div>
                ) : formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? (
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">You have Enrollment Number (UIN)</p>
                      <p className="text-xs text-gray-600 mt-1">UIN: {formData.enrollmentNumber}</p>
                    </div>
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <Shield className="w-2 h-2 mr-1" />
                        UIN
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No GST/UIN details available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Information Section */}
      <div className="bg-white border-b border-gray-200 mb-2">
        <button
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800">Location Information</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'location' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'location' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Search City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Search City
              </label>
              <div className="relative">
                <select
                  name="cityId"
                  onChange={(e) => {
                    const cityId = e.target.value;
                    if (cityId) {
                      const city = cities.find(c => c.id.toString() === cityId);
                      if (city) {
                        handleCitySelect(city);
                      }
                    }
                  }}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                >
                  <option value="">Select cities...</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selected Cities */}
              {selectedCities.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedCities.map(city => (
                      <span
                        key={city.id}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                      >
                        {city.name}, {city.state}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleCityRemove(city.id)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Search Location
              </label>
              <div className="relative">
                  <input
                    type="text"
                    name="placeName"
                    value={formData.placeName && formData.placeName !== 'null' ? formData.placeName : ''}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, placeName: e.target.value }));
                      handleLocationSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (formData.placeName && formData.placeName.length >= 3) {
                        handleLocationSearch(formData.placeName);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder={placesServiceReady ? "Search for your location..." : "Loading location services..."}
                    className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                  />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                
                {/* Location Suggestions */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="location-suggestions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <div className="text-xs text-gray-900">{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state && formData.state !== 'null' ? formData.state : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Street */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 className="w-3 h-3 inline mr-1" />
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street && formData.street !== 'null' ? formData.street : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Place Name / Search Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Place Name / Search Location
              </label>
              <input
                type="text"
                name="placeName"
                value={formData.placeName && formData.placeName !== 'null' ? formData.placeName : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Complete Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Complete Address
              </label>
              <textarea
                name="formattedAddress"
                value={formData.formattedAddress && formData.formattedAddress !== 'null' ? formData.formattedAddress : ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Latitude
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />
                Longitude
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Map Section */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Location Map</h4>
              <MapComponent
                key={`map-${formData.latitude}-${formData.longitude}`}
                onLocationSelect={(locationData) => {
                  if (locationData.position) {
                    setFormData(prev => ({
                      ...prev,
                      latitude: locationData.position.lat.toString(),
                      longitude: locationData.position.lng.toString()
                    }));
                  }
                }}
                initialCenter={
                  formData.latitude && formData.longitude && formData.latitude !== 'null' && formData.longitude !== 'null'
                    ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
                    : { lat: 22.8046, lng: 86.2029 } // Default to Jamshedpur
                }
                initialZoom={13}
                height="300px"
                width="100%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bank Information Section */}
      <div className="bg-white border-b border-gray-200 mb-2">
        <button
          onClick={() => toggleSection('bank')}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-800">Bank Account Details</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'bank' ? 'rotate-90' : ''}`} />
        </button>
        {expandedSection === 'bank' && (
          <div className="px-4 pb-4 space-y-4">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building2 className="w-3 h-3 inline mr-1" />
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-3 h-3 inline mr-1" />
                Account Holder Name
              </label>
              <input
                type="text"
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="w-3 h-3 inline mr-1" />
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-3 h-3 inline mr-1" />
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyProfile;

