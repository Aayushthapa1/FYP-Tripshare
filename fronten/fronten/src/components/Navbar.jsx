import React from 'react';
import { Car } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">TripShare</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-indigo-600">How it Works</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Safety</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Help</a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}