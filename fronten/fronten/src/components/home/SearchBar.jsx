import React from 'react';
import { MapPin, Calendar, Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 text-green-500 h-5 w-5" />
          <input
            type="text"
            placeholder="From"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors duration-200"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 text-green-500 h-5 w-5" />
          <input
            type="text"
            placeholder="To"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors duration-200"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 text-green-500 h-5 w-5" />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors duration-200"
          />
        </div>
        <button className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2">
          <Search className="h-5 w-5" />
          <span className="font-medium">Search</span>
        </button>
      </form>
    </div>
  );
}