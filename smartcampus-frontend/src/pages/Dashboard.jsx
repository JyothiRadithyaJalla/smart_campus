import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiTrendingUp, FiGrid } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyticsAPI, bookingAPI, resourceAPI } from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [topResources, setTopResources] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usageRes, topRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getUsage(),
        analyticsAPI.getTopResources(),
      ]);

      setStats(statsRes.data.data);
      setUsage(usageRes.data.data);
      setTopResources(topRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your campus resources and booking statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiCalendar}
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          color="from-blue-500 to-blue-600"
          trend="All time bookings"
        />
        <StatCard
          icon={FiClock}
          title="Active Bookings"
          value={stats?.activeBookings || 0}
          color="from-green-500 to-green-600"
          trend="Currently active"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Utilization Rate"
          value={`${stats?.utilizationRate || 0}%`}
          color="from-purple-500 to-purple-600"
          trend="Resource efficiency"
        />
        <StatCard
          icon={FiGrid}
          title="Total Resources"
          value={usage?.totalResources || 0}
          color="from-orange-500 to-orange-600"
          trend="Available resources"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Booking Trend (Last 7 Days)
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
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Type */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Bookings by Resource Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usage?.bookingsByType || []}>
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
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Resources */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Most Popular Resources
        </h2>
        <div className="space-y-3">
          {topResources.length > 0 ? (
            topResources.map((resource, index) => (
              <div
                key={resource.resourceId}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {resource.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {resource.type} • {resource.capacity} capacity
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {resource.bookingCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    bookings
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No bookings data available yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
