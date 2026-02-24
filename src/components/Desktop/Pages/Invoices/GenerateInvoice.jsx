import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Printer,
  Eye
} from 'lucide-react';
import { generateInvoice, downloadInvoice } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';

const GenerateInvoice = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch invoice data
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await generateInvoice(token, orderId);
      
      if (response.status === 1) {
        setInvoiceData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch invoice data');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showError('Error', error.message || 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && token) {
      fetchInvoice();
    }
  }, [orderId, token]);

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice(token, orderId);
      showSuccess('Success', 'Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError('Error', error.message || 'Failed to download invoice');
    }
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - Order ${orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${invoiceData || 'Loading invoice...'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoice Data</h3>
          <p className="text-gray-500">Unable to load invoice data for this order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
            <p className="text-gray-600">Order ID: {orderId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrintInvoice}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="p-6"
          dangerouslySetInnerHTML={{ __html: invoiceData }}
        />
      </div>
    </div>
  );
};

export default GenerateInvoice;