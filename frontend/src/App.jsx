// src/App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout / Shared
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import UserInfoModal from "./components/layout/UserInfoModal";

// Public/Home
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorks from "./components/home/HowItWorks";
import PopularRoutes from "./components/home/PopularRoutes";
import HelpCenter from "./components/home/HelpCenter";
// import DriverRegistrationForm from "./components/home/DriverRegistrationForm";
import ScrollToTopButton from "./components/scrollToTop";
// Admin
import AdminLayout from "./components/admin/components/AdminLayout";
import AdminDashboard from "./components/admin/pages/AdminDashboard";
import ManageUsers from "./components/admin/pages/ManageUsers";
import ManageRides from "./components/admin/pages/ManageRides";
import ManagePayments from "./components/admin/pages/ManagePayments";
import ManageDisputes from "./components/admin/pages/ManageDisputes";
import AdminSettings from "./components/admin/pages/AdminSettings";

// User
import UserLayout from "./components/pages/UserLayout";
import BookRide from "./components/user/pages/BookRide";
import RiderDashboard from "./components/user/pages/RiderDashboard";
import NotFound from "./components/user/pages/NotFound";

//payment
import PaymentForm from "./components/payment/PaymentForm";

//trips
import TripForm from "./components/trip/tripForm";

//drivers
import DriverDashboard from "./components/driver/driverDashboard";
import DriverSchedules from "./components/driver/driverSchedules";
// Auth
import RegisterPage from "./components/pages/RegisterPage";
import LoginPage from "./components/pages/LoginPage";
import UnauthPage from "./components/pages/UnAuthPage";

// Utils/Redux
import { checkAuth } from "./authSetup";
import CheckAuth from "./utils/ProtectedRoute"; // Adjust path if needed

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log("user", user)
  console.log("", isAuthenticated);

  // Check authentication on first load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <UserInfoModal />
                <HeroSection />
                <FeaturesSection />
                <HowItWorks />
                <PopularRoutes />
                <ScrollToTopButton />
                
                <Footer />
              </>
            }
          />
          <Route path="/contact" element={<HelpCenter />} />
          {/* <Route
            path="/driverregistration"
            element={<DriverRegistrationForm />}
          /> */}
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/driverdashboard" element={<DriverDashboard />} />
          <Route path="/driverschedules" element={<DriverSchedules />} />
          <Route path="/tripform" element={<TripForm/>} />

          {/* Auth Routes */}
          <Route
          path="/register"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <LoginPage />
            )
          }
        />

          {/* Admin Routes (Protected) */}
          <Route
            path="/admin"
            element={
              <CheckAuth role="admin">
                <AdminLayout />
              </CheckAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="rides" element={<ManageRides />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="disputes" element={<ManageDisputes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* User Routes (Protected) */}
          <Route
            path="/ride"
            element={
              <CheckAuth role="user">
                <UserLayout>
                  <BookRide />
                </UserLayout>
              </CheckAuth>
            }
          />
          <Route
            path="/driver"
            element={
              <CheckAuth role="user">
                <UserLayout>
                  <RiderDashboard />
                </UserLayout>
              </CheckAuth>
            }
          />

          {/* Misc */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
