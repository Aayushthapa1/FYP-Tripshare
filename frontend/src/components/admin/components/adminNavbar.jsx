import React, { useEffect, useState } from "react";
import { Menu, Bell, Search, ChevronDown, User, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

// ThemeSwitcher Component
const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "synthwave" : "light";
    setTheme(newTheme);
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", newTheme);
    }, 100); // Small delay to ensure UI update
  };

  return (
    <label className="flex cursor-pointer gap-2">
      {/* Sun Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>

      {/* Toggle Button */}
      <input
        type="checkbox"
        className="toggle theme-controller"
        checked={theme === "synthwave"}
        onChange={toggleTheme}
      />

      {/* Moon Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
  );
};

function AdminNavbar({ onToggleSidebar, pageTitle = "Dashboard" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminId = useSelector((state) => state.auth.user?._id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (adminId) {
      dispatch(getUserProfile(adminId));
    }
  }, [adminId, dispatch]);

  const adminProfile = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  const notifications = [
    {
      id: 1,
      text: "New user registration",
      time: "2 minutes ago",
      read: false,
    },
    { id: 2, text: "New payment received", time: "1 hour ago", read: false },
    { id: 3, text: "Dispute raised by user", time: "3 hours ago", read: true },
  ];

  // Show the custom toast confirming logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
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
    const closeMenus = () => {
      setNotificationsOpen(false);
      setProfileMenuOpen(false);
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                onClick={onToggleSidebar}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-800">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Mobile title (centered) */}
            <div className="flex md:hidden items-center">
              <h1 className="text-lg font-semibold text-gray-800">TripShare</h1>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden sm:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  type="search"
                  placeholder="Search..."
                />
              </div>

              {/* Theme Switcher */}
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>

              {/* Notifications */}
              <div
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
              >
                <button className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-2 px-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm text-gray-800">
                            {notification.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="py-2 px-4 border-t border-gray-100 text-center">
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile menu */}
              <div
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
              >
                <button className="flex items-center text-sm rounded-full focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    {adminProfile?.profilePicture ? (
                      <img
                        src={adminProfile.profilePicture}
                        alt="Admin Avatar"
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full w-full text-white bg-gray-500">
                        {adminProfile?.fullName
                          ? adminProfile.fullName.charAt(0).toUpperCase()
                          : "A"}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:flex md:items-center ml-2">
                    <span className="text-sm font-medium text-gray-700 mr-1">
                      {adminProfile?.fullName || "Admin"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </span>
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Profile
                        </div>
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={confirmLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2 text-red-500" />
                          Log Out
                        </div>
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
