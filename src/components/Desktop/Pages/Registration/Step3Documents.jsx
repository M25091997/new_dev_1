import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react';

const Step3Documents = ({ formData, setFormData, errors, setErrors }) => {
  const [uploading, setUploading] = useState({});
  const [profileImageFromAadhaar, setProfileImageFromAadhaar] = useState(null);

  // Set up global function to update profile image from Aadhaar
  useEffect(() => {
    window.updateProfileImageFromAadhaar = (photoBase64) => {
      if (photoBase64) {
        try {
          // Convert base64 to blob
          const byteCharacters = atob(photoBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          
          // Create a file-like object
          const file = new File([blob], 'aadhaar-photo.jpg', { type: 'image/jpeg' });
          
          setProfileImageFromAadhaar(photoBase64);
          setFormData(prev => ({
            ...prev,
            profileImage: file
          }));
        } catch (error) {
          console.error('Error processing Aadhaar photo:', error);
        }
      }
    };

    return () => {
      delete window.updateProfileImageFromAadhaar;
    };
  }, [setFormData]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Clear error when file is selected
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile image is required';
    }
    
    if (!formData.aadharCardFront) {
      newErrors.aadharCardFront = 'Aadhaar card front is required';
    }
    
    if (!formData.aadharCardBack) {
      newErrors.aadharCardBack = 'Aadhaar card back is required';
    }
    
    if (!formData.panCard) {
      newErrors.panCard = 'PAN card is required';
    }
    
    if (!formData.storeImage) {
      newErrors.storeImage = 'Store image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderFileUpload = (fieldName, label, required = true, accept = ".jpg,.jpeg,.png", isAadhaarUpdated = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
        {isAadhaarUpdated && fieldName === 'profileImage' && profileImageFromAadhaar && (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            From Aadhaar
          </span>
        )}
      </label>
      <label
        htmlFor={fieldName}
        className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          errors[fieldName] 
            ? 'border-red-300 bg-red-50 hover:border-red-400' 
            : isAadhaarUpdated && fieldName === 'profileImage' && profileImageFromAadhaar
            ? 'border-green-300 bg-green-50 hover:border-green-400'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          type="file"
          id={fieldName}
          name={fieldName}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        
        {formData[fieldName] ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              {formData[fieldName].type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(formData[fieldName])}
                  alt={`${label} preview`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 truncate max-w-32">{formData[fieldName].name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  removeFile(fieldName);
                  if (fieldName === 'profileImage' && profileImageFromAadhaar) {
                    setProfileImageFromAadhaar(null);
                  }
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          </div>
        )}
      </label>
      {errors[fieldName] && <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>}
      {isAadhaarUpdated && fieldName === 'profileImage' && profileImageFromAadhaar && (
        <p className="text-green-600 text-sm mt-1 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Profile image automatically set from Aadhaar verification
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Documents & Verification</h2>
        <p className="text-gray-600">Upload required documents for verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image */}
        {renderFileUpload('profileImage', 'Profile Image', true, ".jpg,.jpeg,.png", true)}

        {/* Store Image */}
        {renderFileUpload('storeImage', 'Store Image', true)}

        {/* Aadhaar Card Front */}
        {renderFileUpload('aadharCardFront', 'Aadhaar Card Front', true)}

        {/* Aadhaar Card Back */}
        {renderFileUpload('aadharCardBack', 'Aadhaar Card Back', true)}

        {/* PAN Card */}
        {renderFileUpload('panCard', 'PAN Card', true)}

        {/* FSSAI Certificate (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            FSSAI Certificate (Optional)
          </label>
          <label
            htmlFor="fssaiCertificate"
            className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              errors.fssaiCertificate 
                ? 'border-red-300 bg-red-50 hover:border-red-400' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              id="fssaiCertificate"
              name="fssaiCertificate"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            
            {formData.fssaiCertificate ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  {formData.fssaiCertificate.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(formData.fssaiCertificate)}
                      alt="FSSAI certificate preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-red-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600 truncate max-w-32">{formData.fssaiCertificate.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile('fssaiCertificate');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            )}
          </label>
          {errors.fssaiCertificate && <p className="text-red-500 text-sm mt-1">{errors.fssaiCertificate}</p>}
        </div>
      </div>

      {/* FSSAI Number (if certificate uploaded) */}
      {formData.fssaiCertificate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            FSSAI Number
          </label>
          <input
            type="text"
            name="fssaiNumber"
            value={formData.fssaiNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, fssaiNumber: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter FSSAI number"
          />
        </div>
      )}

      {/* Store Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Description
        </label>
        <textarea
          name="storeDescription"
          value={formData.storeDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, storeDescription: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your store and business..."
        />
      </div>

      {/* Validation function for parent component */}
      <div style={{ display: 'none' }}>
        {validateStep && (window.validateStep3 = validateStep)}
      </div>
    </div>
  );
};

export default Step3Documents;
