"use client";
import { DollarSign, Leaf, Clock, Shield } from "lucide-react";
import FeatureCard from "./FeatureCard.jsx";
import { motion } from "framer-motion";

const features = [
  {
    icon: DollarSign,
    title: "Affordable Rides",
    description: "Split costs with fellow travelers and save on your journey.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Travel",
    description: "Reduce your carbon footprint by sharing rides with others.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Clock,
    title: "Real-Time Matching",
    description: "Find the perfect ride match instantly with our smart system.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "Travel with confidence with our verified user community.",
    color: "bg-purple-50 text-purple-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
};

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Why Choose <span className="text-green-600">TripShare</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Experience the future of ride-sharing with our innovative platform.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
