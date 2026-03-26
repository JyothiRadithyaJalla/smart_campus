import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  };

  const signup = async (data) => {
    try {
      const response = await authAPI.signup(data);
      const { token, user: userData } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to connect to server. Please ensure backend is running on http://localhost:5000";
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      const { token, user: userData } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Welcome back!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to connect to server. Please ensure backend is running on http://localhost:5000";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
