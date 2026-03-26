const Booking = require("../models/Booking");
const Resource = require("../models/Resource");

exports.getUsageAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({
      status: { $ne: "cancelled" },
    });
    const activeBookings = await Booking.countDocuments({
      status: "confirmed",
      date: { $gte: new Date() },
    });
    const totalResources = await Resource.countDocuments();

    const bookingsByType = await Booking.aggregate([
      {
        $match: { status: { $ne: "cancelled" } },
      },
      {
        $lookup: {
          from: "resources",
          localField: "resourceId",
          foreignField: "_id",
          as: "resource",
        },
      },
      { $unwind: "$resource" },
      {
        $group: {
          _id: "$resource.type",
          count: { $sum: 1 },
        },
      },
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTrend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        totalResources,
        bookingsByType,
        recentTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching usage analytics",
    });
  }
};

exports.getPeakHours = async (req, res) => {
  try {
    const peakHoursData = await Booking.aggregate([
      {
        $match: { status: { $ne: "cancelled" } },
      },
      {
        $project: {
          hour: {
            $toInt: {
              $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0],
            },
          },
        },
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          hour: { $concat: [{ $toString: "$_id" }, ":00"] },
          count: 1,
        },
      },
    ]);

    const peakHour =
      peakHoursData.length > 0
        ? peakHoursData.reduce((max, curr) =>
            curr.count > max.count ? curr : max,
          )
        : null;

    res.status(200).json({
      success: true,
      data: {
        peakHour: peakHour ? peakHour.hour : "N/A",
        peakHourBookings: peakHour ? peakHour.count : 0,
        hourlyDistribution: peakHoursData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching peak hours",
    });
  }
};

exports.getTopResources = async (req, res) => {
  try {
    const topResources = await Booking.aggregate([
      {
        $match: { status: { $ne: "cancelled" } },
      },
      {
        $group: {
          _id: "$resourceId",
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "resources",
          localField: "_id",
          foreignField: "_id",
          as: "resource",
        },
      },
      { $unwind: "$resource" },
      {
        $project: {
          _id: 0,
          resourceId: "$_id",
          name: "$resource.name",
          type: "$resource.type",
          capacity: "$resource.capacity",
          image: "$resource.image",
          bookingCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topResources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching top resources",
    });
  }
};

exports.getUnderutilizedResources = async (req, res) => {
  try {
    const underutilized = await Resource.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "resourceId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          bookingCount: {
            $size: {
              $filter: {
                input: "$bookings",
                as: "booking",
                cond: { $ne: ["$$booking.status", "cancelled"] },
              },
            },
          },
        },
      },
      {
        $sort: { bookingCount: 1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          resourceId: "$_id",
          name: 1,
          type: 1,
          capacity: 1,
          image: 1,
          bookingCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: underutilized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching underutilized resources",
    });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [totalBookings, monthlyBookings, weeklyBookings, cancelledBookings] =
      await Promise.all([
        Booking.countDocuments({ status: { $ne: "cancelled" } }),
        Booking.countDocuments({
          status: { $ne: "cancelled" },
          createdAt: { $gte: startOfMonth },
        }),
        Booking.countDocuments({
          status: { $ne: "cancelled" },
          createdAt: { $gte: startOfWeek },
        }),
        Booking.countDocuments({ status: "cancelled" }),
      ]);

    const utilizationRate =
      totalBookings > 0
        ? (((totalBookings - cancelledBookings) / totalBookings) * 100).toFixed(
            1,
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        monthlyBookings,
        weeklyBookings,
        cancelledBookings,
        utilizationRate: parseFloat(utilizationRate),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching booking stats",
    });
  }
};
