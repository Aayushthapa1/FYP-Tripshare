// src/components/layout/AuthButtons.jsx
import React, { useState } from 'react';
// import ProfileModal from '../user/pages/ProfileModal';

export default function AuthButtons({ isScrolled }) {
  // In a real app, you'd get login state & user data from context/props
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogin = () => {
    // Example: do real login, set user context, etc.
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const openProfile = () => {
    setShowProfileModal(true);
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="flex items-center space-x-4">
          <button
            onClick={openProfile}
            className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-green-500 transition-colors`}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-green-500 transition-colors`}
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogin}
            className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
          >
            Sign Up
          </button>
          <button
            onClick={handleLogin}
            className={`${
              isScrolled ? 'text-gray-700' : 'text-white'
            } hover:text-green-500 transition-colors`}
          >
            Login
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {/* <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      /> */}
    </>
  );
}
