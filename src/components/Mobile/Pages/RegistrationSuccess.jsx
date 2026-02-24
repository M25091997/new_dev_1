import React from 'react';
import { CheckCircle, Clock, Mail, Phone, FileText, Shield, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
            <p className="text-gray-600 text-sm">Your seller account has been created successfully</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Congratulations!</h2>
            <p className="text-green-100 text-base">
              Your seller registration has been submitted successfully
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Status Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-amber-800 mb-2">
                    Application Under Review
                  </h3>
                  <p className="text-amber-700 text-sm mb-3">
                    Your application is currently being reviewed by our team. We'll process it within 24 hours.
                  </p>
                  <div className="bg-amber-100 rounded-lg p-3">
                    <p className="text-amber-800 text-xs font-medium">
                      ⏰ Expected processing time: 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-blue-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Document Verification</h4>
                    <p className="text-gray-600 text-xs">
                      We'll verify your uploaded documents and business details
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-purple-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Account Activation</h4>
                    <p className="text-gray-600 text-xs">
                      Once verified, your seller account will be activated
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-green-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">Start Selling</h4>
                    <p className="text-gray-600 text-xs">
                      You'll receive an email notification when ready to start
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-600">Email Support</p>
                    <p className="font-medium text-gray-800 text-sm">support@bringmart.in</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-600">Phone Support</p>
                    <p className="font-medium text-gray-800 text-sm">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoToDashboard}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </button>
              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            You'll receive email updates about your application status. 
            <br />
            Check your spam folder if you don't see our emails.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
