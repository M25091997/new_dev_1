import React from 'react';
import {
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck
} from 'lucide-react';

const TicketDetailsModal = ({ 
  isOpen, 
  onClose, 
  ticketDetails, 
  loading,
  formatDate 
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Ticket Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-3 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          ) : ticketDetails ? (
            <div className="space-y-4">
              {/* Ticket Header */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {ticketDetails.subject}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  <span className="font-medium">Ticket ID: {ticketDetails.ticket_id}</span>
                  <span>•</span>
                  <span>{formatDate(ticketDetails.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(ticketDetails.status)}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    ticketDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticketDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticketDetails.priority?.charAt(0).toUpperCase() + ticketDetails.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">Category</div>
                <div className="text-sm text-gray-900">{ticketDetails.category?.name || 'N/A'}</div>
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-medium text-gray-700 mb-2">Description</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-900 whitespace-pre-wrap">{ticketDetails.description}</p>
                </div>
              </div>

              {/* CallBack Number */}
              {ticketDetails.phone_number && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-blue-900 mb-1">CallBack Number</div>
                  <div className="text-sm text-blue-800 font-semibold">{ticketDetails.phone_number}</div>
                  <p className="text-[10px] text-blue-600 mt-1">Our support team will contact you on this number</p>
                </div>
              )}

              {/* Admin Response */}
              {ticketDetails.admin_response ? (
                <div className="border-t pt-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">Admin Response</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-900 whitespace-pre-wrap">{ticketDetails.admin_response}</p>
                    {ticketDetails.responded_at && (
                      <div className="mt-2 text-[10px] text-gray-500">
                        Responded on {formatDate(ticketDetails.responded_at)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        Waiting for admin response. Our support team will get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t pt-4">
                <div className="text-xs font-medium text-gray-700 mb-3">Timeline</div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-900">Ticket Created</div>
                      <div className="text-[10px] text-gray-500">{formatDate(ticketDetails.created_at)}</div>
                    </div>
                  </div>
                  {ticketDetails.responded_at && (
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">Admin Responded</div>
                        <div className="text-[10px] text-gray-500">{formatDate(ticketDetails.responded_at)}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      ticketDetails.status === 'resolved' || ticketDetails.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-900">Last Updated</div>
                      <div className="text-[10px] text-gray-500">{formatDate(ticketDetails.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 safe-area-bottom">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors active:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;

