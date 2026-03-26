const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a resource name"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["classroom", "lab", "sports"],
      required: [true, "Please specify resource type"],
    },
    capacity: {
      type: Number,
      required: [true, "Please provide capacity"],
      min: [1, "Capacity must be at least 1"],
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75",
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    features: [
      {
        type: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

resourceSchema.index({ type: 1 });
resourceSchema.index({ name: "text", description: "text" });
resourceSchema.index({ isAvailable: 1 });

resourceSchema.virtual("currentStatus").get(function () {
  return this.isAvailable ? "available" : "maintenance";
});

module.exports = mongoose.model("Resource", resourceSchema);
