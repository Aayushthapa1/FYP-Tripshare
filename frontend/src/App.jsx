import React, { useEffect, useState } from "react";
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
import Booking from "./components/trip/Booking.jsx";



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
import socketService from "./components/socket/socketService"; // Import socket service

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth
  );
  const [authChecked, setAuthChecked] = useState(false);

  // Enhanced useEffect to ensure authentication state is properly restored and socket connection is established
  useEffect(() => {
    // Check cookie-based auth via API call
    const checkAuthStatus = async () => {
      try {
        const result = await dispatch(checkAuth()).unwrap();
        console.log("Authentication check result:", result);

        // If we have a user and they're authenticated, connect to socket
        if (result.success && result.result?.user_data?._id) {
          if (!socketService.connected) {
            socketService.connect();
          }
          socketService.sendUserInfo(
            result.result.user_data._id,
            result.result.user_data.role
          );
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Don't use localStorage fallback if using cookies for authentication
      } finally {
        // Mark auth check as complete regardless of result
        setAuthChecked(true);
      }
    };

    checkAuthStatus();

    // Cleanup socket connection on unmount
    return () => {
      if (socketService.connected) {
        socketService.disconnect();
      }
    };
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <Route
            path="/driverkyc"
            element={
              <CheckAuth>
                <DriverKycModal />
              </CheckAuth>
            }
          />
          <Route
            path="/userkyc"
            element={
              <CheckAuth>
                <UserKycModal />
              </CheckAuth>
            }
          />

          {/* Driver */}
          <Route
            path="/driverdashboard"
            element={
              <CheckAuth role="driver">
                <DriverDashboard />
              </CheckAuth>
            }
          />

          <Route
            path="/userDashboard"
            element={
              <CheckAuth>
                <UserDashboard />
              </CheckAuth>
            }
          />
          <Route
            path="/sidebar"
            element={
              <CheckAuth>
                <Sidebar />
              </CheckAuth>
            }
          />
          <Route
            path="/payment-success"
            element={
              <CheckAuth>
                <PaymentSuccess />
              </CheckAuth>
            }
          />
          <Route
            path="/payment-failed"
            element={
              <CheckAuth>
                <PaymentFailed />
              </CheckAuth>
            }
          />
          <Route path="/contact" element={<HelpCenter />} />
          <Route
            path="/profile/:userId"
            element={
              <CheckAuth>
                <ProfileModal />
              </CheckAuth>
            }
          />

          {/* Trips */}
          <Route
            path="/trips"
            element={
              <CheckAuth>
                <TripList />
              </CheckAuth>
            }
          />
          <Route
            path="/tripform"
            element={
              <CheckAuth>
                <TripForm />
              </CheckAuth>
            }
          />
          <Route
            path="/bookings"
            element={
              <CheckAuth>
                <Bookinglist />
              </CheckAuth>
            }
          />
         
          <Route
            path="/booking/:tripId"
            element={
              <CheckAuth>
                <Booking />
              </CheckAuth>
            }
          />
          
         
          {/* <Route
            path="/ratingform"
            element={
              <CheckAuth>
                <RatingForm />
              </CheckAuth>
            }
          /> */}


          {/* Ride */}
          <Route
            path="/requestride"
            element={
              <CheckAuth>
                <RideBooking />
              </CheckAuth>
            }
          />
          <Route
            path="/ridestatus"
            element={
              <CheckAuth>
                <RideStatus />
              </CheckAuth>
            }
          />
          <Route
            path="/driverridestatus"
            element={
              <CheckAuth role="driver">
                <DriverRideStatus />
              </CheckAuth>
            }
          />

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
          <Route path="/resetpassword/:token" element={<ResetPassword />} />

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
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
            {/* <Route path="drivers" element={<DriverList />} /> */}
            <Route path="kyc" element={<AdminKYCRequests />} />
          </Route>

          {/* User Routes (Protected) */}
          <Route
            path="/ride"
            element={
              <CheckAuth>
                <UserLayout />
              </CheckAuth>
            }
          />
          <Route
            path="/driver"
            element={
              <CheckAuth role="driver">
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
