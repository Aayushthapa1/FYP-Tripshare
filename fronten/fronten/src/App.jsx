// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Layout / Shared
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public/Home
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorks from "./components/home/HowItWorks";
import Features from "./components/Feature/Feature";
import PopularRoutes from "./components/home/PopularRoutes";
import HelpCenter from "./components/home/HelpCenter";

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

// Auth
import RegisterPage from "./components/pages/RegisterPage.jsx";
import LoginPage from "./components/pages/LoginPage.jsx";
import UnauthPage from "./components/pages/UnAuthPage.jsx"; // If you want an unauthorized page

// Redux
import { checkAuth } from "./components/Feature/auth/authSlice.jsx";
import CheckAuth from "./components/utils/ProtectedRoute.jsx";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is authenticated on app load
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          {/* =========================
              Public Home Page ("/")
          ========================== */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HeroSection />
                <FeaturesSection />
                <HowItWorks />
                <Features />
                <PopularRoutes />
                <Footer />
              </>
            }
          />

          {/* =======================
              Public Contact Page
          ======================== */}
          <Route path="/contact" element={<HelpCenter />} />

          {/* =======================
              Auth Routes
          ======================== */}
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

          {/* ==================================
              Admin Routes (Protected by role)
          =================================== */}
          <Route
            path="/admin"
            element={
              <CheckAuth role="admin">
                <AdminLayout />
              </CheckAuth>
            }
          >
            {/* Nested admin routes */}
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="rides" element={<ManageRides />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="disputes" element={<ManageDisputes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* =======================
              Example User Routes
          ======================== */}
          <Route
            path="/ride"
            element={
              <CheckAuth role="user">
                <UserLayout>
                  <BookRide />
                </UserLayout>
              {/* </CheckAuth> */}
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

          {/* =======================
              404 / Catch-All
          ======================== */}
          <Route path="/unauth-page" element={<UnauthPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
