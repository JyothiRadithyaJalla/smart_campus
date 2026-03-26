import { useEffect, useState, useMemo } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyticsAPI } from "../services/api";
import toast from "react-hot-toast";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [peakHours, setPeakHours] = useState(null);
  const [topResources, setTopResources] = useState([]);
  const [underutilized, setUnderutilized] = useState([]);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [peakRes, topRes, underRes, usageRes] = await Promise.all([
        analyticsAPI.getPeakHours(),
        analyticsAPI.getTopResources(),
        analyticsAPI.getUnderutilized(),
        analyticsAPI.getUsage(),
      ]);

      setPeakHours(peakRes.data.data);
      setTopResources(topRes.data.data);
      setUnderutilized(underRes.data.data);
      setUsage(usageRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Predictive Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Insights and trends for smart resource management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Peak Hour
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {peakHours?.peakHour || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {peakHours?.peakHourBookings || 0} bookings
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FiClock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Resources
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {usage?.totalResources || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active facilities
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <FiActivity size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {usage?.totalBookings || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <FiTrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Hourly Booking Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours?.hourlyDistribution || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Weekly Booking Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usage?.recentTrend || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.1}
              />
              <XAxis dataKey="_id" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top and Underutilized Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Resources */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingUp className="text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Most Used Resources
            </h2>
          </div>
          <div className="space-y-3">
            {topResources.map((resource, index) => (
              <div
                key={resource.resourceId}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {resource.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {resource.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {resource.bookingCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Underutilized Resources */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingDown className="text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Underutilized Resources
            </h2>
          </div>
          <div className="space-y-3">
            {underutilized.map((resource, index) => (
              <div
                key={resource.resourceId}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {resource.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {resource.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {resource.bookingCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Type Distribution */}
      {usage?.bookingsByType && usage.bookingsByType.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Resource Type Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usage.bookingsByType}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {usage.bookingsByType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {usage.bookingsByType.map((type, index) => (
                <div
                  key={type._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {type._id}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {type.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
