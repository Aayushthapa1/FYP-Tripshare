// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public / home
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorks from "./components/home/HowItWorks";
import Features from "./components/Feature/Feature";
import PopularRoutes from "./components/home/PopularRoutes";

// Help / Contact
import HelpCenter from "./components/home/HelpCenter";

// Admin
import AdminLayout from "./components/admin/components/AdminLayout";
import AdminDashboard from "./components/admin/pages/AdminDashboard";
import ManageUsers from "./components/admin/pages/ManageUsers";
import ManageRides from "./components/admin/pages/ManageRides";
import ManagePayments from "./components/admin/pages/ManagePayments";
import ManageDisputes from "./components/admin/pages/ManageDisputes";
import AdminSettings from "./components/admin/pages/AdminSettings";

// User side
import BookRide from "./components/user/pages/BookRide";
import RiderDashboard from "./components/user/pages/RiderDashboard";
import NotFound from "./components/user/pages/NotFound";
// import ProfileModal from "./components/user/pages/ProfileModal";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page ("/") */}
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

        {/* Contact => shows HelpCenter */}
        <Route path="/contact" element={<HelpCenter />} />

        {/* Admin Routes ("/admin") */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="rides" element={<ManageRides />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="disputes" element={<ManageDisputes />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* === User routes === */}
        <Route path="/ride" element={<BookRide />} />
        <Route path="/driver" element={<RiderDashboard />} />
        {/* <Route path="/profile" element={<ProfileModal />} /> */}


        {/* 404 / NotFound (catch-all) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
