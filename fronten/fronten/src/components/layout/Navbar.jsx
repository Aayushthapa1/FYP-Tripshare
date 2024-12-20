import React, { useState, useEffect } from 'react';
import { Car, Menu, X } from 'lucide-react';
import NavLinks from './NavLinks';
import AuthButtons from './AuthButtons';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <Car className={`h-8 w-8 transition-colors duration-300 ${
              isScrolled ? 'text-green-500' : 'text-white'
            }`} />
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              TripShare
            </span>
          </div>
          <NavLinks isScrolled={isScrolled} />
          <AuthButtons isScrolled={isScrolled} />
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} />
    </nav>
  );
}