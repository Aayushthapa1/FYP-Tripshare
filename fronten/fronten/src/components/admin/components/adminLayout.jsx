import React, { useState } from 'react';
// import AdminNavbar from './adminNavbar';
import AdminSidebar from './adminSidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      {/* <AdminNavbar onToggleSidebar={handleToggleSidebar} /> */}

      {/* Sidebar (toggle on mobile) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main content area (to the right of sidebar) */}
      {/* Outlet -> child routes (Dashboard, Settings, etc.) appear here */}
      <div className="md:ml-64 p-4 mt-4 md:mt-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
