const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Please provide a booking date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide end time"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    purpose: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ resourceId: 1, date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1, date: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ resourceId: 1, status: 1 });

bookingSchema.statics.checkConflict = async function (
  resourceId,
  date,
  startTime,
  endTime,
  excludeBookingId = null,
) {
  const query = {
    resourceId,
    date: new Date(date),
    status: { $ne: "cancelled" },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBookings = await this.find(query);

  for (let booking of existingBookings) {
    if (isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
      };
    }
  }

  return { hasConflict: false };
};

function isTimeOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

module.exports = mongoose.model("Booking", bookingSchema);
