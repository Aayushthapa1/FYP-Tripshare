import React from "react";
import { DollarSign, Leaf, Clock, Shield } from "lucide-react";
import FeatureCard from "./FeatureCard.jsx";

const features = [
  {
    icon: DollarSign,
    title: "Affordable Rides",
    description: "Split costs with fellow travelers and save on your journey.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Travel",
    description: "Reduce your carbon footprint by sharing rides with others.",
  },
  {
    icon: Clock,
    title: "Real-Time Matching",
    description: "Find the perfect ride match instantly with our smart system.",
  },
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "Travel with confidence with our verified user community.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Why Choose TripShare
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-600">
            Experience the future of ride-sharing with our innovative platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
