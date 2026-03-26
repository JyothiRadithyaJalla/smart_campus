const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
ChatMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
