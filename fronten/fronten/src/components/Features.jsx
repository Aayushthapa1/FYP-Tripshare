import React from 'react';
import { Shield, Clock, MapPin, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'All our drivers are verified and vehicles are regularly inspected for your safety.'
  },
  {
    icon: Clock,
    title: '24/7 Service',
    description: 'Available round the clock for all your transportation needs.'
  },
  {
    icon: MapPin,
    title: 'Live Tracking',
    description: 'Track your ride in real-time and share your journey with loved ones.'
  },
  {
    icon: Smartphone,
    title: 'Easy Booking',
    description: 'Book your ride with just a few taps on your smartphone.'
  }
];

function Features() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
          <p className="mt-4 text-lg text-gray-600">Experience the best ride-sharing service in town</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;
