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
  ChevronRight,
  IndianRupeeIcon
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
  
  const hasFetchedDashboard = useRef(false);

  const fetchDashboardData = async (isRefresh = false) => {
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

      hasFetchedDashboard.current = true;
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
        hasFetchedDashboard.current = false;
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
  }, [token]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Navigation handlers
  const handleOrdersClick = () => navigate('/orders');
  const handleBalanceClick = () => navigate('/wallet');
  const handleProductsClick = () => navigate('/products/manage');
  const handleCategoriesClick = () => navigate('/categories');
  // const handlePacketProductsClick = () => navigate('/products/packet');
  // const handleLooseProductsClick = () => navigate('/products/loose');
  const handleSoldOutProductsClick = () => navigate('/products/sold-out');
  const handleLowStockProductsClick = () => navigate('/products/low-stock');

  // Chart configurations
  const salesChartData = {
    labels: dashboardData?.weekly_sales?.map(item => {
      const date = new Date(item.order_date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || ['No Data'],
    datasets: [
      {
        label: 'Sales',
        data: dashboardData?.weekly_sales?.map(item => item.total_sale) || [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const ordersChartData = {
    labels: dashboardData?.status_order_count?.map(item => item.status) || ['No Data'],
    datasets: [
      {
        data: dashboardData?.status_order_count?.map(item => item.order_count) || [0],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const generateColors = (count) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(34, 197, 94, 0.8)',
      'rgba(251, 146, 60, 0.8)', 'rgba(107, 114, 128, 0.8)', 'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(132, 204, 22, 0.8)',
    ];
    return colors.slice(0, count);
  };

  const categoryChartData = {
    labels: dashboardData?.category_product_count?.map(item => 
      item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
    ) || ['No Data'],
    datasets: [
      {
        data: dashboardData?.category_product_count?.map(item => item.product_count) || [0],
        backgroundColor: generateColors(dashboardData?.category_product_count?.length || 0),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 10 },
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 9 },
          color: '#6B7280',
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 8,
          font: { size: 9 },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Overview of your store</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full bg-blue-50 text-blue-600 active:bg-blue-100 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div 
            onClick={handleOrdersClick}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-50 p-2 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{dashboardData?.order_count || 0}</p>
          </div>

          <div 
            onClick={handleBalanceClick}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <IndianRupeeIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Balance</p>
            <p className="text-xl font-bold text-gray-900">₹{dashboardData?.balance || '0.00'}</p>
          </div>

          <div 
            onClick={handleProductsClick}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Products</p>
            <p className="text-xl font-bold text-gray-900">{dashboardData?.product_count || 0}</p>
            <p className="text-xs text-purple-600 mt-1">{dashboardData?.packet_products || 0} packet</p>
          </div>

          <div 
            onClick={handleCategoriesClick}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-50 p-2 rounded-lg">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Categories</p>
            <p className="text-xl font-bold text-gray-900">{dashboardData?.category_count || 0}</p>
            <p className="text-xs text-amber-600 mt-1">Active</p>
          </div>
        </div>

        {/* Inventory Quick Stats */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Inventory Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* <div 
              onClick={handlePacketProductsClick}
              className="bg-indigo-50 rounded-lg p-2.5 border border-indigo-100 active:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Packet</p>
                  <p className="text-lg font-bold text-indigo-600">{dashboardData?.packet_products || 0}</p>
                </div>
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
            </div> */}

            {/* <div 
              onClick={handleLooseProductsClick}
              className="bg-cyan-50 rounded-lg p-2.5 border border-cyan-100 active:bg-cyan-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Loose</p>
                  <p className="text-lg font-bold text-cyan-600">{dashboardData?.loose_products || 0}</p>
                </div>
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
            </div> */}

            <div 
              onClick={handleSoldOutProductsClick}
              className="bg-red-50 rounded-lg p-2.5 border border-red-100 active:bg-red-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Sold Out</p>
                  <p className="text-lg font-bold text-red-600">{dashboardData?.sold_out_count || 0}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>

            <div 
              onClick={handleLowStockProductsClick}
              className="bg-orange-50 rounded-lg p-2.5 border border-orange-100 active:bg-orange-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Low Stock</p>
                  <p className="text-lg font-bold text-orange-600">{dashboardData?.low_stock_count || 0}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-gray-900">Order Status</h3>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {dashboardData?.status_order_count?.slice(0, 8).map((status, index) => {
              const statusConfig = {
                'Payment Pending': { emoji: '💰', color: 'red' },
                'Received': { emoji: '📦', color: 'blue' },
                'Processed': { emoji: '⚙️', color: 'yellow' },
                'Shipped': { emoji: '🚚', color: 'green' },
                'Out For Delivery': { emoji: '🏃', color: 'purple' },
                'Delivered': { emoji: '✅', color: 'emerald' },
                'Cancelled': { emoji: '❌', color: 'gray' },
                'Returned': { emoji: '↩️', color: 'orange' }
              };
              
              const config = statusConfig[status.status] || { emoji: '📋', color: 'gray' };
              
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                  <div className="text-base mb-1">{config.emoji}</div>
                  <p className="text-lg font-bold text-gray-900">{status.order_count}</p>
                  <p className="text-xs text-gray-500 truncate">{status.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Weekly Sales</h3>
          <div className="h-40">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Orders by Status</h3>
          <div className="h-40">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Categories ({dashboardData?.category_count || 0})
          </h3>
          <div className="h-64">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Orders Section */}
        <Orders />
      </div>
    </div>
  );
};

export default Dashboard;