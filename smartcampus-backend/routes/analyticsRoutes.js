const express = require("express");
const router = express.Router();
const {
  getUsageAnalytics,
  getPeakHours,
  getTopResources,
  getUnderutilizedResources,
  getBookingStats,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");

router.get("/usage", protect, getUsageAnalytics);
router.get("/peak-hours", protect, getPeakHours);
router.get("/top-resources", protect, getTopResources);
router.get("/underutilized", protect, getUnderutilizedResources);
router.get("/stats", protect, getBookingStats);

module.exports = router;
