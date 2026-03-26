const ChatMessage = require("../models/chatMessage");
const Resource = require("../models/Resource");
const Booking = require("../models/Booking");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Pattern matching to detect user intent
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Greeting patterns
  if (
    /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(
      lowerMessage,
    )
  ) {
    return "greeting";
  }

  // Resource search patterns
  if (
    /(find|search|look for|show me|available|list).*(classroom|lab|sports|room|resource)/i.test(
      lowerMessage,
    ) ||
    /(classroom|lab|sports).*(available|free)/i.test(lowerMessage)
  ) {
    return "resource_search";
  }

  // Availability check patterns
  if (
    /(is|check).*(available|free)/i.test(lowerMessage) ||
    /availability/i.test(lowerMessage) ||
    /can i book/i.test(lowerMessage)
  ) {
    return "availability";
  }

  // Booking status patterns
  if (
    /(my|view|show|check).*(booking|reservation)/i.test(lowerMessage) ||
    /booking (status|history)/i.test(lowerMessage)
  ) {
    return "booking_status";
  }

  // Help patterns
  if (/(help|how to|what can|guide|assist)/i.test(lowerMessage)) {
    return "help";
  }

  // Cancel booking patterns
  if (/(cancel|delete|remove).*(booking)/i.test(lowerMessage)) {
    return "cancel_booking";
  }

  return "unknown";
};

// Extract resource type from message
const extractResourceType = (message) => {
  const lowerMessage = message.toLowerCase();
  if (/classroom/i.test(lowerMessage)) return "classroom";
  if (/lab/i.test(lowerMessage)) return "lab";
  if (/sports/i.test(lowerMessage)) return "sports";
  return null;
};

// Get context data for AI
const getContextData = async (userId) => {
  try {
    // Get available resources
    const resources = await Resource.find({ isAvailable: true }).limit(20);

    // Get user's recent bookings
    const userBookings = await Booking.find({ userId })
      .populate("resourceId")
      .sort({ date: -1 })
      .limit(5);

    return {
      resources,
      userBookings,
      totalResources: await Resource.countDocuments(),
      availableResources: resources.length,
    };
  } catch (error) {
    console.error("Error getting context:", error);
    return null;
  }
};

// Generate AI response using Gemini
const generateAIResponse = async (message, userId) => {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log("Gemini API key not configured, using fallback");
      return null;
    }

    // Get context data
    const context = await getContextData(userId);
    if (!context) return null;

    // Prepare context for AI
    const resourcesList = context.resources
      .map((r) => `- ${r.name} (${r.type}) - Capacity: ${r.capacity}`)
      .join("\n");

    const bookingsList =
      context.userBookings.length > 0
        ? context.userBookings
            .map(
              (b) =>
                `- ${b.resourceId?.name || "Unknown"} on ${new Date(b.date).toLocaleDateString()} (${b.startTime}-${b.endTime}) - ${b.status}`,
            )
            .join("\n")
        : "No bookings yet";

    // Create system prompt with context
    const systemPrompt = `You are a helpful Campus Resource Assistant chatbot. 

Your role is to help students and faculty with:
- Finding and booking campus resources (classrooms, labs, sports facilities)
- Checking resource availability
- Managing their bookings
- Answering questions about the booking system

CURRENT CONTEXT:
Available Resources (${context.availableResources} out of ${context.totalResources}):
${resourcesList}

User's Recent Bookings:
${bookingsList}

GUIDELINES:
- Be friendly, concise, and helpful
- When listing resources, show name, type, and capacity
- When discussing bookings, include date, time, and status
- If asked about specific resources, search the available list
- If user wants to book, guide them to use the Resources page
- Use emojis sparingly but appropriately
- Keep responses under 200 words unless listing multiple items

USER MESSAGE: ${message}

Provide a helpful response:`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    return aiResponse;
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    return null;
  }
};

