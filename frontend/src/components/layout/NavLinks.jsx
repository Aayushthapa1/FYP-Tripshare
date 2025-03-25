"use client";

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact Us" },
];

export default function NavLinks() {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

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
              className={`relative py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.href)
                  ? "text-green-600 border-b-2 border-green-500"
                  : "text-gray-800 hover:text-green-600"
              }`}
            >
              {link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
