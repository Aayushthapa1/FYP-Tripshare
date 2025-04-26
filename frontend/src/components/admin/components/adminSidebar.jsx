import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "sonner";
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  SettingsIcon,
  User,
  LogOutIcon,
  FileCheck,
  ChevronRight,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { logoutUser } from "../../Slices/authSlice";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Show the custom toast confirming logout
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-xl p-5 max-w-md w-full border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-5">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
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

  // Toggle sidebar collapse state (for desktop)
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <Toaster position="top-right" />

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed top-0 left-0 z-20 transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "md:w-20" : "md:w-72"}
          md:translate-x-0 transition-all duration-300 ease-in-out
          flex flex-col shadow-lg`}
      >
        {/* Header with logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h2
              className={`text-xl font-bold ml-3 text-gray-800 dark:text-white ${
                collapsed ? "md:hidden" : ""
              }`}
            >
              Admin Panel
            </h2>
          </div>
          <button
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Main nav links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/Kyc"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <FileCheck className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>
              KYC Verification
            </span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Users</span>
          </NavLink>

          <NavLink
            to="/admin/rides"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <Car className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Rides</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <DollarSign className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Payments</span>
          </NavLink>

          <NavLink
            to="/admin/notifications"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                }`
            }
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>
              Notifications
            </span>
          </NavLink>
        </nav>

        {/* Profile + Logout (bottom) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-2">
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "md:justify-center" : ""
              } space-x-3 p-3 rounded-lg transition-all duration-200
               ${
                 isActive
                   ? "bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400"
                   : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
               }`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Profile</span>
          </NavLink>

          {/* Logout button with confirmation */}
          <button
            onClick={confirmLogout}
            className={`w-full flex items-center ${
              collapsed ? "md:justify-center" : ""
            } space-x-3 p-3 rounded-lg 
                       text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200`}
          >
            <LogOutIcon className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Toggle button for mobile (outside sidebar) */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-30 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={isOpen ? onClose : () => onClose(false)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
}

export default AdminSidebar;
