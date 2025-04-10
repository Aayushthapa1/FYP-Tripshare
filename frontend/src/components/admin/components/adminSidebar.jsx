import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "sonner";
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  AlertCircle,
  Settings as SettingsIcon,
  User,
  LogOut as LogOutIcon,
} from "lucide-react";
import { logoutUser } from "../../Slices/authSlice";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  return (
    <>
    <Toaster position="top-right"/>
    <aside
      className={`bg-white border-r border-gray-200 h-screen w-64 fixed top-0 left-0 z-20 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-200 ease-in-out
        flex flex-col`}
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>

      {/* Main nav links */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/Kyc"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <Users className="w-5 h-5" />
          <span>KYC Verification</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/rides"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <Car className="w-5 h-5" />
          <span>Rides</span>
        </NavLink>

        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <DollarSign className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>

        <NavLink
          to="/admin/disputes"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <AlertCircle className="w-5 h-5" />
          <span>Disputes</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Profile + Logout (bottom) */}
      <div className="p-4 border-t mt-auto">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded mb-3
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>

        {/* Logout button with confirmation */}
        <button
          onClick={confirmLogout}
          className="w-full flex items-center space-x-2 p-2 rounded 
                     text-gray-700 hover:bg-gray-100"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Close sidebar button (mobile) */}
      <button
        className="md:hidden p-2 m-4 bg-gray-200 rounded hover:bg-gray-300"
        onClick={onClose}
      >
        Close
      </button>
    </aside>
    </>
  );
}

export default AdminSidebar;
