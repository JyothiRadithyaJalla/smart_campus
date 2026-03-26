const Booking = require("../models/Booking");
const Resource = require("../models/Resource");
const {
  sendBookingConfirmation,
  sendBookingCancellation,
} = require("../utils/emailService");

exports.createBooking = async (req, res) => {
  try {
    const { resourceId, date, startTime, endTime, purpose } = req.body;
    const userId = req.user._id;

    if (!resourceId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const conflictCheck = await Booking.checkConflict(
      resourceId,
      date,
      startTime,
      endTime,
    );

    if (conflictCheck.hasConflict) {
      const alternatives = await findAlternativeResources(
        resource.type,
        resourceId,
        date,
        startTime,
        endTime,
      );

      return res.status(409).json({
        success: false,
        message: "Time slot already booked for this resource",
        conflict: true,
        conflictingBooking: conflictCheck.conflictingBooking,
        alternatives,
      });
    }

    const booking = await Booking.create({
      userId,
      resourceId,
      date,
      startTime,
      endTime,
      purpose,
      status: "confirmed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("resourceId", "name type capacity");

    // Send confirmation email
    try {
      await sendBookingConfirmation(
        populatedBooking.userId.email,
        populatedBooking.userId.name,
        {
          resourceName: populatedBooking.resourceId.name,
          resourceType: populatedBooking.resourceId.type,
          date: populatedBooking.date,
          startTime: populatedBooking.startTime,
          endTime: populatedBooking.endTime,
          purpose: populatedBooking.purpose,
          bookingId: populatedBooking._id,
        },
      );
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating booking",
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const bookings = await Booking.find({ userId })
      .populate("resourceId", "name type capacity image")
      .sort("-date -startTime")
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching bookings",
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("resourceId", "name type capacity")
      .sort("-createdAt")
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching bookings",
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    // Get populated booking data for email
    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("resourceId", "name type");

    // Send cancellation email
    try {
      await sendBookingCancellation(
        populatedBooking.userId.email,
        populatedBooking.userId.name,
        {
          resourceName: populatedBooking.resourceId.name,
          resourceType: populatedBooking.resourceId.type,
          date: populatedBooking.date,
          startTime: populatedBooking.startTime,
          endTime: populatedBooking.endTime,
          bookingId: populatedBooking._id,
        },
      );
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Don't fail the cancellation if email fails
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error cancelling booking",
    });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { resourceId, date, startTime, endTime } = req.body;

    const conflictCheck = await Booking.checkConflict(
      resourceId,
      date,
      startTime,
      endTime,
    );

    res.status(200).json({
      success: true,
      available: !conflictCheck.hasConflict,
      conflict: conflictCheck.hasConflict
        ? conflictCheck.conflictingBooking
        : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error checking availability",
    });
  }
};

async function findAlternativeResources(
  type,
  excludeResourceId,
  date,
  startTime,
  endTime,
) {
  try {
    const allResourcesOfType = await Resource.find({
      type,
      _id: { $ne: excludeResourceId },
      isAvailable: true,
    })
      .select("_id name type capacity image")
      .limit(10)
      .lean();

    const availableAlternatives = [];

    for (let resource of allResourcesOfType) {
      const conflictCheck = await Booking.checkConflict(
        resource._id,
        date,
        startTime,
        endTime,
      );

      if (!conflictCheck.hasConflict) {
        availableAlternatives.push({
          id: resource._id,
          name: resource.name,
          type: resource.type,
          capacity: resource.capacity,
          image: resource.image,
        });
      }

      if (availableAlternatives.length >= 3) break;
    }

    return availableAlternatives;
  } catch (error) {
    console.error("Error finding alternatives:", error);
    return [];
  }
}
