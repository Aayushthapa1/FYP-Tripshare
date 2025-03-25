"use client";
import { Search, Users, Car, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Search,
    title: "Search for rides",
    description:
      "Enter your destination and find available rides that match your schedule and preferences.",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    icon: Users,
    title: "Connect with travelers",
    description:
      "Chat with drivers, ask questions, and confirm your ride details before booking.",
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  {
    icon: Car,
    title: "Enjoy journeys",
    description:
      "Travel together, share costs, reduce emissions, and make connections along the way.",
    color: "bg-green-100 text-green-600 border-green-200",
  },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            How It <span className="text-green-600">Works</span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Start your journey in three simple steps
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200 z-0">
            <div className="absolute left-1/4 right-1/4 h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center"
              >
                <div
                  className={`relative flex items-center justify-center w-20 h-20 rounded-full ${step.color} mb-6 shadow-md border`}
                >
                  <step.icon className="h-10 w-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center max-w-xs">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="/register"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
