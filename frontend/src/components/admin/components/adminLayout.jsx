import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const location = useLocation();

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname.split("/").pop() || "dashboard";
    const formattedTitle =
      path === "admin"
        ? "Dashboard"
        : path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
    setPageTitle(formattedTitle);
    document.title = `TripShare Admin | ${formattedTitle}`;
  }, [location]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (sidebarOpen && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-200">
        {/* Admin Navbar */}
        <AdminNavbar
          onToggleSidebar={handleToggleSidebar}
          pageTitle={pageTitle}
        />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          onClick={handleContentClick}
        >
          {/* Overlay for mobile when sidebar is open */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={handleCloseSidebar}
            />
          )}

          {/* Content wrapper with max-width for better readability on large screens */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

       
      </div>
    </div>
  );
}

export default AdminLayout;
