// src/admin/pages/AdminDashboard.jsx

import React, { useState } from "react";
import AdminNavbar from "../components/adminNavbar";
import AdminSidebar from "../components/adminSidebar";
import { Users, Car, DollarSign, AlertTriangle } from "lucide-react";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar (toggle sidebar on mobile) */}
      <AdminNavbar onToggleSidebar={handleToggleSidebar} />

      {/* Sidebar (slides in/out on mobile) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content */}
      <div className="md:ml-64 p-4 mt-4 md:mt-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
        <p className="text-gray-500 mb-8">Welcome back, Admin</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800">Total Users</h3>
            </div>
            <div className="text-2xl font-bold">24,580</div>
            {/* <div className="text-green-600 text-sm">↑12% this week</div> */}
          </div>

          {/* Active Rides */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800">Active Rides</h3>
            </div>
            <div className="text-2xl font-bold">1,247</div>
            {/* <div className="text-green-600 text-sm">↑8% this week</div> */}
          </div>

          {/* Revenue */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800">Revenue</h3>
            </div>
            <div className="text-2xl font-bold">$85,245</div>
            {/* <div className="text-green-600 text-sm">↑15% this week</div> */}
          </div>

          {/* Disputes */}
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-800">Disputes</h3>
            </div>
            <div className="text-2xl font-bold">23</div>
            {/* <div className="text-red-500 text-sm">↓5% this week</div> */}
          </div>
        </div>

        {/* Charts / Overview area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Revenue Overview
            </h3>
            {/* Replace with chart library */}
            <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">User Activity</h3>
            <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
              Chart Placeholder
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>

          {/* Wrap table in a scroll container for mobile */}
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left text-gray-700 text-sm sm:text-base">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 whitespace-nowrap">User</th>
                  <th className="py-2 px-3 whitespace-nowrap">Action</th>
                  <th className="py-2 px-3 whitespace-nowrap">Date</th>
                  <th className="py-2 px-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 flex items-center space-x-2">
                    <img
                      src="https://via.placeholder.com/24"
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                    <span>John Doe</span>
                  </td>
                  <td className="py-2 px-3">Completed ride</td>
                  <td className="py-2 px-3">2 mins ago</td>
                  <td className="py-2 px-3 text-green-600 font-sm">
                    Completed
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 flex items-center space-x-2">
                    <img
                      src="https://via.placeholder.com/24"
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                    <span>Jane Smith</span>
                  </td>
                  <td className="py-2 px-3">Started ride</td>
                  <td className="py-2 px-3">5 mins ago</td>
                  <td className="py-2 px-3 text-blue-600 font-sm">
                    In Progress
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 flex items-center space-x-2">
                    <img
                      src="https://via.placeholder.com/24"
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                    <span>Mike Johnson</span>
                  </td>
                  <td className="py-2 px-3">Cancelled ride</td>
                  <td className="py-2 px-3">10 mins ago</td>
                  <td className="py-2 px-3 text-red-500 font-sm">
                    Cancelled
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
