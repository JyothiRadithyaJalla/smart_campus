import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

export const resourceAPI = {
  getAll: (params) => api.get("/resources", { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post("/resources", data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const bookingAPI = {
  create: (data) => api.post("/bookings/create", data),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  getAllBookings: () => api.get("/bookings/all"),
  cancel: (id) => api.put(`/bookings/cancel/${id}`),
  checkAvailability: (data) => api.post("/bookings/check-availability", data),
};

export const analyticsAPI = {
  getUsage: () => api.get("/analytics/usage"),
  getPeakHours: () => api.get("/analytics/peak-hours"),
  getTopResources: () => api.get("/analytics/top-resources"),
  getUnderutilized: () => api.get("/analytics/underutilized"),
  getStats: () => api.get("/analytics/stats"),
};

export default api;
