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
  CheckCircle,
  Globe,
  Package,
  Briefcase,
  Shield,
  Search
} from 'lucide-react';
import { useToast } from '../../../../contexts/ToastContext';
import { updateUser } from '../../../../redux/reducer/userReducer';
import { updateSellerProfile, updateSellerProfileNew, getSellerProfile, getAllCities, getSellerCategories } from '../../../../api/api';
import MapComponent from '../Registration/Map';
import { loadGoogleMaps, isGoogleMapsLoaded } from '../../../../utils/googleMaps';

const MyProfile = () => {
  const { user, token } = useSelector((state) => state.user);
  const { showSuccess, showError, showInfo } = useToast();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

          if (response?.status === 1 && response?.data) {
            const profileData = response?.data;

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
          console.log(response?.data)
          console.log(categories)
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
            verifiedGstDetails: profileData.verified_gst_details
              ? JSON.parse(profileData.verified_gst_details)
              : null,

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal and business information</p>
        </div>
        <div className="flex items-center gap-2 mt-5">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-gray-200">
                  {formData.profileImageUrl ? (
                    <img
                      src={formData.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-semibold text-gray-800">{formData.userName || 'User Name'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formData.email || 'email@example.com'}</p>
                <div className="mt-2 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-[11px] font-semibold inline-flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Seller
                </div>
              </div>
            </div>
          </div>

          {/* Store Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Store Information</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Store Name</p>
                  <p className="text-xs font-medium text-gray-800 truncate">{formData.storeName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Store URL</p>
                  <p className="text-xs font-medium text-gray-800 truncate">{formData.storeUrl || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Commission</p>
                  <p className="text-xs font-medium text-gray-800">{formData.commission ? `${formData.commission}%` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <User className="w-3 h-3 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Phone className="w-3 h-3 inline mr-1" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* PAN Card Image */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  PAN Card Document
                </label>
                {formData.panCardUrl && formData.panCardUrl !== 'null' ? (
                  <a
                    href={formData.panCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={formData.panCardUrl}
                      alt="PAN Card"
                      className="w-32 h-20 object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    />
                  </a>
                ) : (
                  <p className="text-xs text-gray-500">No document uploaded</p>
                )}
              </div>

              {/* GST/UIN Number */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />

                {/* Display Verified GST Details - Only show if GST is available, not UIN */}
                {formData.verifiedGstDetails && formData.gstin && formData.gstin !== 'null' && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="text-xs font-semibold text-green-800 mb-1.5">Verified GST Details</h4>
                    <div className="space-y-0.5 text-xs text-gray-700">
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
                          <p className="ml-2 text-[11px]">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Aadhar Card Front */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Aadhar Card Front
                </label>
                {formData.aadharCardFrontUrl && formData.aadharCardFrontUrl !== 'null' ? (
                  <a
                    href={formData.aadharCardFrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={formData.aadharCardFrontUrl}
                      alt="Aadhar Card Front"
                      className="w-32 h-20 object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    />
                  </a>
                ) : (
                  <p className="text-xs text-gray-500">No document uploaded</p>
                )}
              </div>

              {/* Aadhar Card Back */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Aadhar Card Back
                </label>
                {formData.aadharCardBackUrl && formData.aadharCardBackUrl !== 'null' ? (
                  <a
                    href={formData.aadharCardBackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={formData.aadharCardBackUrl}
                      alt="Aadhar Card Back"
                      className="w-32 h-20 object-cover rounded-md border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <FileText className="w-3 h-3 inline mr-1" />
                      GSTIN
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium inline-flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      You Have GST
                    </div>
                  </div>
                </>
              ) : formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <FileText className="w-3 h-3 inline mr-1" />
                      Enrollment Number (UIN)
                    </label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium inline-flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      You Have UIN
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <div className="px-2.5 py-1.5 bg-gray-50 text-gray-600 rounded-md text-xs">
                    No GST or Enrollment Number available
                  </div>
                </div>
              )}

              {/* Tax Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Tax Name
                </label>
                <input
                  type="text"
                  name="taxName"
                  value={formData.taxName && formData.taxName !== 'null' ? formData.taxName : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Tax Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Tax Number
                </label>
                <input
                  type="text"
                  name="taxNumber"
                  value={formData.taxNumber && formData.taxNumber !== 'null' ? formData.taxNumber : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* FSSAI Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  FSSAI License Number
                </label>
                <input
                  type="text"
                  name="fssaiNumber"
                  value={formData.fssaiNumber && formData.fssaiNumber !== 'null' ? formData.fssaiNumber : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* FSSAI Certificate */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  FSSAI Certificate
                </label>
                {formData.fssaiCertificateUrl && formData.fssaiCertificateUrl !== 'null' ? (
                  <a
                    href={formData.fssaiCertificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-1.5" />
                    View Certificate (PDF)
                  </a>
                ) : (
                  <p className="text-xs text-gray-500">No certificate uploaded</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Business Information</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Store className="w-3 h-3 inline mr-1" />
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Store URL */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Store URL Slug
                </label>
                <input
                  type="text"
                  name="storeUrl"
                  value={formData.storeUrl}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Store Description
                </label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Store Image */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Store className="w-3 h-3 inline mr-1" />
                  Store Logo/Image
                </label>
                {formData.storeImageUrl && formData.storeImageUrl !== 'null' ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={formData.storeImageUrl}
                      alt="Store Logo"
                      className="w-16 h-16 object-cover rounded-md border border-gray-200"
                    />
                    <a
                      href={formData.storeImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <ImageIcon className="w-3 h-3 mr-1.5" />
                      View Full Image
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No store image uploaded</p>
                )}
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
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
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategories.map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs"
                        >
                          {category.name}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleCategoryRemove(category.id)}
                              className="ml-1.5 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GST/UIN */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  GST/UIN
                </label>
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  {formData.gstin && formData.gstin !== 'null' ? (
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">You have GST</p>
                        <p className="text-sm text-gray-600 mt-1">GSTIN: {formData.gstin}</p>
                      </div>
                      <div className="ml-3">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3 mr-1" />
                          GST Registered
                        </span>
                      </div>
                    </div>
                  ) : formData.enrollmentNumber && formData.enrollmentNumber !== 'null' ? (
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">You have Enrollment Number (UIN)</p>
                        <p className="text-sm text-gray-600 mt-1">UIN: {formData.enrollmentNumber}</p>
                      </div>
                      <div className="ml-3">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3 mr-1" />
                          UIN Registered
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No GST/UIN details available</p>
                  )}
                </div>
              </div> */}
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search City */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
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
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCities.map(city => (
                        <span
                          key={city.id}
                          className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs"
                        >
                          {city.name}, {city.state}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleCityRemove(city.id)}
                              className="ml-1.5 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                  />
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />

                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="location-suggestions absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state && formData.state !== 'null' ? formData.state : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Street */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street && formData.street !== 'null' ? formData.street : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Complete Formatted Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Complete Address
                </label>
                <textarea
                  name="formattedAddress"
                  value={formData.formattedAddress && formData.formattedAddress !== 'null' ? formData.formattedAddress : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
            </div>

            {/* Map Section */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Location Map</h4>
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
                height="350px"
                width="100%"
              />
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Bank Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <User className="w-3 h-3 inline mr-1" />
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="bankAccountName"
                  value={formData.bankAccountName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FileText className="w-3 h-3 inline mr-1" />
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

