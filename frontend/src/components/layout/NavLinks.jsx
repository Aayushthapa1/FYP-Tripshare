"use client";

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronDown, Car, Clock, History, Home, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function NavLinks() {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Get user info from Redux store
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const userRole = user?.role || "user";

  // Set mounted state after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Define navigation links
  const links = [
    { href: "/", label: "Home", icon: Home },
    {
      label: "Rides",
      icon: Car,
      children: [
        { href: "/trips", label: "Find Rides" },
        ...(isAuthenticated ? [
          { href: "/ridehistory", label: "Ride History" },
          { href: "/activeride", label: "Active Ride" },
          ...(userRole === "user" ? [
            { href: "/requestride", label: "Request a Ride" },
          ] : []),
          ...(userRole === "driver" ? [
            { href: "/tripForm", label: "Publish a Ride" },
            { href: "/pending", label: "Pending Rides" },
          ] : []),
        ] : []),
      ],
    },
    ...(isAuthenticated && userRole === "driver" ? [
      {
        label: "Driver",
        icon: Clock,
        children: [
          { href: "/driverdashboard", label: "Dashboard" },
          { href: "/tripForm", label: "Post a Ride" },
          { href: "/pending", label: "Pending Requests" },
        ],
      },
    ] : []),
    ...(isAuthenticated && userRole === "user" ? [
      {
        label: "User",
        icon: Clock,
        children: [
          { href: "/userDashboard", label: "Dashboard" },
          { href: "/requestride", label: "Request a Ride" },
        ],
      },
    ] : []),
    { href: "/contact", label: "Contact Us", icon: Phone },
  ];

  // Check if a link is active
  const isActive = (href) => {
    if (!mounted) return false;
    return location.pathname === href;
  };

  // Toggle dropdown
  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown !== null && !event.target.closest(".nav-dropdown")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  return (
    <div className="hidden md:flex items-center space-x-8">
      {links.map((link, index) => (
        <div key={index} className="relative nav-dropdown">
          {link.children ? (
            // Dropdown menu
            <div>
              <button
                onClick={() => toggleDropdown(index)}
                className={`flex items-center space-x-1 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeDropdown === index
                    ? "text-green-600"
                    : "text-gray-800 hover:text-green-600"
                }`}
                aria-expanded={activeDropdown === index}
              >
                {link.icon && <link.icon className="h-4 w-4 mr-1" />}
                <span>{link.label}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    activeDropdown === index ? "rotate-180 text-green-600" : ""
                  }`}
                />
              </button>

              {/* Dropdown content */}
              {activeDropdown === index && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                >
                  {link.children.map((childLink, childIndex) => (
                    <Link
                      key={childIndex}
                      to={childLink.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                    >
                      {childLink.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            // Regular link
            <Link
              to={link.href}
              className={`relative flex items-center py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.href)
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-800 hover:text-green-600"
              }`}
            >
              {link.icon && <link.icon className="h-4 w-4 mr-1" />}
              {link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}