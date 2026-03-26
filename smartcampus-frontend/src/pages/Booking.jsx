import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiAlertCircle, FiCheck } from "react-icons/fi";
import { resourceAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [alternatives, setAlternatives] = useState([]);

  const [formData, setFormData] = useState({
    resourceId: location.state?.selectedResource?._id || "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getAll();
      setResources(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setConflict(null);
    setAlternatives([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate time
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSubmitting(true);

    try {
      await bookingAPI.create(formData);
      toast.success("Booking confirmed successfully!");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (error) {
      const response = error.response?.data;

      if (response?.conflict) {
        setConflict(response.message);
        setAlternatives(response.alternatives || []);
        toast.error("Time slot conflict detected!");
      } else {
        toast.error(response?.message || "Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAlternativeSelect = (resourceId) => {
    setFormData({ ...formData, resourceId });
    setConflict(null);
    setAlternatives([]);
  };

  const selectedResource = resources.find((r) => r._id === formData.resourceId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Book a Resource
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule your resource reservation with smart conflict detection
        </p>
      </div>

      {/* Conflict Warning */}
      {conflict && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FiAlertCircle
              className="text-red-600 dark:text-red-400 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">
                Booking Conflict
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {conflict}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resource Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Resource
                </label>
                <select
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Choose a resource</option>
                  {resources.map((resource) => (
                    <option key={resource._id} value={resource._id}>
                      {resource.name} ({resource.type}) - {resource.capacity}{" "}
                      capacity
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
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

              {/* Time Slots */}
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

              {/* Purpose */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !formData.resourceId}
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

        {/* Booking Summary / Alternatives */}
        <div className="space-y-6">
          {/* Selected Resource Info */}
          {selectedResource && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Selected Resource
              </h3>
              <img
                src={selectedResource.image}
                alt={selectedResource.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {selectedResource.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">
                {selectedResource.type} • {selectedResource.capacity} capacity
              </p>
            </div>
          )}

          {/* Alternative Resources */}
          {alternatives.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Available Alternatives
              </h3>
              <div className="space-y-3">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleAlternativeSelect(alt.id)}
                    className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {alt.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 capitalize">
                      {alt.type} • {alt.capacity} capacity
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
