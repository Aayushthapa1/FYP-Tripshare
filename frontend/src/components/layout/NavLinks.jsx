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
        ...(isAuthenticated
          ? [
              { href: "/activeride", label: "Active Ride" },
              ...(userRole === "user"
                ? [{ href: "/requestride", label: "Request a Ride" }]
                : []),
              ...(userRole === "driver"
                ? [
                    { href: "/tripForm", label: "Publish a Ride" },
                  ]
                : []),
            ]
          : []),
      ],
    },
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
    <div className="hidden md:flex items-center space-x-6">
      {links.map((link, index) => (
        <div key={index} className="relative nav-dropdown">
          {link.children ? (
            // Dropdown menu
            <div>
              <button
                onClick={() => toggleDropdown(index)}
                className={`flex items-center text-sm font-medium transition-colors ${
                  activeDropdown === index
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
                aria-expanded={activeDropdown === index}
              >
                {link.icon && (
                  <link.icon className="h-4 w-4 mr-1.5 opacity-80" />
                )}
                <span>{link.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 ml-1 transition-transform duration-200 ${
                    activeDropdown === index
                      ? "rotate-180 text-green-600"
                      : "opacity-70"
                  }`}
                />
              </button>

              {/* Dropdown content */}
              {activeDropdown === index && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5"
                >
                  {link.children.map((childLink, childIndex) => (
                    <Link
                      key={childIndex}
                      to={childLink.href}
                      className={`block px-4 py-2 text-sm ${
                        isActive(childLink.href)
                          ? "text-green-600 bg-green-50"
                          : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                      } transition-colors`}
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
              className={`group flex items-center text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-green-600"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              {link.icon && (
                <link.icon
                  className={`h-4 w-4 mr-1.5 ${
                    isActive(link.href)
                      ? "text-green-600"
                      : "opacity-80 group-hover:opacity-100"
                  }`}
                />
              )}
              <span>{link.label}</span>
              {isActive(link.href) && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500 transform translate-y-2"></div>
              )}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
