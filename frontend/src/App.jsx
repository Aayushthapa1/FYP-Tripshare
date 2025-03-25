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

// Layout / Shared
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProfileModal from "./components/auth/ProfileModal.jsx";

//ride
import RideBooking from "./components/ride/UserRideBooking.jsx";
import RideStatus from "./components/ride/UserRideStatus.jsx";
import DriverRideStatus from "./components/ride/DriverRideStatus.jsx";

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
import AdminProfile from "./components/admin/components/adminProfile.jsx";
import AdminDashboard from "./components/admin/pages/AdminDashboard 3.jsx";
import ManageUsers from "./components/admin/pages/ManageUsers";
import ManageRides from "./components/admin/pages/ManageRides";
import ManagePayments from "./components/admin/pages/ManagePayments";
import ManageDisputes from "./components/admin/pages/ManageDisputes";
import AdminSettings from "./components/admin/pages/AdminSettings";
import DriverList from "./components/admin/pages/DriverList";
import AdminKYCRequests from "./components/admin/pages/KycVerification.jsx";

// User
import UserLayout from "./components/pages/UserLayout";
import NotFound from "./components/user/pages/NotFound";
import UserDashboard from "./components/user/pages/userDashboard.jsx";
import Sidebar from "./components/user/pages/userSidebar.jsx";

//payment
import PaymentSuccess from "./components/payment/paymentSuccess";
import PaymentFailed from "./components/payment/paymentFail";

//trips
import TripForm from "./components/trip/tripForm";
import TripList from "./components/trip/tripList";
import Bookinglist from "./components/trip/bookingList.jsx";

//DRIVER
import UserKycModal from "./components/driver/UserKYCModal.jsx";
import DriverKycModal from "./components/driver/DriverKYCModal.jsx";

// Auth
import RegisterPage from "./components/pages/RegisterPage";
import LoginPage from "./components/pages/LoginPage";
import UnauthPage from "./components/pages/UnAuthPage";

// Utils/Redux
import { checkAuth } from "./components/Slices/authSlice";
import CheckAuth from "./utils/ProtectedRoute"; // Adjust path if needed

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log("user", user);

  // Check authentication on first load
  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              user?.role === "Admin" ? (
                <Navigate to="/Admin" />
              ) : (
                <>
                  <Navbar />
                  <HeroSection />
                  <FeaturesSection />
                  <HowItWorks />
                  <PopularRoutes />
                  <ScrollToTopButton />
                  <Footer />
                </>
              )
            }
          />

          <Route path="/driverkyc" element={<DriverKycModal />} />
          <Route path="/userkyc" element={<UserKycModal />} />

          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/contact" element={<HelpCenter />} />
          <Route path="/profile/:userId" element={<ProfileModal />} />

          <Route path="/trips" element={<TripList />} />
          <Route path="/tripform" element={<TripForm />} />
          <Route path="/bookings/:bookingId" element={<Bookinglist />} />

          <Route path="/ridebooking" element={<RideBooking />} />
          <Route path="/ridestatus" element={<RideStatus />} />
          <Route path="/driverridestatus" element={<DriverRideStatus />} />

          {/* Auth Routes */}
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                user?.role === "Admin" ? (
                  <Navigate to="/Admin" />
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
                user?.role === "Admin" ? (
                  <Navigate to="/Admin" />
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
            path="/Admin"
            element={
              <CheckAuth role="Admin">
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
            <Route path="profile" element={<AdminProfile />} />
            <Route path="drivers" element={<DriverList />} />
            <Route path="kyc" element={<AdminKYCRequests />} />
          </Route>

          {/* User Routes (Protected) */}
          <Route
            path="/ride"
            element={
              <CheckAuth role="user">
                <UserLayout>
        
                </UserLayout>
              </CheckAuth>
            }
          />
          <Route
            path="/driver"
            element={
              <CheckAuth role="user">
                <UserLayout>
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
