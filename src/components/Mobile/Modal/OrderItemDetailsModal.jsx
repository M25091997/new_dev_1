import React from 'react';
import { X, Eye, MessageCircle } from 'lucide-react';

const OrderItemDetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedItem, 
  orderDetails, 
  onWhatsAppClick 
}) => {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-800">Order Item Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Name:</span>
            <span className="text-xs text-gray-800 text-right flex-1 ml-2">{selectedItem.product_name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Status:</span>
            <span className="text-xs text-gray-800">{selectedItem.status_name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Product Id:</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-800">{selectedItem.product_id}</span>
              <button className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                <Eye className="w-2 h-2" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Seller Name:</span>
            <span className="text-xs text-gray-800">{orderDetails?.order?.seller_name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">User Name:</span>
            <span className="text-xs text-gray-800">{orderDetails?.order?.user_name}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Variant Id:</span>
            <span className="text-xs text-gray-800">{selectedItem.product_variant_id}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Quantity:</span>
            <span className="text-xs text-gray-800">{selectedItem.quantity}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Price:</span>
            <span className="text-xs text-gray-800">₹{selectedItem.price}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Discounted Price(₹):</span>
            <span className="text-xs text-gray-800">₹{selectedItem.discounted_price}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Tax Amount(₹):</span>
            <span className="text-xs text-gray-800">₹{selectedItem.tax_amount}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Tax Percentage(%):</span>
            <span className="text-xs text-gray-800">{selectedItem.tax_percentage}%</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-600">Handling Fee(₹):</span>
            <span className="text-xs text-gray-800">₹{selectedItem.handling_fee}</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-medium text-gray-600">Subtotal(₹):</span>
            <span className="text-xs text-gray-800">₹{selectedItem.sub_total}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => onWhatsAppClick(selectedItem)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemDetailsModal;

