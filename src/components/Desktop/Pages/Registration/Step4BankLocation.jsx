import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, MapPin, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { createBankVerificationTask, getBankVerificationTask } from '../../../../api/api.js';
import MapComponent from './Map';
import PlacesAutocomplete from './PlacesAutocomplete';

const Step4BankLocation = ({ formData, setFormData, errors, setErrors }) => {
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Bank verification state
  const [bankVerification, setBankVerification] = useState({
    isVerifying: false,
    isVerified: false,
    requestId: null,
    bankDetails: null
  });

  // Initialize mapCenter from formData if available
  const initialMapCenter = useMemo(() => {
    if (formData.latitude && formData.longitude) {
      return { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) };
    }
    return { lat: 22.8046, lng: 86.2029 };
  }, []); // Only compute once on mount

  const [mapCenter, setMapCenter] = useState(initialMapCenter);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert IFSC code to uppercase
    const processedValue = name === 'ifscCode' ? value.toUpperCase() : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset bank verification if account number or IFSC changes
    if (name === 'accountNumber' || name === 'ifscCode') {
      setBankVerification(prev => ({
        ...prev,
        isVerified: false,
        bankDetails: null
      }));
    }
  };

  // Memoize handleLocationSelect to prevent infinite loops
  const handleLocationSelect = useCallback((location) => {
    // Handle both formats: location.position (from Map) or location directly (from PlacesAutocomplete)
    const position = location.position || location;
    const lat = position.lat || position.latitude;
    const lng = position.lng || position.longitude;

    if (lat && lng) {
      const newCenter = { lat, lng };

      // Only update if coordinates actually changed
      setMapCenter(prev => {
        if (prev.lat === newCenter.lat && prev.lng === newCenter.lng) {
          return prev; // Return same reference to prevent re-render
        }
        return newCenter;
      });

      setFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        placeName: location.name || location.placeName || prev.placeName,
        formattedAddress: location.formattedAddress || prev.formattedAddress,
        searchLocation: location.formattedAddress || location.name || prev.searchLocation
      }));
    }
  }, [setFormData]);

  // Handle bank verification
  const handleBankVerification = async () => {
    // Validate account number and IFSC before verification
    if (!formData.accountNumber.trim() || !/^\d{9,18}$/.test(formData.accountNumber)) {
      alert('Please enter a valid account number (9-18 digits)');
      return;
    }

    if (!formData.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      alert('Please enter a valid IFSC code');
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

                // Auto-populate Bank Name if available
                if (bankDetails.bank_name && !formData.bankName) {
                  setFormData(prev => ({
                    ...prev,
                    bankName: bankDetails.bank_name.trim()
                  }));
                }

                return; // Stop polling - success!
              }
              // Check if task is still in progress
              else if (bankData.status === 'in_progress') {
                console.log('Bank verification still in progress, continuing to poll...');
                if (pollCount >= maxPolls) {
                  // Max polls reached, stop polling
                  setBankVerification(prev => ({ ...prev, isVerifying: false }));
                  alert('Bank verification is taking longer than expected. Please try again later.');
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
                alert('Bank verification failed. Please check your bank details.');
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
        alert('Failed to create bank verification task. Please try again.');
      }
    } catch (error) {
      console.error('Bank verification error:', error);
      setBankVerification(prev => ({ ...prev, isVerifying: false }));
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Bank Verification Error: ${errorMessage}`);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        setLocationPermission('granted');
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setLocationLoading(false);
      }
    );
  };

  const validateStep = () => {
    const newErrors = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Invalid account number';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    if (!formData.bankAccountName.trim()) {
      newErrors.bankAccountName = 'Account holder name is required';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select your location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose validation function to parent component
  useEffect(() => {
    window.validateStep4 = validateStep;
    return () => {
      delete window.validateStep4;
    };
  }, [formData, setErrors]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bank Details & Location</h2>
        <p className="text-gray-600">Complete your bank information and location details</p>
      </div>

      {/* Bank Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Bank Account Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter bank name"
            />
            {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter account number"
            />
            {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter IFSC code"
                style={{ textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={handleBankVerification}
                disabled={bankVerification.isVerifying || !formData.accountNumber || !formData.ifscCode}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${bankVerification.isVerifying || !formData.accountNumber || !formData.ifscCode
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : bankVerification.isVerified
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                title={bankVerification.isVerified ? 'Verified' : 'Verify Bank Account'}
              >
                {bankVerification.isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : bankVerification.isVerified ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  'Verify'
                )}
              </button>
            </div>
            {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}

            {/* Bank Verification Results */}
            {bankVerification.isVerified && bankVerification.bankDetails && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">Bank Account Verified Successfully</span>
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  {bankVerification.bankDetails.account_exists && (
                    <p><strong>Account:</strong> {bankVerification.bankDetails.bank_account_number}</p>
                  )}
                  {bankVerification.bankDetails.ifsc_code && (
                    <p><strong>IFSC:</strong> {bankVerification.bankDetails.ifsc_code}</p>
                  )}
                  {bankVerification.bankDetails.name_at_bank && (
                    <p><strong>Holder:</strong> {bankVerification.bankDetails.name_at_bank}</p>
                  )}
                  {bankVerification.bankDetails.status && (
                    <p><strong>Status:</strong> {bankVerification.bankDetails.status}</p>
                  )}
                  {bankVerification.bankDetails.account_exists && (
                    <p><strong>Exists:</strong> {bankVerification.bankDetails.account_exists}</p>
                  )}
                </div>
              </div>
            )}

            {bankVerification.isVerifying && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
                  <span className="text-sm text-blue-800">Verifying bank account details...</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              name="bankAccountName"
              value={formData.bankAccountName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.bankAccountName ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter account holder name"
            />
            {errors.bankAccountName && <p className="text-red-500 text-sm mt-1">{errors.bankAccountName}</p>}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <MapPin className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Store Location</h3>
        </div>

        <div className="space-y-6">
          {/* Location Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Location *
            </label>
            <PlacesAutocomplete
              value={formData.searchLocation}
              onChange={(value) => setFormData(prev => ({ ...prev, searchLocation: value }))}
              onPlaceSelect={handleLocationSelect}
              placeholder="Search for your store location..."
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Current Location Button */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </>
              )}
            </button>

            {currentLocation && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Location detected</span>
              </div>
            )}
          </div>

          {/* Map Component */}
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
            <MapComponent
              initialCenter={mapCenter}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Location Details */}
          {formData.formattedAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Selected Location:</h4>
              <p className="text-sm text-gray-600">{formData.formattedAddress}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span>Lat: {formData.latitude}</span>
                <span className="mx-2">•</span>
                <span>Lng: {formData.longitude}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Step4BankLocation;
