import { memo } from "react";

const StatCard = ({ icon: Icon, title, value, color, trend }) => {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default memo(StatCard);
