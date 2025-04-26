import React, { useState } from "react";
import {
  User,
  Home,
  Map,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Calendar,
  Car,
  MapPin,
  Heart,
  ChevronRight,
  X,
  Menu,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
  navigateTo,
  isMobileView,
  userData,
  user,
  setIsProfileModalOpen,
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = userData?.fullName || user?.name || "User";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Toggle sidebar collapse state (for desktop)
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && isMobileView && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-30 transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "md:w-20" : "md:w-72"}
          md:translate-x-0 transition-all duration-300 ease-in-out
          flex flex-col shadow-lg`}
      >
        {/* Header with user info */}
        <div className="p-5 border-b border-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {getUserInitials()}
                </span>
              </div>
              <div className={`ml-3 ${collapsed ? "md:hidden" : ""}`}>
                <h2 className="font-semibold text-gray-800 truncate max-w-[140px]">
                  {userData?.fullName || user?.name || "User"}
                </h2>
                <p className="text-xs text-gray-500 truncate max-w-[140px]">
                  {userData?.email || user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {!collapsed && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              View Profile
            </button>
          )}
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Main
            </p>
          )}

          <button
            onClick={() => navigateTo("dashboard")}
            className={`flex items-center ${
              collapsed ? "justify-center" : ""
            } space-x-3 p-3 rounded-lg transition-all duration-200
             ${
               activeSection === "dashboard"
                 ? "bg-green-50 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Dashboard</span>
            {activeSection === "dashboard" && !collapsed && (
              <ChevronRight className="w-4 h-4 ml-auto text-green-600" />
            )}
          </button>
            <button
            onClick={() => navigateTo("payments")}
            className={`flex items-center ${
              collapsed ? "justify-center" : ""
            } space-x-3 p-3 rounded-lg transition-all duration-200
             ${
               activeSection === "payments"
                 ? "bg-green-50 text-green-700 font-medium"
                 : "text-gray-700 hover:bg-gray-100"
             }`}
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>
              Payment History
            </span>
            {activeSection === "payments" && !collapsed && (
              <ChevronRight className="w-4 h-4 ml-auto text-green-600" />
            )}
          </button>

        

          {!collapsed && (
            <div className="mt-6 mx-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
                <h3 className="font-medium text-base mb-2">Need Help?</h3>
                <p className="text-xs opacity-90 mb-3">
                  Contact our support team for assistance with your account or
                  rides.
                </p>
                <button
                  className="bg-white text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-50 transition-colors shadow-sm w-full"
                  onClick={() => navigateTo("support")}
                >
                  <MessageSquare className="w-3 h-3 inline-block mr-1" />
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={() => navigate("/logout")}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } space-x-3 p-3 rounded-lg 
                     text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`${collapsed ? "md:hidden" : ""}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Toggle button for mobile (outside sidebar) */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default Sidebar;
