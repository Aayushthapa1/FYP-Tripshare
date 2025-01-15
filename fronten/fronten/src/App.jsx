// src/App.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorks from "./components/home/HowItWorks";
import Features from "./components/Feature/Feature";
import PopularRoutes from "./components/home/PopularRoutes";
import HelpCenter from "./components/home/HelpCenter";

// Admin imports
import AdminLayout from "./components/admin/components/adminLayout";
import AdminDashboard from "./components/admin/pages/adminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* =======================
            Public site route ("/")
        ======================= */}
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
              <HelpCenter />
            </>
          }
        />

        {/* About route -> loads HelpCenter page */}
        <Route path="/Helpcentre" element={<HelpCenter />} />

        {/* ========================
            Admin Routes ("/admin")
        ======================== */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* /admin => AdminDashboard */}
          <Route index element={<AdminDashboard />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
