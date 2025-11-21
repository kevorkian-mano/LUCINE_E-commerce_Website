import { useState, useEffect } from 'react';
import { orderAPI } from '../../utils/api';
import { FiDollarSign, FiPackage, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnalytics();
    fetchSalesByCategory();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      const res = await orderAPI.getAnalytics(params);
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesByCategory = async () => {
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      const res = await orderAPI.getSalesByCategory(params);
      setSalesByCategory(res.data.data || []);
    } catch (error) {
      console.error('Error fetching sales by category:', error);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = () => {
    setLoading(true);
    fetchAnalytics();
    fetchSalesByCategory();
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FiBarChart2 className="mr-2" />
        Sales Analytics
      </h1>

      {/* Date Filter */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter by Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="input-field"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              className="input-field"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleApplyFilter} className="btn-primary w-full">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Sales</p>
              <p className="text-3xl font-bold text-primary-600">
                ${analytics?.totalSales?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg text-white">
              <FiDollarSign className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-primary-600">
                {analytics?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg text-white">
              <FiPackage className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Average Order Value</p>
              <p className="text-3xl font-bold text-primary-600">
                ${analytics?.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg text-white">
              <FiTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Sales by Category</h2>
        {salesByCategory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Sold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesByCategory.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item._id || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${item.totalSales?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.totalItems || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data available</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
