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
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 relative overflow-hidden">
      {/* Android Status Bar Simulation */}
      <div className="h-6 bg-teal-700 bg-opacity-50"></div>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white opacity-5"></div>
      <div className="absolute top-20 right-0 w-40 h-40 bg-white opacity-5 rounded-full"></div>
      <div className="absolute top-40 left-0 w-32 h-32 bg-white opacity-5 rounded-full"></div>

      <div className="relative z-10 px-5 py-6">
        {/* Header - Android Style */}
        <div className="mb-8 flex items-center justify-center">
          <div className="mb-6">
            <div className="rounded-2xl mb-3 p-2">
              <img src={BringMartLogo} alt="Bringmart Logo" className="w-24 h-20 object-contain mx-auto" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-1.5">
                Welcome Back
              </h1>
              <p className="text-teal-100 text-xs">
                Sign in to continue to your seller account
              </p>
            </div>
          </div>
        </div>

        {/* Login Card - Material Design Style */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Email Field - Material Design */}
            <div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 pt-5 pb-1.5 border-b-2 focus:outline-none transition-all text-sm bg-gray-50 rounded-t-2xl ${errors.email
                    ? 'border-red-500 bg-red-50'
                    : formData.email
                      ? 'border-teal-600'
                      : 'border-gray-300 focus:border-teal-600'
                    }`}
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all pointer-events-none ${formData.email
                    ? 'top-1.5 text-[10px] text-teal-600 font-medium'
                    : 'top-4 text-xs text-gray-500'
                    }`}
                >
                  Email Address
                </label>
                <Mail className={`absolute right-3 top-4 w-4 h-4 transition-colors ${formData.email ? 'text-teal-600' : 'text-gray-400'
                  }`} />
              </div>
              {errors.email && (
                <div className="flex items-center mt-1.5 px-1">
                  <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-600 text-[10px]">{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password Field - Material Design */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 pt-5 pb-1.5 border-b-2 focus:outline-none transition-all text-sm bg-gray-50 rounded-t-2xl ${errors.password
                    ? 'border-red-500 bg-red-50'
                    : formData.password
                      ? 'border-teal-600'
                      : 'border-gray-300 focus:border-teal-600'
                    }`}
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all pointer-events-none ${formData.password
                    ? 'top-1.5 text-[10px] text-teal-600 font-medium'
                    : 'top-4 text-xs text-gray-500'
                    }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 active:scale-95 transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-1.5 px-1">
                  <svg className="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-600 text-[10px]">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer active:scale-95 transition-transform">
                <div className="relative">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${formData.rememberMe ? 'bg-teal-600' : 'bg-gray-300'
                    }`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${formData.rememberMe ? 'transform translate-x-5' : ''
                    }`}></div>
                </div>
                <span className="ml-2 text-xs text-gray-700 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-xs font-semibold text-teal-600 active:text-teal-700">
                Forgot?
              </a>
            </div>

            {/* Submit Button - Material Design */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 rounded-full text-sm font-semibold text-white shadow-lg active:scale-95 transition-all mt-6 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 active:shadow-xl'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-white text-gray-500 font-medium">New to Bringmart?</span>
              </div>
            </div>

            {/* Register Button */}
            <Link
              to="/registration"
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-full text-sm font-semibold text-teal-600 border-2 border-teal-600 active:bg-teal-50 transition-all"
            >
              Create seller account
            </Link>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-white opacity-90 leading-relaxed px-4">
            By signing in, you agree to our{' '}
            <a href="#" className="font-semibold underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="font-semibold underline">Privacy Policy</a>
          </p>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default Login;

