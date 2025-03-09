import React, { useState, useEffect } from "react";
import { Car, Menu, X, UserCircle, Search, Plus, LogOut } from "lucide-react";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import Button from "../button.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };


  const userId = useSelector((state)=>state?.auth?.user)?._id;
  const user = useSelector((state)=>state?.user?.userData?.Result?.user_data?.userName);
  console.log(userId);

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
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    setIsAuthenticated(false);
    setUserInfo(null);
    setIsUserMenuOpen(false);
    navigate("/"); 

  };

  return (
    <nav
      className={`fixed w-full z-50 bg-white border-b border-gray-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">TripShare</span>
          </div>

          {/* Middle: Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right: Search, Publish, and User Menu */}
          <div className="flex items-center space-x-10">
            {/* Search Button */}
            <button className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>

            {/* Publish a Ride Button */}
            <button
              onClick={() => handleNavigate("/tripForm")} // Use navigate
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all duration-200 shadow-sm space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Publish a Ride</span>
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                >
                  <UserCircle className="h-6 w-6 text-gray-700" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                    <button
  onClick={() => handleNavigate(`/profile/${userId}`)} // Navigate to profile page
  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
>
  {user|| "User"}
</button>
                     
                    </div>
                    <button
                      onClick={() => handleNavigate("/kycform")} // Use navigate
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => handleNavigate("/trips")} // Use navigate
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      My Trips
                    </button>
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
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  WholeClassName="text-gray-600 hover:text-gray-900"
                  onClick={() => handleNavigate("/login")} // Use navigate
                >
                  Login
                </Button>
                <Button
                  WholeClassName="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                  className="text-white"
                  hovered="text-white"
                  notHovered="text-white"
                  onClick={() => handleNavigate("/register")} // Use navigate
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
        isAuthenticated={isAuthenticated}
        onLogin={() => handleNavigate("/login")} // Use navigate
        onRegister={() => handleNavigate("/register")} // Use navigate
        onLogout={handleLogout}
      />
    </nav>
  );
}