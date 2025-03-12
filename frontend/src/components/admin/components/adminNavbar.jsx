// src/admin/components/AdminNavbar.jsx
import React, { useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile ,updateUserProfileAction, } from "../../Slices/userSlice";
import { Link } from "react-router-dom";

function AdminNavbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  // Assume the admin's id is stored in your auth slice
  const adminId = useSelector((state) => state.auth.user?._id);

  // Fetch the admin profile data on mount or when adminId changes
  useEffect(() => {
    if (adminId) {
      dispatch(getUserProfile(adminId));
    }
  }, [adminId, dispatch]);

  // Get the admin profile data from the user slice
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

      {/* Right side: Notification and profile avatar */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="sr-only">Notifications</span>
        </button>

        {/* Profile avatar wrapped in a link to the profile page */}
        <Link to="/admin/profile">
          <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
            {adminProfile && adminProfile.profilePicture ? (
              <img
                src={adminProfile.profilePicture}
                alt="Admin Avatar"
                className="object-cover h-full w-full"
              />
            ) : (
              <span className="flex items-center justify-center h-full w-full text-white bg-gray-500">
                {adminProfile && adminProfile.fullName
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
