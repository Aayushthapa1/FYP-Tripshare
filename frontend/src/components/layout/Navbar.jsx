import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import ProfileModal from "../auth/ProfileModal.jsx";
import UserKycModal from "../driver/UserKYCModal";
import DriverKycModal from "../driver/DriverKycModal.jsx";
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

  // KYC modals
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
        <>
          <button
            onClick={() => handleNavigate("/driverridestatus")}
            className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm mr-2"
          >
            <Car className="h-4 w-4 mr-2" />
            <span>Active Rides</span>
          </button>
          <button
            onClick={() => handleNavigate("/tripForm")}
            className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg border border-green-500 text-green-500 font-medium text-sm hover:bg-green-50 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Publish Trip</span>
          </button>
        </>
      );
    } else {
      // Regular user role
      return (
        <>
          <button
            onClick={() => handleNavigate("/requestride")}
            className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-all duration-200 shadow-sm mr-2"
          >
            <Car className="h-4 w-4 mr-2" />
            <span>Request Ride</span>
          </button>
          <button
            onClick={() => handleNavigate("/trips")}
            className="hidden md:flex items-center justify-center px-4 py-2 rounded-lg border border-green-500 text-green-500 font-medium text-sm hover:bg-green-50 transition-all duration-200"
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span>Find Trips</span>
          </button>
        </>
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
  }, []);

  // Actual Logout Handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    dispatch(logoutUser());
    toast.success("Successfully logged out");
    setIsUserMenuOpen(false);
    navigate("/");
  }, [dispatch, navigate]);

  // Handle opening KYC modals based on role
  const handleOpenKycModal = useCallback(() => {
    if (userRole === "driver") {
      setShowDriverKycModal(true);
    } else {
      setShowUserKycModal(true);
    }
  }, [userRole]);

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

            {/* Role-based action buttons */}
            {isAuthenticated && renderRoleBasedNavItems()}

            {/* Regular Notification Bell: show for all authenticated users */}
            {isAuthenticated && (
              <div className="relative notification-container">
                <button
                  onClick={() =>
                    setShowNotificationDropdown(!showNotificationDropdown)
                  }
                  className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-expanded={showNotificationDropdown}
                  aria-haspopup="true"
                >
                  <Bell className="h-6 w-6 text-gray-700" />
                  {totalUniqueNotifications > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {totalUniqueNotifications > 99
                        ? "99+"
                        : totalUniqueNotifications}
                    </span>
                  )}
                </button>

                {/* Use the NotificationCenter component here */}
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
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-1">
                          Role:
                        </span>
                        <span className="text-xs font-medium capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                          {userRole}
                        </span>
                      </div>
                    </div>

                    {/* 1) Profile Button */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </button>

                    {/* 2) Dashboard Button - conditional based on role */}
                    <button
                      onClick={navigateToDashboard}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      <span>
                        {userRole === "driver"
                          ? "Driver Dashboard"
                          : "User Dashboard"}
                      </span>
                    </button>

                    {/* 3) Role-specific menu items */}
                    {userRole === "driver" ? (
                      <>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavigate("/tripForm");
                          }}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span>Publish Trip</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavigate("/driverridestatus");
                          }}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                        >
                          <Car className="h-4 w-4 mr-2" />
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
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          <span>Request Ride</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleNavigate("/ridestatus");
                          }}
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          <span>My Rides</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleNavigate("/bookings");
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>My Bookings</span>
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
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>KYC Verification</span>
                      </button>
                    ) : (
                      <div className="flex items-center w-full px-4 py-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Verified</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleNavigate("/settings");
                      }}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 text-left transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </button>

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

            {/* KYC Notification Alert: if kycStatus != verified - Now positioned to the right of profile */}
            {isAuthenticated && notificationMessage && (
              <div className="relative kyc-notification-container">
                <button
                  onClick={() => handleOpenKycModal()}
                  className={`flex items-center p-2 rounded-full ${
                    isBlinking
                      ? "animate-pulse bg-amber-100"
                      : "hover:bg-gray-100"
                  } transition-colors`}
                  title={notificationMessage}
                >
                  <AlertCircle
                    className={`h-6 w-6 ${
                      isBlinking ? "text-amber-500" : "text-gray-700"
                    }`}
                  />
                  <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500"></span>
                </button>
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
    </nav>
  );
}
