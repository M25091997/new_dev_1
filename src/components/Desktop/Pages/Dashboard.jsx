import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  IndianRupee
} from 'lucide-react';
import { getSellerDashboard } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Orders from './Orders';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showError, showInfo } = useToast();
  const { user, token } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Ref to track if dashboard data has been fetched
  const hasFetchedDashboard = useRef(false);

  const fetchDashboardData = async (isRefresh = false) => {
    // Allow refetch if explicitly refreshing, otherwise prevent multiple calls
    if (!isRefresh && hasFetchedDashboard.current) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      hasFetchedDashboard.current = true; // Mark as fetched
      const response = await getSellerDashboard(token);

      if (response.status === 1) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showError('Dashboard Error', error.message || 'Failed to load dashboard data');
      if (!isRefresh) {
        hasFetchedDashboard.current = false; // Reset on error to allow retry
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Navigation handlers for dashboard cards
  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleBalanceClick = () => {
    navigate('/wallet');
  };

  const handleProductsClick = () => {
    navigate('/products/manage');
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
  };

  // const handlePacketProductsClick = () => {
  //   navigate('/products/packet');
  // };

  // const handleLooseProductsClick = () => {
  //   navigate('/products/loose');
  // };

  const handleSoldOutProductsClick = () => {
    navigate('/products/sold-out');
  };

  const handleLowStockProductsClick = () => {
    navigate('/products/low-stock');
  };

  // Chart configurations based on actual API response
  const salesChartData = {
    labels: dashboardData?.weekly_sales?.map(item => {
      const date = new Date(item.order_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || ['No Data'],
    datasets: [
      {
        label: 'Daily Sales (₹)',
        data: dashboardData?.weekly_sales?.map(item => item.total_sale) || [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const ordersChartData = {
    labels: dashboardData?.status_order_count?.map(item => item.status) || ['No Data'],
    datasets: [
      {
        label: 'Orders by Status',
        data: dashboardData?.status_order_count?.map(item => item.order_count) || [0],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Payment Pending - Red
          'rgba(59, 130, 246, 0.8)',  // Received - Blue
          'rgba(245, 158, 11, 0.8)',  // Processed - Yellow
          'rgba(16, 185, 129, 0.8)',  // Shipped - Green
          'rgba(139, 92, 246, 0.8)',  // Out For Delivery - Purple
          'rgba(34, 197, 94, 0.8)',   // Delivered - Green
          'rgba(107, 114, 128, 0.8)', // Cancelled - Gray
          'rgba(251, 146, 60, 0.8)',  // Returned - Orange
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(34, 197, 94)',
          'rgb(107, 114, 128)',
          'rgb(251, 146, 60)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Generate colors for all categories
  const generateColors = (count) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(34, 197, 94, 0.8)',    // Emerald
      'rgba(251, 146, 60, 0.8)',   // Orange
      'rgba(107, 114, 128, 0.8)',  // Gray
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(168, 85, 247, 0.8)',   // Violet
      'rgba(34, 197, 94, 0.8)',    // Lime
      'rgba(249, 115, 22, 0.8)',   // Orange
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(20, 184, 166, 0.8)',   // Teal
      'rgba(245, 101, 101, 0.8)',  // Rose
      'rgba(132, 204, 22, 0.8)',   // Lime
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(34, 197, 94, 0.8)',    // Emerald
      'rgba(251, 146, 60, 0.8)',   // Orange
      'rgba(107, 114, 128, 0.8)',  // Gray
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(168, 85, 247, 0.8)',   // Violet
      'rgba(34, 197, 94, 0.8)',    // Lime
      'rgba(249, 115, 22, 0.8)',   // Orange
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(20, 184, 166, 0.8)',   // Teal
      'rgba(245, 101, 101, 0.8)',  // Rose
    ];
    return colors.slice(0, count);
  };

  const categoryChartData = {
    labels: dashboardData?.category_product_count?.map(item => {
      // Show more characters for better readability with full width
      return item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name;
    }) || ['No Data'],
    datasets: [
      {
        data: dashboardData?.category_product_count?.map(item => item.product_count) || [0],
        backgroundColor: generateColors(dashboardData?.category_product_count?.length || 0),
        borderColor: generateColors(dashboardData?.category_product_count?.length || 0).map(color =>
          color.replace('0.8)', '1)')
        ),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 16,
          padding: 12,
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Products: ${value}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-5">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex mt-5 items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={handleOrdersClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.order_count || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                  {dashboardData?.pending_order_count || 0} pending
                </span>
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={handleBalanceClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{dashboardData?.balance || '0.00'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Available balance</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={handleProductsClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.product_count || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {dashboardData?.packet_products || 0} packet · {dashboardData?.loose_products || 0} loose
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={handleCategoriesClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.category_count || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Active categories</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* <div 
          onClick={handlePacketProductsClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-cyan-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Packet Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.packet_products || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pre-packaged items</p>
            </div>
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
              <Package className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
        </div> */}

        {/* <div 
          onClick={handleLooseProductsClick}
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md hover:border-teal-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Loose Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.loose_products || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Bulk items</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div> */}

        <div 
          onClick={handleSoldOutProductsClick}
          className="bg-white rounded-lg p-4 border border-red-200 cursor-pointer hover:shadow-md hover:border-red-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-red-600 uppercase mb-1">Sold Out</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.sold_out_count || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Out of stock</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={handleLowStockProductsClick}
          className="bg-white rounded-lg p-4 border border-orange-200 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.low_stock_count || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Running low</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Order Status Overview</h3>
          <span className="text-xs text-gray-500">{dashboardData?.status_order_count?.length || 0} statuses</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {dashboardData?.status_order_count?.map((status, index) => {
            const statusConfig = {
              'Payment Pending': { icon: '💰', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-600' },
              'Received': { icon: '📦', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600' },
              'Processed': { icon: '⚙️', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-600' },
              'Shipped': { icon: '🚚', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-600' },
              'Out For Delivery': { icon: '🏃', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-600' },
              'Delivered': { icon: '✅', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-600' },
              'Cancelled': { icon: '❌', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', textColor: 'text-gray-600' },
              'Returned': { icon: '↩️', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-600' }
            };

            const config = statusConfig[status.status] || statusConfig['Cancelled'];

            return (
              <div key={index} className={`${config.bgColor} rounded-lg p-3 border ${config.borderColor} hover:shadow-sm transition-shadow`}>
                <div className="text-center">
                  <div className="text-xl mb-1">{config.icon}</div>
                  <h4 className="text-[10px] font-semibold text-gray-700 mb-1 leading-tight">{status.status}</h4>
                  <p className={`text-xl font-bold ${config.textColor}`}>
                    {status.order_count}
                  </p>
                </div>
              </div>
            );
          }) || (
              <div className="col-span-full text-center text-gray-500 py-6">
                <p className="text-sm">No order status data available</p>
              </div>
            )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Weekly Sales Trend</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <div className="h-56">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Orders by Status</h3>
            <span className="text-xs text-gray-500">Distribution</span>
          </div>
          <div className="h-56">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Category Distribution</h3>
          <span className="text-xs text-gray-500">{dashboardData?.category_count || 0} categories</span>
        </div>
        <div className="h-72">
          <Doughnut data={categoryChartData} options={doughnutOptions} />
        </div>
      </div>

      {/* Orders Section */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Orders</h3>
        <Orders />
      </div> */}
      <Orders />

    </div>
  );
};

export default Dashboard;
