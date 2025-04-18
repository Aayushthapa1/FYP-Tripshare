import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProfileModal from "./components/auth/ProfilePage.jsx";

// Ride
import RideBooking from "./components/ride/UserRideBooking.jsx";
import RideStatus from "./components/ride/UserRideStatus.jsx";
import DriverRideStatus from "./components/ride/DriverRideStatus.jsx";
import DriverDashboard from "./components/driver/DriverDashboard.jsx";

//chat
import ChatPage from "./components/chat/chatPage.jsx";
import ChatList from "./components/chat/chatList.jsx";

// Socket Provider
import { SocketProvider } from "./components/socket/SocketProvider.jsx";

// Public/Home
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorks from "./components/home/HowItWorks";
import PopularRoutes from "./components/home/PopularRoutes";
import HelpCenter from "./components/home/HelpCenter";
import ScrollToTopButton from "./components/scrollToTop";

// Admin
import AdminLayout from "./components/admin/components/AdminLayout";
import AdminProfile from "./components/admin/components/adminProfile.jsx";
import AdminDashboard from "./components/admin/pages/AdminDashboard.jsx";
import ManageUsers from "./components/admin/pages/ManageUsers";
import ManageRides from "./components/admin/pages/ManageRides";
import PaymentDashboard from "./components/admin/pages/PaymentDashboard.jsx";
import ManageDisputes from "./components/admin/pages/ManageDisputes";
import AdminSettings from "./components/admin/pages/AdminSettings";
// import DriverList from "./components/admin/pages/DriverList";
import AdminKYCRequests from "./components/admin/pages/KycVerification.jsx";

// User
import UserLayout from "./components/pages/UserLayout";
import NotFound from "./components/user/pages/NotFound";
import UserDashboard from "./components/user/pages/userDashboard.jsx";
import Sidebar from "./components/user/pages/userSidebar.jsx";

// Payment
import PaymentSuccess from "./components/payment/paymentSuccess";
import PaymentFailed from "./components/payment/paymentFail";

// Trips
import TripForm from "./components/trip/tripForm";
import TripList from "./components/trip/tripList";
import Bookinglist from "./components/trip/bookingList.jsx";

// Driver
import UserKycModal from "./components/driver/UserKYCModal.jsx";
import DriverKycModal from "./components/driver/DriverKYCModal.jsx";

// Auth
import RegisterPage from "./components/pages/RegisterPage";
import LoginPage from "./components/pages/LoginPage";
import ForgotPassword from "./components/auth/forgotPassword";
import ResetPassword from "./components/auth/resetPassword";
import UnauthPage from "./components/pages/UnAuthPage";
import { checkAuth } from "./components/Slices/authSlice";
import CheckAuth from "./utils/ProtectedRoute"; // or wherever your ProtectedRoute is located

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check token-based auth in Redux
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <SocketProvider>
      <Router>
        <Routes>
          {/* Public/Home route */}
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

          {/* KYC modals if you want them as standalone routes */}
          <Route path="/driverkyc" element={<DriverKycModal />} />
          <Route path="/userkyc" element={<UserKycModal />} />

          {/* Driver */}
          <Route path="/driverdashboard" element={<DriverDashboard />} />

          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/contact" element={<HelpCenter />} />
          <Route path="/profile/:userId" element={<ProfileModal />} />

          {/* Trips */}
          <Route path="/trips" element={<TripList />} />
          <Route path="/tripform" element={<TripForm />} />
          <Route path="/bookings" element={<Bookinglist />} />

          {/* Ride */}
          <Route path="/requestride" element={<RideBooking />} />
          <Route path="/ridestatus" element={<RideStatus />} />
          <Route path="/driverridestatus" element={<DriverRideStatus />} />

          {/* Chat Routes */}
          <Route path="/chats" element={<ChatList />} />
          <Route path="/chats/:tripId" element={<ChatPage />} />

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
          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
            <Route path="payments" element={<PaymentDashboard />} />
            <Route path="disputes" element={<ManageDisputes />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
            {/* <Route path="drivers" element={<DriverList />} /> */}
            <Route path="kyc" element={<AdminKYCRequests />} />
          </Route>

          {/* User Routes (Protected) */}
          <Route
            path="/ride"
            element={
              <CheckAuth role="user">
                <UserLayout />
              </CheckAuth>
            }
          />
          <Route
            path="/driver"
            element={
              <CheckAuth role="user">
                <UserLayout />
              </CheckAuth>
            }
          />

          {/* Misc */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
