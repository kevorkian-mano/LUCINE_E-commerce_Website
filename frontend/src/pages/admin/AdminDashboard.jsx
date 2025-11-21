import { Link } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { orderAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await orderAPI.getAnalytics();
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Sales',
      value: `$${analytics?.totalSales?.toFixed(2) || '0.00'}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      link: '/admin/analytics',
    },
    {
      title: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: FiPackage,
      color: 'bg-blue-500',
      link: '/admin/orders',
    },
    {
      title: 'Average Order',
      value: `$${analytics?.averageOrderValue?.toFixed(2) || '0.00'}`,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      link: '/admin/analytics',
    },
    {
      title: 'Manage Products',
      value: 'View All',
      icon: FiShoppingBag,
      color: 'bg-orange-500',
      link: '/admin/products',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <stat.icon className="text-2xl" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/products"
          className="card hover:shadow-lg transition-shadow text-center p-8"
        >
          <FiShoppingBag className="text-4xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Manage Products</h2>
          <p className="text-gray-600">Add, edit, or delete products</p>
        </Link>

        <Link
          to="/admin/orders"
          className="card hover:shadow-lg transition-shadow text-center p-8"
        >
          <FiPackage className="text-4xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">View Orders</h2>
          <p className="text-gray-600">Manage and track all orders</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="card hover:shadow-lg transition-shadow text-center p-8"
        >
          <FiTrendingUp className="text-4xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sales Analytics</h2>
          <p className="text-gray-600">View sales reports and insights</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
