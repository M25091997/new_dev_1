import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { createSellerWithdrawalRequest } from '../../../api/api';
import { useSelector } from 'react-redux';

const CreateWithdrawalRequestModal = ({ isOpen, onClose, balance, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const { token } = useSelector((state) => state.user);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.message) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showError('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      showError('Validation Error', 'Withdrawal amount cannot exceed available balance');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        message: formData.message
      };
      
      const response = await createSellerWithdrawalRequest(token, payload);
      
      if (response.status === 1) {
        showSuccess('Success', response.message || 'Withdrawal request created successfully');
        onSuccess && onSuccess();
        handleClose();
      } else {
        throw new Error(response.message || 'Failed to create withdrawal request');
      }
    } catch (error) {
      showError('Error', error.message || 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      message: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-b-lg sm:rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transform transition-all mt-4 sm:mt-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Withdraw Request
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Balance Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balance
            </label>
            <input
              type="text"
              value={formatCurrency(balance || 0)}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter Transfer Amount"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter Message."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-2 sm:flex-row justify-end sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWithdrawalRequestModal;
