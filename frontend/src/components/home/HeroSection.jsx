
import { useNavigate } from "react-router-dom"

import { ArrowRight, Users, MapPin, Shield, Star } from "lucide-react"

export default function HeroSection() {
  const navigate = useNavigate()

  const handleFindRide = () => {
    navigate("/trips")
  }

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hero background"
          className="w-full h-full object-cover transform scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/50" />

        {/* Animated dots overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px] opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Animated badge */}
          <div className="inline-block mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-300 backdrop-blur-sm border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              New routes available
            </span>
          </div>

          {/* Main heading with animation */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Travel Together.
            <span className="block mt-2 text-green-400 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              Save Together.
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            Join our community of travelers sharing journeys across the country. Save money, reduce emissions, and make
            new connections.
          </p>

          {/* Stats section */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-in-up"
            style={{ animationDelay: "1s" }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl md:text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-300">Active users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl md:text-3xl font-bold text-white">5K+</div>
              <div className="text-sm text-gray-300">Rides shared</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-300">Cities</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl md:text-3xl font-bold text-white">4.8</div>
              <div className="text-sm text-gray-300">Average rating</div>
            </div>
          </div>

          {/* CTA buttons with improved styling */}
          <div
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-fade-in-up"
            style={{ animationDelay: "1.2s" }}
          >
            <button
              onClick={handleFindRide}
              className="group relative px-8 py-4 bg-green-500 text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-green-600 shadow-lg hover:shadow-green-500/30 flex items-center justify-center"
            >
              <span className="relative z-10 text-lg font-medium flex items-center">
                Find a Ride
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-400 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>

            <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/20 border border-white/20 shadow-lg flex items-center justify-center">
              <span className="relative z-10 text-lg font-medium flex items-center">
                Offer a Ride
                <Users className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              </span>
            </button>
          </div>

          {/* Search bar with enhanced styling */}
         
          {/* Trust indicators */}
          <div
            className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in-up"
            style={{ animationDelay: "1.6s" }}
          >
            <div className="flex items-center text-gray-300">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>Verified Drivers</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Star className="w-5 h-5 mr-2 text-green-400" />
              <span>Rated Journeys</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              <span>Real-time Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10"></div>
    </div>
  )
}

