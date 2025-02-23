import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileMenu({ isOpen }) {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); // Check if user is logged in

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from storage
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear cookies if used
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t">
        {[
          { href: '#', label: 'Home' },
          { href: 'Contact Us', label: 'Contact Us' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
          >
            {link.label}
          </a>
        ))}

        <div className="mt-4 space-y-2">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="block w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md"
            >
              Logout
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="block w-full px-3 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
