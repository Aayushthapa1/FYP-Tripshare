import React from 'react';
import { Search, Users, Car } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Search for rides',
    description: 'Enter your destination and find available rides'
  },
  {
    icon: Users,
    title: 'Connect with travelers',
    description: 'Chat with drivers and confirm your ride'
  },
  {
    icon: Car,
    title: 'Enjoy journeys',
    description: 'Travel together and share the experience'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600">
            Start your journey in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <step.icon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}