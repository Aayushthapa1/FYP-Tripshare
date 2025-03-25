import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  AlertCircle,
  UserCircle,
  LogOut,
  Menu,
  X,
  Car,
  Plus,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

// Thunk to get the user's KYC status from Redux
import { getUserKYCStatus } from "../Slices/userKYCSlice";

// Action to log out the user
import { logoutUser } from "../Slices/authSlice";

// Components
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import ProfileModal from "../auth/ProfileModal.jsx";
import UserKycModal from "../driver/UserKYCModal";
import DriverKycModal from "../driver/DriverKYCModal.jsx";
import Button from "../button.jsx";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ----- Redux: auth state -----
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const userRole = user?.role || "user";
  const userName = user?.userName || "User";

  // ----- Redux: userKYC state -----
  const { kycStatus } = useSelector((state) => state.userKYC) || {};

  // ----- Local UI states -----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // **Use a single state for the profile modal**
  const [showProfileModal, setShowProfileModal] = useState(false);

  // KYC modals
  const [showUserKycModal, setShowUserKycModal] = useState(false);
  const [showDriverKycModal, setShowDriverKycModal] = useState(false);

  // ----- On mount: check if user is scrolled -----
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ----- Dispatch getUserKYCStatus once we know user is authenticated -----
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(getUserKYCStatus(user._id));
    }
  }, [isAuthenticated, user, dispatch]);

  // ----- Possibly animate blinking if KYC is pending or not_submitted -----
  useEffect(() => {
    if (kycStatus === "pending" || kycStatus === "not_submitted") {
      setIsBlinking(true);
      const blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 800);

      return () => clearInterval(blinkInterval);
    } else {
      setIsBlinking(false);
    }
  }, [kycStatus]);

  // ----- Helper: navigate to a path -----
  const handleNavigate = (path) => {
    navigate(path);
  };

  // ----- Confirm Logout Toast -----
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

  // ----- Actual Logout Handler -----
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

  // ----- Handle opening KYC modals based on role -----
  const handleOpenKycModal = () => {
    if (userRole === "driver") {
      setShowDriverKycModal(true);
    } else {
      setShowUserKycModal(true);
    }
  };

  // ----- Generate a notification message based on status -----
  const notificationMessage = (() => {
    if (!isAuthenticated || kycStatus === "verified") {
      return null;
    }

    if (userRole === "driver") {
      if (kycStatus === "not_submitted")
        return "Complete your Driver KYC to start earning!";
      if (kycStatus === "pending")
        return "Your driver verification is pending approval.";
      if (kycStatus === "rejected")
        return "Your driver verification was rejected. Please update your info.";
    } else {
      // user role = "user"
      if (kycStatus === "not_submitted")
        return "Please complete your personal information for KYC verification.";
      if (kycStatus === "pending") return "Your KYC is pending approval.";
      if (kycStatus === "rejected")
        return "Your KYC was rejected. Please update your info.";
    }

    return null;
  })();

  // ----- Render -----
  return (
    <nav
      className={`fixed w-full z-50 bg-white border-b border-gray-200 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <Toaster richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 max-w-full">
          {/* Left: Logo */}
          <div
            className="flex items-center cursor-pointer pl-2"
            onClick={() => handleNavigate("/")}
          >
            <Car className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              TripShare
            </span>
          </div>

          {/* Middle: Nav Links */}
          <div className="flex-1 flex items-center justify-center">
            <NavLinks />
          </div>

          {/* Right: Search, Rides, Notifications, User Menu */}
          <div className="flex items-center space-x-4 pr-2">
            {/* Search Bar */}
            <SearchBar />

            {/* Rides Button: Driver => Publish, else => View Rides */}
            {isAuthenticated &&
              (userRole === "driver" ? (
                <button
                  onClick={() => handleNavigate("/tripForm")}
                  className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Publish a Ride</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate("/trips")}
                  className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm"
                >
                  View Rides
                </button>
              ))}

            {/* Notification Bell: if kycStatus != verified */}
            {isAuthenticated && notificationMessage && (
              <div className="relative notification-container">
                <button
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                  className={`flex items-center p-2 rounded-full ${
                    isBlinking
                      ? "animate-pulse bg-amber-100"
                      : "hover:bg-gray-100"
                  } transition-colors`}
                  aria-expanded={showNotificationDropdown}
                  aria-haspopup="true"
                >
                  <Bell
                    className={`h-6 w-6 ${
                      isBlinking ? "text-amber-500" : "text-gray-700"
                    }`}
                  />
                  <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform origin-top-right transition-all duration-200 ease-out z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        <p className="text-sm font-semibold text-gray-900">
                          Action Required
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-700 mb-4">
                        {notificationMessage}
                      </p>
                      <button
                        onClick={() => {
                          setShowNotificationDropdown(false);
                          handleOpenKycModal();
                        }}
                        className="w-full px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                      >
                        {userRole === "driver"
                          ? "Complete Driver KYC"
                          : "Complete KYC"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                    {/* Header: Signed in as */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <button className="text-sm font-medium text-gray-900 hover:text-green-600 cursor-pointer mt-1">
                        {userName}
                      </button>
                    </div>

                    {/* 1) Profile Button */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowProfileModal(true); // <--- use showProfileModal
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2">Profile</span>
                    </button>

                    {/* 2) User Dashboard Button */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate("/userDashboard");
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2">User Dashboard</span>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Conditionally show KYC Verification vs. Verified */}
                    {kycStatus !== "verified" ? (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleOpenKycModal();
                        }}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                      >
                        <span className="ml-2">KYC Verification</span>
                      </button>
                    ) : (
                      <div className="flex items-center w-full px-4 py-2 text-sm text-green-600">
                        <svg
                          className="h-4 w-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Verified
                      </div>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout Button */}
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
        user={user}
        role={userRole}
        isAuthenticated={isAuthenticated}
        onNavigate={handleNavigate}
        onLogout={confirmLogout}
        closeMenu={() => setIsMenuOpen(false)}
        onOpenProfile={() => {
          setIsMenuOpen(false);
          setShowProfileModal(true);
        }}
        notificationMessage={notificationMessage}
        onOpenKyc={() => {
          setIsMenuOpen(false);
          handleOpenKycModal();
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

      {/* User KYC Modal */}
      {isAuthenticated && (
        <UserKycModal
          isOpen={showUserKycModal}
          onClose={() => setShowUserKycModal(false)}
          userId={user?._id}
        />
      )}

      {/* Driver KYC Modal */}
      {isAuthenticated && (
        <DriverKycModal
          isOpen={showDriverKycModal}
          onClose={() => setShowDriverKycModal(false)}
          userId={user?._id}
        />
      )}
    </nav>
  );
}
