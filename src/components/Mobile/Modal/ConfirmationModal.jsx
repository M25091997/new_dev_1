import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = "Confirmation", message = "Are you sure you want to proceed?", actions = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50 transition-opacity z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900" style={{ color: '#4f46e5' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-900 mb-3 text-sm">
              {message}
            </p>
            
            {actions.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3 mb-3">
                <div className="text-xs text-gray-700 font-mono">
                  {actions.map((action, index) => (
                    <div key={index}>
                      {action}
                      {index < actions.length - 1 && ','}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;
