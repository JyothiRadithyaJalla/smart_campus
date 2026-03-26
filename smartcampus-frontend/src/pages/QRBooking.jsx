import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { resourceAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const QRBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
  });

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await resourceAPI.getById(id);
      setResource(response.data.data);
    } catch (error) {
      toast.error("Resource not found");
      setTimeout(() => navigate("/resources"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSubmitting(true);

    try {
      await bookingAPI.create({
        ...formData,
        resourceId: id,
      });
      toast.success("Booking confirmed via QR code!");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (error) {
      const response = error.response?.data;
      if (response?.conflict) {
        toast.error("Time slot already booked");
      } else {
        toast.error(response?.message || "Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Resource not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            QR Code Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quick reservation via QR scan
          </p>
        </div>

        {/* Resource Info */}
        <div className="card mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={resource.image}
              alt={resource.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {resource.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">
                {resource.type} • {resource.capacity} capacity
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {resource.description}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiCalendar className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiClock className="inline mr-2" />
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose (Optional)
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Describe the purpose of your booking..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiCheck />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRBooking;
