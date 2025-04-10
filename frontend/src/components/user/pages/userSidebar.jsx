import React from 'react';
import { 
  User, 
  Home, 
  Map, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Calendar,
  Car,
  MapPin,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeSection, 
  navigateTo, 
  isMobileView, 
  userData, 
  user, 
  setIsProfileModalOpen 
}) => {
  const navigate = useNavigate();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    const name = userData?.fullName || user?.name || 'User';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && isMobileView && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-30 md:z-0 w-72 h-full transition-all duration-300 transform bg-white shadow-lg md:translate-x-0 overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with user info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xl">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userData?.fullName || user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userData?.email || user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
            >
              View Profile
            </button>
          </div>
          
          {/* Sidebar navigation */}
          <nav className="flex-1 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main
            </p>
            <ul className="space-y-1.5 mb-6">
              <li>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'dashboard' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('upcoming')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'upcoming' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Upcoming Trips
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('past-rides')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'past-rides' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Car className="w-5 h-5 mr-3" />
                  Past Rides
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('payments')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'payments' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Payment History
                </button>
              </li>
            </ul>
            
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Preferences
            </p>
            <ul className="space-y-1.5 mb-6">
              <li>
                <button
                  onClick={() => navigateTo('saved-locations')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'saved-locations' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <MapPin className="w-5 h-5 mr-3" />
                  Saved Locations
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('favorite-routes')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'favorite-routes' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Heart className="w-5 h-5 mr-3" />
                  Favorite Routes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('notifications')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'notifications' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('settings')}
                  className={`flex items-center w-full px-4 py-2.5 text-left text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                    activeSection === 'settings' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </button>
              </li>
            </ul>
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t mt-auto">
            <button
              onClick={() => {
                // Handle logout
                navigate('/logout');
              }}
              className="flex items-center w-full px-4 py-2.5 text-left text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;