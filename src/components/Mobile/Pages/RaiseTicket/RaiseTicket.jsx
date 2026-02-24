import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Send,
  ArrowLeft,
  Package,
  CreditCard,
  ShoppingCart,
  User,
  Settings,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  FileCheck,
  Search,
  BarChart3,
  Archive,
  Target,
  Wallet,
  Wrench
} from 'lucide-react';
import { useToast } from '../../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { getAllSupportTicketCategories, createSupportTicket, getAllSupportTickets, getSupportTicketDetails } from '../../../../api/api';
import TicketDetailsModal from '../../Modal/TicketDetailsModal';

const RaiseTicket = () => {
  const { user, token } = useSelector((state) => state.user);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('raise-ticket');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const fetchingRef = useRef(false);
  const categoriesFetchedRef = useRef(false);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [showTicketDetailsModal, setShowTicketDetailsModal] = useState(false);
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);

  // Icon mapping function
  const getIconComponent = (iconName) => {
    const iconMap = {
      'tag': Target,
      'box': Archive,
      'shopping-cart': ShoppingCart,
      'wallet': Wallet,
      'user': User,
      'bar-chart': BarChart3,
      'tool': Wrench,
      'help-circle': HelpCircle,
      'package': Package,
      'default': HelpCircle
    };
    return iconMap[iconName] || iconMap['default'];
  };

  // Fetch support ticket categories
  const fetchCategories = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchingRef.current || categoriesFetchedRef.current) {
      return;
    }

    fetchingRef.current = true;
    setLoadingCategories(true);
    try {
      const response = await getAllSupportTicketCategories(token);
      if (response.status === 1 && response.data) {
        // Transform API data to match component structure
        const transformedCategories = response.data
          .filter(category => category.parent_id === null && category.status === true)
          .map(category => ({
            id: category.id.toString(),
            label: category.name,
            icon: getIconComponent(category.icon),
            subCategories: category.subcategories
              ? category.subcategories
                .filter(sub => sub.status === true)
                .map(sub => ({
                  id: sub.id,
                  name: sub.name
                }))
              : []
          }))
          .sort((a, b) => {
            // Sort by order if available, otherwise by name
            const orderA = response.data.find(c => c.id.toString() === a.id)?.order || 999;
            const orderB = response.data.find(c => c.id.toString() === b.id)?.order || 999;
            return orderA - orderB;
          });

        setTicketCategories(transformedCategories);
        categoriesFetchedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('Error', 'Failed to load ticket categories. Please try again.');
      categoriesFetchedRef.current = false; // Allow retry on error
    } finally {
      setLoadingCategories(false);
      fetchingRef.current = false;
    }
  }, [token, showError]);

  useEffect(() => {
    if (token && activeTab === 'raise-ticket' && !categoriesFetchedRef.current) {
      fetchCategories();
    }
  }, [token, activeTab, fetchCategories]);

  // Set phone number from user state
  useEffect(() => {
    if (user && user.seller && user.seller.mobile) {
      setPhoneNumber(user.seller.mobile);
    }
  }, [user]);

  // Fetch tickets
  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchTickets();
    }
  }, [activeTab, ticketFilter]);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await getAllSupportTickets(token);
      
      if (response.status === 1 && response.data) {
        // Transform the tickets data to include ticket_id
        const transformedTickets = response.data.map(ticket => ({
          ...ticket,
          ticket_id: `#TKT-${String(ticket.id).padStart(5, '0')}`
        }));
        setTickets(transformedTickets);
      } else {
        throw new Error(response.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Error', error.message || 'Failed to load tickets. Please try again.');
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const selectedCategoryData = ticketCategories.find(cat => cat.id === selectedCategory);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedSubCategoryId('');
    setSubject('');
    setDescription('');
    setPriority('medium');
    setPhoneNumber(user?.seller?.mobile || '');
    setErrors({});
    setSearchQuery(''); // Clear search when category is selected
  };

  const handleSubCategorySelect = (subCategory) => {
    // Handle both string and object formats
    const subCategoryName = typeof subCategory === 'string' ? subCategory : subCategory.name;
    const subCategoryId = typeof subCategory === 'object' ? subCategory.id : null;

    setSelectedSubCategory(subCategoryName);
    setSelectedSubCategoryId(subCategoryId);
    setSubject(subCategoryName);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!selectedSubCategory || !selectedSubCategoryId) {
      newErrors.subCategory = 'Please select a sub-category';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!priority) {
      newErrors.priority = 'Please select a priority';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (submittingRef.current) {
      return;
    }

    if (!validateForm()) {
      showError('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const ticketData = {
        category_id: parseInt(selectedSubCategoryId),
        subject: subject.trim(),
        description: description.trim(),
        priority: priority,
        phone_number: phoneNumber.trim()
      };

      const response = await createSupportTicket(token, ticketData);

      if (response.status === 1) {
        showSuccess('Ticket Raised', response.message || 'Support ticket created successfully. Our support team will get back to you soon.');

        // Reset form
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSelectedSubCategoryId('');
        setSubject('');
        setDescription('');
        setPriority('medium');
        setPhoneNumber(user?.seller?.mobile || '');
        setErrors({});

        // Switch to My Tickets tab after successful submission
        setActiveTab('my-tickets');
        setTicketFilter('all');
        fetchTickets();
      } else {
        throw new Error(response.message || 'Failed to raise ticket');
      }
    } catch (error) {
      console.error('Error raising ticket:', error);
      showError('Error', error.message || 'Failed to raise ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in_progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700', icon: Clock },
      'closed': { label: 'Closed', className: 'bg-gray-100 text-gray-700', icon: FileCheck },
      'resolved': { label: 'Resolved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      'open': { label: 'Open', className: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig['open'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.className}`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === 'all') return true;
    if (ticketFilter === 'open') return ticket.status === 'open';
    if (ticketFilter === 'in-progress') return ticket.status === 'in_progress';
    if (ticketFilter === 'resolved') return ticket.status === 'resolved';
    if (ticketFilter === 'closed') return ticket.status === 'closed';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTicketClick = async (ticketId) => {
    setLoadingTicketDetails(true);
    setShowTicketDetailsModal(true);
    try {
      const response = await getSupportTicketDetails(token, ticketId);
      
      if (response.status === 1 && response.data) {
        setSelectedTicketDetails({
          ...response.data,
          ticket_id: `#TKT-${String(response.data.id).padStart(5, '0')}`
        });
      } else {
        throw new Error(response.message || 'Failed to fetch ticket details');
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      showError('Error', error.message || 'Failed to load ticket details');
      setShowTicketDetailsModal(false);
    } finally {
      setLoadingTicketDetails(false);
    }
  };

  const closeTicketDetailsModal = () => {
    setShowTicketDetailsModal(false);
    setSelectedTicketDetails(null);
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Support</h1>
              <p className="text-xs text-gray-500">Get help from support team</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 -mx-4 px-4">
          <button
            onClick={() => setActiveTab('raise-ticket')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'raise-ticket'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600'
              }`}
          >
            Raise Ticket
          </button>
          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'my-tickets'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600'
              }`}
          >
            My Tickets
          </button>
        </div>
      </div>

      {/* Raise Ticket Tab Content */}
      {activeTab === 'raise-ticket' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for issue or question"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-800 mb-1">Select Issue Category</h2>
            <p className="text-xs text-gray-600">Choose the category that best describes your issue</p>
          </div>

          {/* Category List - Mobile Optimized */}
          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {ticketCategories
                .filter(category =>
                  searchQuery === '' ||
                  category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  category.subCategories.some(sub => {
                    const subName = typeof sub === 'string' ? sub : sub.name;
                    return subName.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                )
                .map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-600'
                              }`} />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-red-700' : 'text-gray-700'
                            }`}>
                            {category.label}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-gray-400'
                          }`} />
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* Sub-Category Selection */}
          {selectedCategoryData && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Select Sub-Category
              </h3>
              <div className="space-y-2">
                {selectedCategoryData.subCategories.map((subCat, index) => {
                  // Handle both string and object formats
                  const subCategoryName = typeof subCat === 'string' ? subCat : subCat.name;
                  const isSelected = selectedSubCategory === subCategoryName;
                  return (
                    <button
                      key={typeof subCat === 'object' ? subCat.id : index}
                      onClick={() => handleSubCategorySelect(subCat)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isSelected ? 'text-red-700 font-medium' : 'text-gray-700'
                          }`}>
                          {subCategoryName}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.subCategory && (
                <p className="text-red-500 text-xs mt-2">{errors.subCategory}</p>
              )}
            </div>
          )}

          {/* Ticket Form */}
          {selectedSubCategory && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) {
                      setErrors(prev => ({ ...prev, subject: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter ticket subject"
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  rows={6}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Please provide detailed information about your issue..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  Minimum 10 characters required
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    if (errors.priority) {
                      setErrors(prev => ({ ...prev, priority: '' }));
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.priority ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  Select the priority level for your ticket
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  CallBack Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhoneNumber(value);
                    if (errors.phoneNumber) {
                      setErrors(prev => ({ ...prev, phoneNumber: '' }));
                    }
                  }}
                  maxLength={10}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter 10-digit phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  We'll use this number to contact you regarding your ticket
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubCategory('');
                    setSelectedSubCategoryId('');
                    setSubject('');
                    setDescription('');
                    setPriority('medium');
                    setPhoneNumber(user?.seller?.mobile || '');
                    setErrors({});
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Help Text */}
          {!selectedCategory && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-xs font-semibold text-blue-900 mb-1">
                    Need Help?
                  </h3>
                  <p className="text-xs text-blue-700">
                    Select a category above to get started. Our support team typically responds within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Tickets Tab Content */}
      {activeTab === 'my-tickets' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 px-4 pt-4">
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setTicketFilter('all')}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${ticketFilter === 'all'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setTicketFilter('open')}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${ticketFilter === 'open'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600'
                  }`}
              >
                Open
              </button>
              <button
                onClick={() => setTicketFilter('in-progress')}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${ticketFilter === 'in-progress'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600'
                  }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setTicketFilter('resolved')}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${ticketFilter === 'resolved'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600'
                  }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setTicketFilter('closed')}
                className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${ticketFilter === 'closed'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600'
                  }`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Tickets List */}
          <div className="p-4">
            {loadingTickets ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-6 h-6 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">No Tickets!</h3>
                <p className="text-xs text-gray-500 text-center">
                  We are glad that you do not have a complaint.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.id)}
                    className="border border-gray-200 rounded-lg p-3 active:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {ticket.subject}
                          </h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex flex-col space-y-1 text-[10px] text-gray-500">
                          <span>Ticket ID: {ticket.ticket_id}</span>
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Details Modal - Mobile Optimized */}
      <TicketDetailsModal
        isOpen={showTicketDetailsModal}
        onClose={closeTicketDetailsModal}
        ticketDetails={selectedTicketDetails}
        loading={loadingTicketDetails}
        formatDate={formatDate}
      />
    </div>
  );
};

export default RaiseTicket;
