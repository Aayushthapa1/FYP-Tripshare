// src/admin/components/AdminSidebar.jsx

import React from "react";
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  AlertCircle,
  Settings as SettingsIcon,
  User,
  LogOut as LogOutIcon,
  ClipboardList,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen w-64 fixed top-0 left-0 z-20 transform 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>

      {/* Main nav links */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
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

        {/* KYC Verification */}
        <NavLink
          to="/admin/kyc"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded 
             ${
               isActive
                 ? "bg-gray-200 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`
          }
        >
          <ClipboardList className="w-5 h-5" />
          <span>KYC Verification</span>
        </NavLink>

        {/* Driver List */}
        <NavLink
          to="/admin/drivers"
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
          <span>Drivers</span>
        </NavLink>

        {/* Users */}
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

        {/* Rides */}
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

        {/* Payments */}
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

        {/* Disputes */}
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

        {/* Settings */}
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
        {/* Profile link */}
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

        {/* Logout button */}
        <button
          onClick={handleLogout}
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
  );
}

export default AdminSidebar;
