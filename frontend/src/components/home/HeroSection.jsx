"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Users,
  MapPin,
  Shield,
  Star,
  Search,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    // Set loaded state after a small delay to trigger animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFindRide = () => {
    navigate("/trips");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const fadeInUp = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with optimized loading */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gray-900 animate-pulse"
          style={{
            opacity: isLoaded ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}
        ></div>
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 1s ease-in",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60" />

        {/* Animated dots overlay with reduced opacity for cleaner look */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_1px,_transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Animated badge */}
          <motion.div variants={fadeInUp} className="inline-block mb-6">
          </motion.div>

          {/* Main heading with animation */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6"
          >
            Travel Together.
            <motion.span
              variants={fadeInUp}
              className="block mt-2 text-green-400"
            >
              Save Together.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto"
          >
            Join our community of travelers  across the country. <br/>
            Save money, reduce emissions, and make new connections.
          </motion.p>

          {/* Stats section with improved layout */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 transform transition-transform hover:scale-105 hover:bg-white/15">
              <div className="text-2xl md:text-3xl font-bold text-white">
                10K+
              </div>
              <div className="text-sm text-gray-300">Active users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 transform transition-transform hover:scale-105 hover:bg-white/15">
              <div className="text-2xl md:text-3xl font-bold text-white">
                5K+
              </div>
              <div className="text-sm text-gray-300">Rides shared</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 transform transition-transform hover:scale-105 hover:bg-white/15">
              <div className="text-2xl md:text-3xl font-bold text-white">
                50+
              </div>
              <div className="text-sm text-gray-300">Cities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 transform transition-transform hover:scale-105 hover:bg-white/15">
              <div className="text-2xl md:text-3xl font-bold text-white">
                30%
              </div>
              <div className="text-sm text-gray-300">Cost savings</div>
            </div>
          </motion.div>

          {/* CTA buttons with improved styling */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-8 md:mb-12"
          >
            <button
              onClick={handleFindRide}
              className="group relative px-6 py-3 md:px-8 md:py-4 bg-green-500 text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-green-600 shadow-lg hover:shadow-green-500/30 flex items-center justify-center"
            >
              <span className="relative z-10 text-base md:text-lg font-medium flex items-center">
                Find a Ride
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>

            <button className="group relative px-6 py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/20 border border-white/20 shadow-lg flex items-center justify-center">
              <span className="relative z-10 text-base md:text-lg font-medium flex items-center">
                Offer a Ride
                <Users className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
            </button>
          </motion.div>

          {/* Search bar with enhanced styling */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSearch}
            className="relative max-w-2xl mx-auto mb-12"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-md text-white placeholder-gray-300 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center"
              >
                Search
                <ChevronRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </motion.form>

          {/* Trust indicators with improved spacing and hover effects */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 md:gap-8"
          >
            <div className="flex items-center text-gray-300 hover:text-green-300 transition-colors px-2 py-1">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>Verified Drivers</span>
            </div>
            <div className="flex items-center text-gray-300 hover:text-green-300 transition-colors px-2 py-1">
              <Star className="w-5 h-5 mr-2 text-green-400" />
              <span>Rated Journeys</span>
            </div>
            <div className="flex items-center text-gray-300 hover:text-green-300 transition-colors px-2 py-1">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              <span>Real-time Tracking</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements with improved gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
    </section>
  );
}
