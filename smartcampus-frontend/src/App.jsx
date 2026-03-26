import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import ChatWidget from "./components/ChatWidget";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Analytics from "./pages/Analytics";
import QRBooking from "./pages/QRBooking";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />}
        />

        {/* QR Code Route - Public */}
        <Route
          path="/book/resource/:id"
          element={isAuthenticated ? <QRBooking /> : <Navigate to="/login" />}
        />

        {/* Protected Routes */}
        <Route
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Chatbot Widget - Show only when authenticated */}
      {isAuthenticated && <ChatWidget />}
    </Router>
  );
}

export default App;
