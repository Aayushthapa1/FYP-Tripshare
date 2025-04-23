import {
  UserCircle,
  LogOut,
  AlertCircle,
  Car,
  Plus,
  MapPin,
  Home,
  User,
  Clock,
  CreditCard,
  CheckCircle,
  Settings,
} from "lucide-react";
import NavLinks from "./NavLinks";

const MobileMenu = ({
  isOpen,
  user,
  role,
  isAuthenticated,
  onNavigate,
  onLogout,
  closeMenu,
  onOpenProfile,
  notificationMessage,
  onOpenKyc,
  kycStatus,
  navigateToDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slideDown">
      <div className="px-4 pt-3 pb-4 space-y-4">
        {/* Search Bar for Mobile */}
        <div className="relative mb-2">
          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <input
              type="text"
              placeholder="Search rides, locations..."
              className="w-full bg-transparent py-2 px-3 text-sm text-gray-800 focus:outline-none"
            />
            <button className="bg-green-500 text-white p-2 m-1 rounded-md hover:bg-green-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <NavLinks mobile={true} onClick={closeMenu} />
        </div>

        {/* Notification for Mobile - Only show if authenticated and notification exists */}
        {isAuthenticated && notificationMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1.5">
                  Action Required
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {notificationMessage}
                </p>
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenKyc();
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors shadow-sm"
                >
                  {role === "driver" ? "Complete Driver KYC" : "Complete KYC"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {role === "driver" ? (
              <>
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/driverridestatus");
                  }}
                  className="flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md transition shadow-sm"
                >
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Active Rides</span>
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/tripForm");
                  }}
                  className="flex items-center justify-center space-x-1.5 border border-green-500 text-green-600 py-2 px-3 rounded-md hover:bg-green-50 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Publish Trip</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/requestride");
                  }}
                  className="flex items-center justify-center space-x-1.5 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md transition shadow-sm"
                >
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Request Ride</span>
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/trips");
                  }}
                  className="flex items-center justify-center space-x-1.5 border border-green-500 text-green-600 py-2 px-3 rounded-md hover:bg-green-50 transition"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Find Trips</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* User Section */}
        {isAuthenticated ? (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3 py-2">
              <div className="bg-gray-100 rounded-full p-2">
                <UserCircle className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900 leading-tight">
                  {user?.fullName || user?.userName || "User"}
                </p>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-1.5">Role:</span>
                  <span className="text-xs font-medium capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                    {role || "user"}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenProfile();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-md"
              >
                <User className="h-4 w-4 mr-2.5 text-gray-400" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  navigateToDashboard();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-md"
              >
                <Home className="h-4 w-4 mr-2.5 text-gray-400" />
                <span>
                  {role === "driver" ? "Driver Dashboard" : "User Dashboard"}
                </span>
              </button>

              {/* Role-specific menu items */}
              {role === "driver" ? (
                <>
                  <button
                    onClick={() => {
                      closeMenu();
                      onNavigate("/driverridestatus");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-md"
                  >
                    <Car className="h-4 w-4 mr-2.5 text-gray-400" />
                    <span>Active Rides</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      closeMenu();
                      onNavigate("/ridestatus");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-md"
                  >
                    <Clock className="h-4 w-4 mr-2.5 text-gray-400" />
                    <span>My Rides</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  closeMenu();
                  onNavigate("/bookings");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors rounded-md"
              >
                <CreditCard className="h-4 w-4 mr-2.5 text-gray-400" />
                <span>My Bookings</span>
              </button>

              {/* KYC Status */}
              <div className="pt-1 border-t border-gray-100">
                {kycStatus !== "verified" ? (
                  <button
                    onClick={() => {
                      closeMenu();
                      onOpenKyc();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors rounded-md"
                  >
                    <AlertCircle className="h-4 w-4 mr-2.5 text-orange-400" />
                    <span>KYC Verification</span>
                  </button>
                ) : (
                  <div className="flex items-center w-full px-4 py-2 text-sm text-green-600 bg-green-50 rounded-md">
                    <CheckCircle className="h-4 w-4 mr-2.5" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 transition-colors rounded-md mt-2 shadow-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 py-3 border-t border-gray-200">
            <button
              onClick={() => {
                closeMenu();
                onNavigate("/login");
              }}
              className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => {
                closeMenu();
                onNavigate("/register");
              }}
              className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors shadow-sm"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
