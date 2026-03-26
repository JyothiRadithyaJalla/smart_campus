import React from "react";
import PropTypes from "prop-types";

const ChatMessage = ({ message, isBot, timestamp }) => {
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4 animate-fadeIn`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 shadow-md ${
          isBot
            ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            : "bg-blue-600 text-white"
        }`}
      >
        {isBot && (
          <div className="flex items-center mb-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              🤖 Campus Assistant
            </span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        <span
          className={`text-xs mt-1 block ${
            isBot ? "text-gray-500 dark:text-gray-400" : "text-blue-100"
          }`}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isBot: PropTypes.bool,
  timestamp: PropTypes.string.isRequired,
};

ChatMessage.defaultProps = {
  isBot: false,
};

export default ChatMessage;
