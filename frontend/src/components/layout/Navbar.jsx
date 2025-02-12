import React, { useState, useEffect } from "react";
import { Car, Menu, X, User, LogOut, UserCircle } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Button from "../button.jsx";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for testing
  const [userInfo, setUserInfo] = useState({
    name: "Aayush Thapa",
    email: "aayush134056@gmail.com"
  }); // Sample user data

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    setIsAuthenticated(false);
    setUserInfo(null);
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <Car
              className={`h-8 w-8 transition-colors duration-300 ${
                isScrolled ? "text-green-500" : "text-white"
              }`}
            />
            <span
              className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              TripShare
            </span>
          </div>

          {/* Middle: Desktop Nav Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavLinks />
          </div>

          {/* Right: Auth Buttons or User Menu */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  WholeClassName="bg-white/10 hover:bg-white/20"
                  className="text-white"
                  hovered="text-white"
                  notHovered="text-white"
                  onClick={() => window.location.href = "/login"}
                >
                  Login
                </Button>
                <Button
                  WholeClassName="bg-green-500 hover:bg-green-600"
                  className="text-white"
                  hovered="text-white"
                  notHovered="text-white"
                  onClick={() => window.location.href = "/register"}
                >
                  Register
                </Button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
                    isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                  }`}
                >
                  <UserCircle className={`h-6 w-6 ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userInfo?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {userInfo?.email || "user@example.com"}
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile Settings
                    </a>
                    <a
                      href="/trips"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Trips
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X
                  className={`h-6 w-6 ${
                    isScrolled ? "text-gray-600" : "text-white"
                  }`}
                />
              ) : (
                <Menu
                  className={`h-6 w-6 ${
                    isScrolled ? "text-gray-600" : "text-white"
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        isAuthenticated={isAuthenticated}
        onLogin={() => window.location.href = "/login"}
        onRegister={() => window.location.href = "/register"}
        onLogout={handleLogout}
      />
    </nav>
  );
}