import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { loginUser } from '../../../../redux/thunk/authThunk';
import { useToast } from '../../../../contexts/ToastContext';
import BringMartLogo from '../../../../assets/BringmartLogo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: isLoading, error } = useSelector((state) => state.user);
  const { showSuccess, showError, showInfo } = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    try {
      console.log('Submitting login data:', formData);

      // Dispatch login action
      const result = await dispatch(loginUser(formData));

      if (result.success) {
        console.log('Login successful:', result.data);

        // Show success toast
        showSuccess('Login Successful', 'Welcome back! Redirecting to dashboard...');

        // Navigate to home page after successful login
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        console.error('Login error:', result.error);
        showError('Login Failed', result.error || 'Please check your credentials and try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      showError('Login Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-8 left-8 w-10 h-10 bg-yellow-400 rounded-full z-10"></div>
      <div className="absolute top-24 left-16 w-12 h-12 border-4 border-purple-300 rounded-lg transform rotate-12 z-10"></div>
      <div className="absolute bottom-32 left-12 w-14 h-14 bg-yellow-300 rounded-sm z-10"></div>
      <div className="absolute bottom-16 right-1/3 w-8 h-8 bg-purple-400 rounded-full z-10"></div>
      <div className="absolute bottom-24 right-1/4 w-10 h-10 border-4 border-blue-400 rounded-lg transform -rotate-12 z-10"></div>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Welcome to Bringmart Seller Panel !!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Log in to your dashboard and grow your business with ease.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all text-sm bg-gray-50 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-400 focus:bg-white'
                    }`}
                  placeholder="Email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl transition-all text-sm bg-gray-50 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-400 focus:bg-white'
                    }`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="text-sm text-gray-700 hover:text-blue-500 transition-colors font-medium">
                Forgot Password ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Social Login */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="text-sm text-gray-600">Login With</span>
              <button
                type="button"
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                type="button"
                className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-300 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-700">
              Don't Have an Account ?{' '}
              <Link to="/registration" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Purple Illustration */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 clip-diagonal">
          {/* Decorative shapes on purple side */}
          <div className="absolute top-1/3 right-20 w-16 h-16 border-4 border-purple-300 border-opacity-40 rounded-lg transform rotate-12"></div>
          <div className="absolute bottom-32 right-1/4 w-12 h-12 bg-purple-300 bg-opacity-30 rounded-full"></div>
          <div className="absolute bottom-20 right-12 w-14 h-14 border-4 border-pink-300 border-opacity-40 rounded-lg transform -rotate-12"></div>

          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
              {/* Logo */}
              <div className="mb-8">
                <div className="mx-auto bg-opacity-20 bg-white backdrop-blur-sm rounded-2xl flex items-center justify-center p-1 shadow-lg">
                  <img src={BringMartLogo} alt="Bringmart" className="w-24 h-20 object-contain" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                Start Selling with Bringmart
              </h2>

              {/* Subtitle */}
              <p className="text-purple-100 text-sm mb-8 leading-relaxed">
                Join thousands of successful sellers and grow your business with our powerful platform
              </p>

              {/* Features List */}
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs mb-0.5">Easy Product Listing</h3>
                    <p className="text-purple-100 text-xs leading-relaxed">Add and manage products effortlessly</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs mb-0.5">Real-Time Analytics</h3>
                    <p className="text-purple-100 text-xs leading-relaxed">Track sales and performance metrics</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs mb-0.5">Secure Payments</h3>
                    <p className="text-purple-100 text-xs leading-relaxed">Fast and secure payment processing</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs mb-0.5">24/7 Support</h3>
                    <p className="text-purple-100 text-xs leading-relaxed">Dedicated support team always ready</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {/* <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white border-opacity-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-purple-100 text-xs mt-1">Sellers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-purple-100 text-xs mt-1">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-purple-100 text-xs mt-1">Satisfaction</div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .clip-diagonal {
          clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
        }
      `}</style>
    </div>
  );
};

export default Login;

