import React from 'react';

export default function AuthButtons() {
  return (
    <div className="hidden md:flex items-center space-x-4">
     

      {/* Get Started Button */}
      <button className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors font-medium">
        Sign Up
      </button>
       {/* Login Button */}
       <button className="text-black hover:text-green-600 font-medium">
        Login
      </button>
    </div>
  );
}
