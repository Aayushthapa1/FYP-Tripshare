"use client";

import { useEffect, useState, useRef } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import {
  fetchNotifications,
  markAllAsRead,
  getUnreadCount,
} from "../../Slices/notificationSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import AdminNotificationDropdown from "../pages/AdminNotificationDropdown.jsx";
import useAdminNotifications from "../pages/useAdminNotifications.js";

// ThemeSwitcher Component
const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Also set dark mode class on html element for tailwind dark mode
    if (theme === "synthwave" || theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "synthwave" : "light";
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};

function AdminNavbar({
  onToggleSidebar,
  pageTitle = "Dashboard",
  sidebarCollapsed,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminId = useSelector((state) => state.auth.user?._id);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Initialize socket connection for real-time notifications
  useAdminNotifications();

  useEffect(() => {
    if (adminId) {
      dispatch(getUserProfile(adminId));
      // Fetch initial notifications
      dispatch(fetchNotifications());
      // Get unread count
      dispatch(getUnreadCount());
    }
  }, [adminId, dispatch]);

  const adminProfile = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  // Show the custom toast confirming logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-5">
            Are you sure you want to logout?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  // Actual logout handler
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Dispatch Redux logout action
    dispatch(logoutUser());

    // Show success toast
    toast.success("Successfully logged out");

    // Redirect user to home page
    navigate("/");
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getInitials = () => {
    if (adminProfile?.fullName) {
      const nameParts = adminProfile.fullName.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(
          0
        )}`.toUpperCase();
      }
      return adminProfile.fullName.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <>
      <Toaster position="top-center" />
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <button
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Search - Desktop */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5 transition-colors"
                  type="search"
                  placeholder="Search..."
                />
              </div>

              {/* Search - Mobile */}
              <div className="md:hidden" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <Search className="h-5 w-5" />
                </button>

                {searchOpen && (
                  <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg border-b border-gray-200 dark:border-gray-700 z-30">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5"
                        type="search"
                        placeholder="Search..."
                        autoFocus
                      />
                      <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setSearchOpen(false)}
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Real-time Notifications Dropdown */}
              <AdminNotificationDropdown />

              {/* Profile menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                  }}
                  aria-label="User menu"
                >
                  <div className="h-9 w-9 rounded-full bg-green-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-white">
                    {adminProfile?.profilePicture ? (
                      <img
                        src={adminProfile.profilePicture || "/placeholder.svg"}
                        alt="Admin Avatar"
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <span className="font-medium text-sm">
                        {getInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:flex md:items-center ml-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
                      {adminProfile?.fullName || "Admin"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </span>
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-30">
                    <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {adminProfile?.fullName || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {adminProfile?.email || "admin@example.com"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={confirmLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-red-500 dark:text-red-400" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default AdminNavbar;
