import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Car,
  Menu,
  X,
  UserCircle,
  Search,
  Plus,
  LogOut,
  Bell,
  AlertCircle,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Button from "../button.jsx";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../Slices/authSlice"; // import your logout action
import ProfileModal from "../auth/ProfileModal.jsx"; // Import the new ProfileModal component
import { fetchDriverById } from "../Slices/driverKYCSlice.js"; // Import KYC action
import UserKycModal from "../driver/UserKYCModal";
import DriverKycModal from "../driver/DriverKYCModal.jsx";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [isBlinking, setIsBlinking] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);
  const [showUserKycModal, setShowUserKycModal] = useState(false);
  const [showDriverKycModal, setShowDriverKycModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From Redux: e.g. state.auth.user = { _id, role, userName, ... }
  const { user } = useSelector((state) => state.auth) || {};
  const { currentDriver } = useSelector((state) => state.driver) || {};

  // If we have user._id, user is considered logged in
  const isAuthenticated = !!user?._id;
  const userRole = user?.role;
  const userName = user?.userName || "User";

  // Check KYC status when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // For drivers, fetch their KYC status
      if (userRole === "driver") {
        dispatch(fetchDriverById(user._id))
          .unwrap()
          .then((response) => {
            if (response && response.data) {
              setKycStatus(response.data.status || "pending");
            } else {
              setKycStatus("incomplete");
            }
          })
          .catch((error) => {
            console.error("Error fetching driver KYC status:", error);
            setKycStatus("incomplete");
          });
      } else {
        // For regular users, check if they have completed KYC
        // This would depend on your backend implementation
        // For now, we'll assume it's incomplete if not a driver
        setKycStatus("incomplete");
      }
    }
  }, [isAuthenticated, user, userRole, dispatch]);

  // Blinking effect for notification
  useEffect(() => {
    if (kycStatus === "incomplete" || kycStatus === "pending") {
      const blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev);
      }, 800);

      return () => clearInterval(blinkInterval);
    }
  }, [kycStatus]);

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

      if (
        showNotificationDropdown &&
        !event.target.closest(".notification-container")
      ) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, showNotificationDropdown]);

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

  // Get notification message based on user role and KYC status
  const getNotificationMessage = () => {
    if (!isAuthenticated || kycStatus === "verified") {
      return null;
    }

    if (userRole === "driver") {
      if (kycStatus === "incomplete") {
        return "Complete your KYC to start earning with us!";
      } else if (kycStatus === "pending") {
        return "Your driver verification is pending approval.";
      } else if (kycStatus === "rejected") {
        return "Your driver verification was rejected. Please update your information.";
      }
    } else {
      // Regular user
      return "Please complete your personal information for KYC verification.";
    }

    return null;
  };

  // Handle opening the appropriate KYC modal based on user role
  const handleOpenKycModal = () => {
    setShowNotificationDropdown(false);

    if (userRole === "driver") {
      setShowDriverKycModal(true);
    } else {
      setShowUserKycModal(true);
    }
  };

  const notificationMessage = getNotificationMessage();

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

          {/* Right: Search, Publish/View Ride, Notifications, and User Menu */}
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

            {/* Notification Bell - Only show if authenticated and KYC is not verified */}
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
                        onClick={handleOpenKycModal}
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
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <button className="text-sm font-medium text-gray-900 hover:text-green-600 cursor-pointer mt-1">
                        {userName}
                      </button>
                    </div>
                    <button
                      onClick={() => navigate("/userDashboard")}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2"> User Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleOpenKycModal();
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <span className="ml-2">KYC Verification</span>
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
