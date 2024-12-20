import React from 'react';

export default function AuthButtons() {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {/* Login Button */}
      <button className="text-gray-700 hover:text-green-600 font-medium">
        Login
      </button>

      {/* Get Started Button */}
      <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-medium">
        Get Started
      </button>
    </div>
  );
}