// Generate response based on intent and context
const generateResponse = async (intent, message, userId) => {
  let response = "";
  let metadata = {};

  try {
    switch (intent) {
      case "greeting":
        response = `Hello! 👋 I'm your Campus Resource Assistant. I can help you with:
• Finding available resources (classrooms, labs, sports facilities)
• Checking booking availability
• Viewing your bookings
• Answering questions about the booking system

What would you like to know?`;
        break;

      case "resource_search":
        const resourceType = extractResourceType(message);
        const query = resourceType ? { type: resourceType } : {};
        const resources = await Resource.find(query).limit(10);

        if (resources.length === 0) {
          response =
            "I couldn't find any resources matching your criteria. Please try a different search.";
        } else {
          const availableResources = resources.filter((r) => r.isAvailable);
          response = `I found ${resources.length} resource(s)${resourceType ? ` of type "${resourceType}"` : ""}:\n\n`;

          availableResources.slice(0, 5).forEach((resource, index) => {
            response += `${index + 1}. ${resource.name} - Capacity: ${resource.capacity} - ${resource.isAvailable ? "✅ Available" : "❌ Not Available"}\n`;
          });

          if (availableResources.length > 5) {
            response += `\n...and ${availableResources.length - 5} more. Visit the Resources page to see all options.`;
          }

          metadata.resourceCount = resources.length;
          metadata.resourceType = resourceType;
        }
        break;

      case "availability":
        const allResources = await Resource.find({ isAvailable: true }).limit(
          5,
        );
        if (allResources.length === 0) {
          response =
            "Sorry, there are no available resources at the moment. Please check back later.";
        } else {
          response = `Currently, we have ${allResources.length} available resources:\n\n`;
          allResources.forEach((resource, index) => {
            response += `${index + 1}. ${resource.name} (${resource.type}) - Capacity: ${resource.capacity}\n`;
          });
          response +=
            "\nYou can book any of these resources from the Resources page!";
        }
        break;

      case "booking_status":
        const userBookings = await Booking.find({ userId })
          .populate("resourceId")
          .sort({ date: -1 })
          .limit(5);

        if (userBookings.length === 0) {
          response =
            "You don't have any bookings yet. Would you like to make a booking?";
        } else {
          response = `You have ${userBookings.length} recent booking(s):\n\n`;
          userBookings.forEach((booking, index) => {
            const date = new Date(booking.date).toLocaleDateString();
            const resourceName = booking.resourceId?.name || "Unknown Resource";
            response += `${index + 1}. ${resourceName} - ${date} (${booking.startTime} - ${booking.endTime}) - Status: ${booking.status}\n`;
          });
          response += "\nVisit 'My Bookings' to see more details!";
          metadata.bookingCount = userBookings.length;
        }
        break;

      case "help":
        response = `I'm here to help! Here's what I can do:

📚 **Resource Search**: Ask me to find classrooms, labs, or sports facilities
   Example: "Show me available classrooms"

✅ **Check Availability**: Ask about available resources
   Example: "What resources are available?"

📅 **View Bookings**: Check your booking status
   Example: "Show my bookings"

🔍 **General Questions**: Ask me anything about the booking system!

What would you like help with?`;
        break;

      case "cancel_booking":
        response =
          "To cancel a booking, please visit the 'My Bookings' page where you can view and manage all your bookings. Click on the booking you want to cancel and select the cancel option.";
        break;

      default:
        response = `I'm not sure I understood that. I can help you with:
• Finding available resources
• Checking availability
• Viewing your bookings
• General questions about the system

Could you please rephrase your question?`;
    }
  } catch (error) {
    console.error("Error generating response:", error);
    response =
      "I encountered an error while processing your request. Please try again.";
  }

  return { response, metadata };
};

// Send message and get response
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a message",
      });
    }

    let response = "";
    let metadata = { aiPowered: false };
    let intent = "unknown";

    // Try using Gemini AI first
    const aiResponse = await generateAIResponse(message, userId);

    if (aiResponse) {
      // AI generated response successfully
      response = aiResponse;
      metadata.aiPowered = true;
      intent = "ai_response";
    } else {
      // Fallback to pattern matching
      intent = detectIntent(message);
      const fallbackResult = await generateResponse(intent, message, userId);
      response = fallbackResult.response;
      metadata = { ...metadata, ...fallbackResult.metadata };
    }

    // Save chat message to database
    const chatMessage = await ChatMessage.create({
      user: userId,
      message: message.trim(),
      response,
      isBot: false,
    });

    res.status(200).json({
      success: true,
      data: {
        message: chatMessage.message,
        response: chatMessage.response,
        intent,
        metadata,
        timestamp: chatMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing message",
      error: error.message,
    });
  }
};

// Get chat history for the user
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chatHistory = await ChatMessage.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatMessage.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: chatHistory.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: chatHistory.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chat history",
      error: error.message,
    });
  }
};

// Clear chat history
exports.clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await ChatMessage.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearChatHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing chat history",
      error: error.message,
    });
  }
};
