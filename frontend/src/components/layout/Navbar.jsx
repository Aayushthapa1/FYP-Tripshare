import React, { useState, useEffect } from "react";
import { Car, Menu, X, User } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
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
          <div className="flex-1">
            <NavLinks />
          </div>

          {/* Right: User Button and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center space-x-2 p-2 transition-colors ${
                  isScrolled ? "text-gray-700" : "text-white"
                } hover:text-green-600`}
              >
                <User className="h-6 w-6" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                  {isAuthenticated ? (
                    <>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Profile
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                        onClick={handleLogin}
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Register
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

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
      <MobileMenu isOpen={isMenuOpen} />
    </nav>
  );
}
