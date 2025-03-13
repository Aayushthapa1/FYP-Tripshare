"use client"
import { Home, Phone, LogIn, UserPlus, Car, LogOut } from "lucide-react"

export default function MobileMenu({ isOpen, user, role, isAuthenticated, onNavigate, onLogout, closeMenu }) {
  return (
    <div
      className={`md:hidden fixed inset-x-0 top-16 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t shadow-lg rounded-b-xl">
        {/* Basic Links */}
        <button
          onClick={() => {
            onNavigate("/")
            closeMenu()
          }}
          className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5 mr-3 text-gray-500" />
          Home
        </button>

        <button
          onClick={() => {
            onNavigate("/contact")
            closeMenu()
          }}
          className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Phone className="h-5 w-5 mr-3 text-gray-500" />
          Contact Us
        </button>

        {/* If user is authenticated, show driver vs user logic */}
        {isAuthenticated ? (
          <>
            {role === "driver" ? (
              <button
                onClick={() => {
                  onNavigate("/tripForm")
                  closeMenu()
                }}
                className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Car className="h-5 w-5 mr-3 text-green-600" />
                Publish a Ride
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate("/trips")
                  closeMenu()
                }}
                className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Car className="h-5 w-5 mr-3 text-green-600" />
                View Rides
              </button>
            )}

            {/* Logout */}
            <button
              onClick={() => {
                onLogout()
                closeMenu()
              }}
              className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-gray-50 hover:text-red-700 rounded-lg transition-colors mt-4"
            >
              <LogOut className="h-5 w-5 mr-3 text-red-500" />
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Not Authenticated -> Show Login/Register */}
            <button
              onClick={() => {
                onNavigate("/login")
                closeMenu()
              }}
              className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogIn className="h-5 w-5 mr-3 text-gray-500" />
              Login
            </button>

            <button
              onClick={() => {
                onNavigate("/register")
                closeMenu()
              }}
              className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="h-5 w-5 mr-3 text-white" />
              Register
            </button>
          </>
        )}
      </div>
    </div>
  )
}

