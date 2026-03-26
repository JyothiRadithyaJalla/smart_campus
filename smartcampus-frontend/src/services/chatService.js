import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const chatAPI = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

chatAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Send a message to chatbot
export const sendMessage = async (message) => {
  try {
    const response = await chatAPI.post("/chat/message", { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get chat history
export const getChatHistory = async (limit = 50, page = 1) => {
  try {
    const response = await chatAPI.get("/chat/history", {
      params: { limit, page },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Clear chat history
export const clearChatHistory = async () => {
  try {
    const response = await chatAPI.delete("/chat/history");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};
