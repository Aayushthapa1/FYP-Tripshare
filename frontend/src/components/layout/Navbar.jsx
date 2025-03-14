

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Car, Menu, X, UserCircle, Search, Plus, LogOut } from "lucide-react";
import { toast, Toaster } from "sonner";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Button from "../button.jsx";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../Slices/authSlice"; // import your logout action
import ProfileModal from "../auth/ProfileModal.jsx"; // Import the new ProfileModal component

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From Redux: e.g. state.auth.user = { _id, role, userName, ... }
  const { user } = useSelector((state) => state.auth) || {};

  // If we have user._id, user is considered logged in
  const isAuthenticated = !!user?._id;
  const userRole = user?.role;
  const userName = user?.userName || "User";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Dispatch Redux logout action
    dispatch(logoutUser());

    // Show success toast
    toast.success("Successfully logged out");

    setIsUserMenuOpen(false);
    navigate("/"); // redirect to home
  };

  // Handle opening the profile modal
  const handleOpenProfile = () => {
    setIsUserMenuOpen(false); // Close the dropdown
    setShowProfileModal(true); // Open the profile modal
  };

  return (
    <nav
      className={`fixed w-full z-50 bg-white border-b border-gray-200 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <Toaster richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            <Car className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              TripShare
            </span>
          </div>

          {/* Middle: Nav Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right: Search, Publish/View Ride, and User Menu */}
          <div className="flex items-center space-x-6">
            {/* Search Button (Desktop only) */}
            <button className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Search className="h-5 w-5" />
              <span className="font-medium">Search</span>
            </button>

            {/* If user is driver, show "Publish a Ride". Otherwise "View Rides" */}
            {isAuthenticated ? (
              userRole === "driver" ? (
                <button
                  onClick={() => handleNavigate("/tripForm")}
                  className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish a Ride</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate("/trips")}
                  className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>View Rides</span>
                </button>
              )
            ) : null}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <UserCircle className="h-6 w-6 text-gray-700" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform origin-top-right transition-all duration-200 ease-out">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <button className="text-sm font-medium text-gray-900 hover:text-green-600 cursor-pointer mt-1">
                        {userName}
                      </button>
                    </div>
                    <button
                      onClick={handleOpenProfile}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2">Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleNavigate("/Kycform");
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2">KYC</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        confirmLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // If NOT authenticated, show Login/Register
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  WholeClassName="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  onClick={() => handleNavigate("/login")}
                >
                  Login
                </Button>
                <Button
                  WholeClassName="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg transition-colors shadow-sm"
                  className="text-white font-medium"
                  hovered="text-white"
                  notHovered="text-white"
                  onClick={() => handleNavigate("/register")}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        user={user} // pass user object
        role={userRole}
        isAuthenticated={isAuthenticated}
        onNavigate={handleNavigate}
        onLogout={confirmLogout}
        closeMenu={() => setIsMenuOpen(false)}
        onOpenProfile={() => {
          setIsMenuOpen(false);
          setShowProfileModal(true);
        }}
      />

      {/* Profile Modal */}
      {isAuthenticated && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user?._id}
        />
      )}
    </nav>
  );
}
