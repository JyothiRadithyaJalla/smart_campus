const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.post("/message", protect, sendMessage);
router.get("/history", protect, getChatHistory);
router.delete("/history", protect, clearChatHistory);

module.exports = router;
