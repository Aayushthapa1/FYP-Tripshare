"use client";

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChevronDown,
  Car,
  Clock,
  History,
  Home,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";

export default function NavLinks({ mobile = false, onClick = () => {} }) {
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
        { href: "/trips", label: "Find Rides", icon: MapPin },
        ...(isAuthenticated
          ? [
              { href: "/activeride", label: "Active Ride", icon: Clock },
              ...(userRole === "user"
                ? [{ href: "/requestride", label: "Request a Ride", icon: Car }]
                : []),
              ...(userRole === "driver"
                ? [
                    { href: "/tripForm", label: "Publish a Ride", icon: Car },
                    {
                      href: "/driverridestatus",
                      label: "Manage Rides",
                      icon: Clock,
                    },
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

  // Mobile Navigation Links
  if (mobile) {
    return (
      <div className="space-y-1">
        {links.map((link, index) => (
          <div key={index} className="nav-dropdown">
            {link.children ? (
              // Dropdown menu for mobile
              <div>
                <button
                  onClick={() => toggleDropdown(index)}
                  className={`flex items-center justify-between w-full p-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeDropdown === index
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-expanded={activeDropdown === index}
                >
                  <div className="flex items-center">
                    {link.icon && (
                      <link.icon
                        className={`h-4 w-4 mr-2 ${
                          activeDropdown === index
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      />
                    )}
                    <span>{link.label}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === index
                        ? "rotate-180 text-green-600"
                        : "text-gray-500"
                    }`}
                  />
                </button>

                {/* Dropdown content */}
                {activeDropdown === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 rounded-md mt-1 mb-1 overflow-hidden"
                  >
                    {link.children.map((childLink, childIndex) => (
                      <Link
                        key={childIndex}
                        to={childLink.href}
                        className={`flex items-center pl-8 pr-4 py-2.5 text-sm ${
                          isActive(childLink.href)
                            ? "text-green-600 bg-green-50"
                            : "text-gray-700 hover:bg-gray-100"
                        } transition-colors`}
                        onClick={() => {
                          setActiveDropdown(null);
                          onClick();
                        }}
                      >
                        {childLink.icon && (
                          <childLink.icon
                            className={`h-4 w-4 mr-2 ${
                              isActive(childLink.href)
                                ? "text-green-500"
                                : "text-gray-500"
                            }`}
                          />
                        )}
                        {childLink.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              // Regular link for mobile
              <Link
                to={link.href}
                className={`flex items-center p-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={onClick}
              >
                {link.icon && (
                  <link.icon
                    className={`h-4 w-4 mr-2 ${
                      isActive(link.href) ? "text-green-500" : "text-gray-500"
                    }`}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Navigation Links
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
                      className={`flex items-center px-4 py-2 text-sm ${
                        isActive(childLink.href)
                          ? "text-green-600 bg-green-50"
                          : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                      } transition-colors`}
                    >
                      {childLink.icon && (
                        <childLink.icon
                          className={`h-4 w-4 mr-2 ${
                            isActive(childLink.href)
                              ? "text-green-500"
                              : "text-gray-500"
                          }`}
                        />
                      )}
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
              className={`group flex items-center text-sm font-medium transition-colors relative ${
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

              {/* Active indicator line */}
              {isActive(link.href) && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500 transform translate-y-2 origin-left"
                />
              )}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
