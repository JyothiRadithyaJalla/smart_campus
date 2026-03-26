import { format } from "date-fns";
import { FiCalendar, FiClock, FiMapPin, FiX } from "react-icons/fi";

const BookingCard = ({ booking, onCancel }) => {
  const statusColors = {
    confirmed: "badge-success",
    pending: "badge-warning",
    cancelled: "badge-error",
    completed: "badge-info",
  };

  const canCancel =
    booking.status === "confirmed" || booking.status === "pending";
  const isPast = new Date(booking.date) < new Date().setHours(0, 0, 0, 0);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {booking.resourceId?.name || "Resource"}
            </h3>
            <span className={`badge ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {booking.resourceId?.type} • Capacity:{" "}
            {booking.resourceId?.capacity}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <FiCalendar size={16} />
          <span>{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <FiClock size={16} />
          <span>
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
        {booking.purpose && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Purpose:</span> {booking.purpose}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {canCancel && !isPast && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onCancel(booking._id)}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg transition-all hover:border-red-400 dark:hover:border-red-600 flex items-center justify-center space-x-2"
          >
            <FiX size={18} />
            <span>Cancel Booking</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
