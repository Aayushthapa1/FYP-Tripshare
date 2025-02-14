// src/admin/components/AdminNavbar.jsx

import React from 'react';
import { Menu, Bell } from 'lucide-react';

function AdminNavbar({ onToggleSidebar }) {
  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left side: Mobile menu button + brand */}
      <div className="flex items-center">
        {/* Hamburger icon for mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 focus:outline-none"
          onClick={onToggleSidebar}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 ml-2 md:ml-4">
          TripShare Admin
        </h1>
      </div>

      {/* Right side: Notification, profile avatar, etc. */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="sr-only">Notifications</span>
          {/* You could show a badge for unread notifications here */}
        </button>

        {/* Profile avatar (placeholder) */}
        <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
          {/* Replace with real avatar if desired */}
          <img
            src="https://via.placeholder.com/32"
            alt="Admin Avatar"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
