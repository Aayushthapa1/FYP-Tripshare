import React from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';

export default function BookingForm() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Ride</h2>
      <form className="space-y-4">
        <div>
          <label className="flex items-center text-gray-700 mb-2">
            <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
            Pickup Location
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter pickup location"
          />
        </div>
        <div>
          <label className="flex items-center text-gray-700 mb-2">
            <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
            Destination
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter destination"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-gray-700 mb-2">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center text-gray-700 mb-2">
              <Clock className="w-5 h-5 mr-2 text-indigo-600" />
              Time
            </label>
            <input
              type="time"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Book Now
        </button>
      </form>
    </div>
  );
}