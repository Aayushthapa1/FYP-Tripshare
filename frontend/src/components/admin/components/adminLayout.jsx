"use client";

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./adminNavbar";
import AdminSidebar from "./adminSidebar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleToggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Close sidebar when clicking outside on mobile
  const handleContentClick = () => {
    if (sidebarOpen && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Check if the screen is small on initial load and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}
      >
        {/* Admin Navbar */}
        <AdminNavbar
          onToggleSidebar={handleToggleSidebar}
          pageTitle={pageTitle}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900"
          onClick={handleContentClick}
        >
          {/* Content wrapper with max-width for better readability on large screens */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} TripShare Admin. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
