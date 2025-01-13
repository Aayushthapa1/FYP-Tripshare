
import React from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  AlertCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

function AdminSidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen w-64 fixed top-0 left-0 z-20 transform 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 transition-transform duration-200 ease-in-out
      flex flex-col`}
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/admin"
          end
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/rides"
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <Car className="w-5 h-5" />
          <span>Rides</span>
        </NavLink>

        <NavLink
          to="/admin/payments"
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <DollarSign className="w-5 h-5" />
          <span>Payments</span>
        </NavLink>

        <NavLink
          to="/admin/disputes"
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Disputes</span>
        </NavLink>

        {/* New Settings link */}
        <NavLink
          to="//adminSettings"
          className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100 rounded"
        >
          <SettingsIcon className="w-5 h-5" />
          <span>Settings</span>
        </NavLink>
      </nav>

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
