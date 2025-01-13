import React, { useState } from 'react';
import AdminNavbar from './adminNavbar';
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
      {/* Admin Navbar */}
      <AdminNavbar onToggleSidebar={handleToggleSidebar} />

      {/* Admin Sidebar (toggle on mobile) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main content area */}
      <div className="md:ml-64 p-4 mt-4 md:mt-6">
        {/* Child routes like AdminDashboard, AdminSettings will render here */}
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
