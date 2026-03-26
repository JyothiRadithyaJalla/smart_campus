const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  checkAvailability,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

router.post("/create", protect, createBooking);
router.get("/user/:userId", protect, getUserBookings);
router.get("/all", protect, authorize("admin", "faculty"), getAllBookings);
router.put("/cancel/:id", protect, cancelBooking);
router.post("/check-availability", checkAvailability);

module.exports = router;
