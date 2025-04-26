"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  CheckCircle,
  User,
  Clock,
  MapPin,
  CreditCard,
  Settings,
  Home,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

import { getUserKYCStatus } from "../Slices/userKYCSlice";
import { logoutUser } from "../Slices/authSlice";
import socketService from "../socket/socketService.js";

// Components
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import ProfileModal from "../auth/ProfilePage.jsx";
import UserKycModal from "../driver/UserKYCModal";
import DriverKycModal from "../driver/DriverKYCModal.jsx";
import Button from "../button.jsx";
import NotificationCenter from "../socket/notificationDropdown.jsx";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ----- Redux: auth state -----
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const userRole = user?.role || "user";
  const userName = user?.fullName || user?.userName || "User";

  // ----- Redux: userKYC state -----
  const { kycStatus } = useSelector((state) => state.userKYC) || {};

  // ----- Redux: notification state -----
  const { notifications = [] } = useSelector((state) => state.notification) || {
    notifications: [],
  };

  // ----- Local UI states -----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // KYC modals - ensure they're properly managed
  const [showUserKycModal, setShowUserKycModal] = useState(false);
  const [showDriverKycModal, setShowDriverKycModal] = useState(false);

  // Calculate the total unique notifications with proper validation
  const totalUniqueNotifications = useMemo(() => {
    const backendNotificationIds = new Set(
      notifications.map((n) => n._id).filter(Boolean)
    );
    const localNotificationIds = new Set(
      localNotifications.map((n) => n.id).filter(Boolean)
    );
    return backendNotificationIds.size + localNotificationIds.size;
  }, [notifications, localNotifications]);

  // ----- Socket event listeners -----
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle trip creation events
    const handleTripCreated = (newTrip) => {
      if (!newTrip) return;

      const tripFrom = newTrip.departureLocation || "Unknown location";
      const tripTo = newTrip.destinationLocation || "Unknown destination";

      // Add to notifications array with validation
      setLocalNotifications((prev) => [
        {
          id: `trip-${Date.now()}`,
          type: "trip",
          message: `New trip from ${tripFrom} to ${tripTo}!`,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      toast.success(`New trip from ${tripFrom} to ${tripTo}!`);
    };

    // Handle ride request events
    const handleRideRequest = (rideData) => {
      if (!rideData || userRole !== "driver") return;

      // Validate locations with fallbacks
      const pickupLocation = rideData.pickupLocationName || "Unknown location";
      const dropoffLocation =
        rideData.dropoffLocationName || "Unknown destination";
      const fare = rideData.fare || "N/A";

      console.log("Driver received ride request:", rideData);

      setLocalNotifications((prev) => [
        {
          id: `ride-request-${rideData.rideId || Date.now()}`,
          type: "ride_request",
          message: `New ride request from ${pickupLocation} to ${dropoffLocation} (${fare} NPR)`,
          timestamp: new Date(),
          rideData: rideData,
        },
        ...prev,
      ]);

      toast.success(
        `New ride request from ${pickupLocation} to ${dropoffLocation}!`,
        {
          duration: 8000,
          action: {
            label: "View",
            onClick: () => setShowNotificationDropdown(true),
          },
        }
      );
    };

    // Handle ride status change events
    const handleRideStatusUpdated = (statusData) => {
      if (!statusData) return;

      // For rejected/canceled rides
      if (
        statusData.newStatus === "rejected" ||
        statusData.newStatus === "canceled"
      ) {
        const reason = statusData.cancelReason || "No reason provided";
        const statusMessage =
          statusData.newStatus === "rejected"
            ? `Ride rejected: ${reason}`
            : `Ride canceled: ${reason}`;

        setLocalNotifications((prev) => [
          {
            id: `ride-status-${statusData.rideId || Date.now()}`,
            type: `ride_${statusData.newStatus}`,
            message: statusMessage,
            timestamp: new Date(),
            statusData: statusData,
          },
          ...prev,
        ]);

        toast.error(statusMessage);
      }
    };

    // Set up event listeners
    socket.on("trip_created", handleTripCreated);
    socket.on("driver_ride_request", handleRideRequest);
    socket.on("ride_requested", handleRideRequest);
    socket.on("ride_status_updated", handleRideStatusUpdated);

    // Clean up listeners on unmount
    return () => {
      socket.off("trip_created", handleTripCreated);
      socket.off("driver_ride_request", handleRideRequest);
      socket.off("ride_requested", handleRideRequest);
      socket.off("ride_status_updated", handleRideStatusUpdated);
    };
  }, [userRole]);

  // ----- 2) Listen for scrolling to add shadow on the navbar -----
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ----- 3) Get user KYC status if authenticated -----
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(getUserKYCStatus(user._id));
    }
  }, [isAuthenticated, user, dispatch]);

  // ----- 4) Animate the bell icon if KYC is pending or not submitted -----
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

  // Helper: navigate to a path
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // Role-based content rendering
  const renderRoleBasedNavItems = useCallback(() => {
    if (!isAuthenticated) return null;

    if (userRole === "driver") {
      return (
        <div className="hidden md:flex space-x-3">
          <button
            onClick={() => handleNavigate("/driverridestatus")}
            className="flex items-center h-9 px-4 rounded-md bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200"
          >
            <Car className="h-4 w-4 mr-2" />
            <span>Active Rides</span>
          </button>
          <button
            onClick={() => handleNavigate("/tripForm")}
            className="flex items-center h-9 px-4 rounded-md border border-green-500 text-green-600 font-medium text-sm hover:bg-green-50 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Publish Trip</span>
          </button>
        </div>
      );
    } else {
      // Regular user role
      return (
        <div className="hidden md:flex space-x-3">
          <button
            onClick={() => handleNavigate("/requestride")}
            className="flex items-center h-9 px-4 rounded-md bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200"
          >
            <Car className="h-4 w-4 mr-2" />
            <span>Request Ride</span>
          </button>
          <button
            onClick={() => handleNavigate("/trips")}
            className="flex items-center h-9 px-4 rounded-md border border-green-500 text-green-600 font-medium text-sm hover:bg-green-50 transition-all duration-200"
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span>Find Trips</span>
          </button>
        </div>
      );
    }
  }, [isAuthenticated, userRole, handleNavigate]);

  // Confirm Logout Toast
  const confirmLogout = useCallback(() => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
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
  }, []);

  // Actual Logout Handler
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

  // Handle opening KYC modals based on role and prevent opening if already verified
  const handleOpenKycModal = useCallback(() => {
    // Don't open KYC modal if already verified
    if (kycStatus === "verified") {
      toast.info("Your KYC is already verified");
      return;
    }

    // Only allow editing if status is rejected or not submitted
    if (kycStatus === "pending") {
      toast.info(
        "Your KYC is pending verification. You cannot edit it at this time."
      );
      return;
    }

    if (userRole === "driver") {
      setShowDriverKycModal(true);
    } else {
      setShowUserKycModal(true);
    }
  }, [userRole, kycStatus]);

  // Generate a notification message based on KYC status
  const notificationMessage = useMemo(() => {
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
  }, [isAuthenticated, kycStatus, userRole]);

  // Navigate to appropriate dashboard based on role
  const navigateToDashboard = useCallback(() => {
    if (userRole === "driver") {
      navigate("/driverdashboard");
    } else {
      navigate("/userDashboard");
    }
    setIsUserMenuOpen(false);
  }, [userRole, navigate]);

  // Handle clearing notifications
  const handleClearLocalNotifications = useCallback(() => {
    setLocalNotifications([]);
  }, []);

  // Clear specific notification by ID
  const clearLocalNotification = useCallback((notificationId) => {
    if (!notificationId) return;
    setLocalNotifications((prev) =>
      prev.filter((n) => n.id !== notificationId)
    );
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
        isScrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavigate("/")}
          >
            <div className="bg-green-50 p-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
              <Car className="h-5 w-5 text-green-600" />
            </div>
            <span className="ml-2 text-lg font-bold text-gray-800 tracking-tight group-hover:text-green-600 transition-colors">
              TripShare
            </span>
          </div>

          {/* Middle: Nav Links */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <NavLinks />
          </div>

          {/* Right: Search, Rides, Notifications, User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar (hidden on mobile and when not authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <SearchBar />
              </div>
            )}

            {/* Role-based action buttons */}
            {isAuthenticated && renderRoleBasedNavItems()}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                  className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={showNotificationDropdown}
                  aria-haspopup="true"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {totalUniqueNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-1 ring-white">
                      {totalUniqueNotifications > 99
                        ? "99+"
                        : totalUniqueNotifications}
                    </span>
                  )}
                </button>

                {/* Notification Center */}
                {showNotificationDropdown && (
                  <NotificationCenter
                    isOpen={showNotificationDropdown}
                    onClose={() => setShowNotificationDropdown(false)}
                    localNotifications={localNotifications}
                    clearLocalNotifications={handleClearLocalNotifications}
                    clearSingleNotification={clearLocalNotification}
                  />
                )}
              </div>
            )}

            {/* KYC Alert - if needed */}
            {isAuthenticated && notificationMessage && (
              <div className="relative">
                <button
                  onClick={() => handleOpenKycModal()}
                  className={`flex items-center p-2 rounded-full ${
                    isBlinking
                      ? "animate-pulse bg-amber-50"
                      : "hover:bg-gray-100"
                  } transition-colors`}
                  title={notificationMessage}
                >
                  <AlertCircle
                    className={`h-5 w-5 ${
                      isBlinking ? "text-amber-500" : "text-gray-600"
                    }`}
                  />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white"></span>
                </button>
              </div>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <UserCircle className="h-5 w-5 text-gray-600" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 border border-gray-100 transform origin-top-right transition-all duration-200 ease-out ring-1 ring-black ring-opacity-5 z-50">
                    {/* Header: Signed in as */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5 truncate max-w-full">
                        {userName}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-1">
                          Role:
                        </span>
                        <span className="text-xs font-medium capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                          {userRole}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowProfileModal(true);
                        }}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                      >
                        <User className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={navigateToDashboard}
                        className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                      >
                        <Home className="h-4 w-4 mr-2.5 text-gray-400" />
                        <span>
                          {userRole === "driver"
                            ? "Driver Dashboard"
                            : "User Dashboard"}
                        </span>
                      </button>

                      {/* Role-specific menu items */}
                      {userRole === "driver" ? (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleNavigate("/tripForm");
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                          >
                            <Plus className="h-4 w-4 mr-2.5 text-gray-400" />
                            <span>Publish Trip</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleNavigate("/driverridestatus");
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                          >
                            <Car className="h-4 w-4 mr-2.5 text-gray-400" />
                            <span>Active Rides</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleNavigate("/requestride");
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                          >
                            <Car className="h-4 w-4 mr-2.5 text-gray-400" />
                            <span>Request Ride</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleNavigate("/ridestatus");
                            }}
                            className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                          >
                            <Clock className="h-4 w-4 mr-2.5 text-gray-400" />
                            <span>My Rides</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* KYC Status */}
                    <div className="py-1">
                      {kycStatus !== "verified" ? (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleOpenKycModal();
                          }}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors items-center"
                        >
                          <AlertCircle className="h-4 w-4 mr-2.5 text-gray-400" />
                          <span>KYC Verification</span>
                        </button>
                      ) : (
                        <div className="flex items-center w-full px-4 py-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          confirmLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2.5 text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // If NOT authenticated, show Login/Register
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  WholeClassName="text-gray-700 hover:text-green-600 font-medium transition-colors px-3 py-1.5"
                  onClick={() => handleNavigate("/login")}
                >
                  Login
                </Button>
                <Button
                  WholeClassName="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-md transition-colors shadow-sm"
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
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
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
        kycStatus={kycStatus}
        navigateToDashboard={navigateToDashboard}
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

      {/* Toaster for notifications */}
      <Toaster position="top-right" />
    </nav>
  );
}
