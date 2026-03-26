import { useEffect, useState } from "react";
import { FiCalendar, FiFilter } from "react-icons/fi";
import BookingCard from "../components/BookingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getUserBookings(user.id);
      setBookings(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      return (
        booking.status === "confirmed" && new Date(booking.date) >= new Date()
      );
    }
    if (filter === "past") {
      return new Date(booking.date) < new Date();
    }
    return booking.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your resource reservations
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Bookings</option>
            <option value="upcoming">Upcoming</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No bookings found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {filter === "all"
              ? "You haven't made any bookings yet"
              : `You have no ${filter} bookings`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
