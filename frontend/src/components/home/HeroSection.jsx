import React from 'react';
import SearchBar from './SearchBar.jsx';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-8">
            Travel Together.
            <span className="block mt-2 text-green-400">Save Together.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-12 leading-relaxed">
            Join our community of travelers sharing journeys across the country.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button className="group relative px-8 py-3 bg-green-500 text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-green-600">
              <span className="relative z-10 text-lg font-medium">Find a Ride</span>
              <div className="absolute inset-0 bg-green-400 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>
            <button className="group relative px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/20">
              <span className="relative z-10 text-lg font-medium">Offer a Ride</span>
            </button>
          </div>
          <SearchBar />
        </div>
      </div>
    </div>
  );
}