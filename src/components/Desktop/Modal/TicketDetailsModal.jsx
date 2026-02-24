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
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Ticket Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          ) : ticketDetails ? (
            <div className="space-y-6">
              {/* Ticket Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {ticketDetails.subject}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="font-medium">Ticket ID: {ticketDetails.ticket_id}</span>
                    <span>•</span>
                    <span>{formatDate(ticketDetails.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(ticketDetails.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticketDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                      ticketDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {ticketDetails.priority?.charAt(0).toUpperCase() + ticketDetails.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Category</div>
                <div className="text-base text-gray-900">{ticketDetails.category?.name || 'N/A'}</div>
              </div>

              {/* Description */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{ticketDetails.description}</p>
                </div>
              </div>

              {/* CallBack Number */}
              {ticketDetails.phone_number && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-900 mb-1">CallBack Number</div>
                  <div className="text-base text-blue-800 font-semibold">{ticketDetails.phone_number}</div>
                  <p className="text-xs text-blue-600 mt-1">Our support team will contact you on this number</p>
                </div>
              )}

              {/* Admin Response */}
              {ticketDetails.admin_response ? (
                <div className="border-t pt-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Admin Response</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{ticketDetails.admin_response}</p>
                    {ticketDetails.responded_at && (
                      <div className="mt-3 text-xs text-gray-500">
                        Responded on {formatDate(ticketDetails.responded_at)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Waiting for admin response. Our support team will get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t pt-6">
                <div className="text-sm font-medium text-gray-700 mb-3">Timeline</div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Ticket Created</div>
                      <div className="text-xs text-gray-500">{formatDate(ticketDetails.created_at)}</div>
                    </div>
                  </div>
                  {ticketDetails.responded_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Admin Responded</div>
                        <div className="text-xs text-gray-500">{formatDate(ticketDetails.responded_at)}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${ticketDetails.status === 'resolved' || ticketDetails.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'
                      }`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Last Updated</div>
                      <div className="text-xs text-gray-500">{formatDate(ticketDetails.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;

