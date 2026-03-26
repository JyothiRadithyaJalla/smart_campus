import { memo } from "react";
import { FiMapPin, FiUsers, FiClock } from "react-icons/fi";

const ResourceCard = ({ resource, onBook, showBookButton = true }) => {
  const typeColors = {
    classroom: "from-blue-500 to-blue-600",
    lab: "from-purple-500 to-purple-600",
    sports: "from-green-500 to-green-600",
  };

  const typeIcons = {
    classroom: "🎓",
    lab: "🔬",
    sports: "⚽",
  };

  return (
    <div className="card card-hover overflow-hidden group">
      <div className="relative h-48 overflow-hidden rounded-lg mb-4">
        <img
          src={
            resource.image ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75"
          }
          alt={resource.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className={`absolute top-3 right-3 bg-gradient-to-r ${
            typeColors[resource.type] || typeColors.classroom
          } text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}
        >
          <span>{typeIcons[resource.type] || "📍"}</span>
          <span className="capitalize">{resource.type}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {resource.name}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {resource.description}
      </p>

      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <FiUsers size={16} />
          <span>{resource.capacity} capacity</span>
        </div>
        {resource.isAvailable !== false && (
          <span className="badge badge-success">Available</span>
        )}
      </div>

      {showBookButton && (
        <button onClick={() => onBook(resource)} className="btn-primary w-full">
          Book Now
        </button>
      )}
    </div>
  );
};

export default memo(ResourceCard);
