import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { registerSeller } from '../../../api/api.js';
import { useToast } from '../../../contexts/ToastContext';
import Step1BasicInfo from './Registration/Step1BasicInfo';
import Step2BusinessInfo from './Registration/Step2BusinessInfo';
import Step3Documents from './Registration/Step3Documents';
import Step4BankLocation from './Registration/Step4BankLocation';

const Registration = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
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
    type: 'GST',
    gstin: '',
    enrollmentNumber: '',

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

    // Bank Account Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    bankAccountName: '',
    
    // Bank Verification Details
    isBankVerified: 0,
    bankVerificationDetails: null
  });

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Personal details and account setup',
      icon: User,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Business Information',
      description: 'Store details and business categories',
      icon: Building2,
      color: 'green'
    },
    {
      id: 3,
      title: 'Documents & Verification',
      description: 'Upload required documents',
      icon: FileText,
      color: 'amber'
    },
    {
      id: 4,
      title: 'Bank & Location',
      description: 'Bank details and store location',
      icon: CreditCard,
      color: 'purple'
    }
  ];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return window.validateStep1 ? window.validateStep1() : true;
      case 2:
        return window.validateStep2 ? window.validateStep2() : true;
      case 3:
        return window.validateStep3 ? window.validateStep3() : true;
      case 4:
        return window.validateStep4 ? window.validateStep4() : true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      showError('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await registerSeller(formData);
      
      console.log('Registration response:', response);
      
      if (response.status === 1) {
        showSuccess('Registration Successful', 'Your seller account has been created successfully!');
        console.log('Redirecting to registration-success page...');
        // Small delay to ensure success message is shown
        setTimeout(() => {
          navigate('/registration-success');
        }, 1000);
      } else {
        console.log('Registration failed with status:', response.status);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 2:
        return <Step2BusinessInfo formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 3:
        return <Step3Documents formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 4:
        return <Step4BankLocation formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      default:
        return <Step1BasicInfo formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Seller Registration</h1>
            <p className="text-gray-600">Complete your registration in 4 simple steps</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? `bg-${step.color}-500 border-${step.color}-500 text-white` 
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isActive || isCompleted ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
