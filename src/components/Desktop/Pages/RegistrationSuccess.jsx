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
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Registration Successful!</h1>
            <p className="text-gray-600">Your seller account has been created successfully</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
            <p className="text-green-100 text-lg">
              Your seller registration has been submitted successfully
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            {/* Status Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Application Under Review
                  </h3>
                  <p className="text-amber-700 mb-3">
                    Your application is currently being reviewed by our team. We'll process it within 24 hours.
                  </p>
                  <div className="bg-amber-100 rounded-lg p-3">
                    <p className="text-amber-800 text-sm font-medium">
                      ⏰ Expected processing time: 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Document Verification</h4>
                  <p className="text-gray-600 text-sm">
                    We'll verify your uploaded documents and business details
                  </p>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Account Activation</h4>
                  <p className="text-gray-600 text-sm">
                    Once verified, your seller account will be activated
                  </p>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Start Selling</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive an email notification when ready to start
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email Support</p>
                    <p className="font-medium text-gray-800">support@bringmart.in</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Support</p>
                    <p className="font-medium text-gray-800">+91 9876543210</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>
              <button
                onClick={handleGoHome}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
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
