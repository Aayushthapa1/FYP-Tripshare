
import { UserCircle, LogOut, AlertCircle } from "lucide-react";
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
  onOpenKyc, // Add this prop
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="px-4 py-3 space-y-4">
        {/* Navigation Links */}
        <div className="space-y-2">
          <NavLinks mobile={true} onClick={closeMenu} />
        </div>

        {/* Notification for Mobile - Only show if authenticated and notification exists */}
        {isAuthenticated && notificationMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-3 animate-pulse">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Action Required
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  {notificationMessage}
                </p>
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenKyc(); // Use the new prop here
                  }}
                  className="w-full px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  {role === "driver" ? "Complete Driver KYC" : "Complete KYC"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Section */}
        {isAuthenticated ? (
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <UserCircle className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {user?.userName || "User"}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {role || "user"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  closeMenu();
                  onOpenProfile();
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Profile Settings
              </button>

              {role === "driver" ? (
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/tripForm");
                  }}
                  className="w-full px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  Publish a Ride
                </button>
              ) : (
                <button
                  onClick={() => {
                    closeMenu();
                    onNavigate("/trips");
                  }}
                  className="w-full px-4 py-2 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  View Rides
                </button>
              )}

              <button
                onClick={() => {
                  closeMenu();
                  onOpenKyc(); // Use the new prop here instead of navigating
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                KYC Verification
              </button>

              <button
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
                className="w-full px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-center flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                closeMenu();
                onNavigate("/login");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => {
                closeMenu();
                onNavigate("/register");
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
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
