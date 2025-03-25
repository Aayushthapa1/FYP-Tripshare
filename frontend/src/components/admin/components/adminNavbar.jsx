import React, { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile } from "../../Slices/userSlice";
import { Link } from "react-router-dom";

// ThemeSwitcher Component
const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "synthwave" : "light";
    setTheme(newTheme);
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", newTheme);
    }, 100); // Small delay to ensure UI update
  };
  

  return (
    <label className="flex cursor-pointer gap-2">
      {/* Sun Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>

      {/* Toggle Button */}
      <input
        type="checkbox"
        className="toggle theme-controller"
        checked={theme === "synthwave"}
        onChange={toggleTheme}
      />

      {/* Moon Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
  );
};

function AdminNavbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const adminId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    if (adminId) {
      dispatch(getUserProfile(adminId));
    }
  }, [adminId, dispatch]);

  const adminProfile = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left side: Mobile menu button + brand */}
      <div className="flex items-center">
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

      {/* Right side: Theme toggle, Notification, and Profile avatar */}
      <div className="flex items-center space-x-4">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="sr-only">Notifications</span>
        </button>

        {/* Profile avatar */}
        <Link to="/admin/profile">
          <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
            {adminProfile?.profilePicture ? (
              <img
                src={adminProfile.profilePicture}
                alt="Admin Avatar"
                className="object-cover h-full w-full"
              />
            ) : (
              <span className="flex items-center justify-center h-full w-full text-white bg-gray-500">
                {adminProfile?.fullName
                  ? adminProfile.fullName.charAt(0).toUpperCase()
                  : "A"}
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;
