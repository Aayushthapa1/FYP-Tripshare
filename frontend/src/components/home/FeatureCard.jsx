"use client";
import { motion } from "framer-motion";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  color = "bg-green-50 text-green-600",
}) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 flex flex-col"
    >
      <div
        className={`rounded-full w-12 h-12 flex items-center justify-center mb-5 ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed flex-grow">{description}</p>
    </motion.div>
  );
}
