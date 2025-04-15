"use client";

import { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Car,
} from "lucide-react";
import { motion } from "framer-motion";

function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing email:", email);
    setEmail("");
    // Show success message or toast notification here
  };

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-8 md:mb-10">
          <div className="flex items-center mb-3">
            <Car className="h-6 w-6 text-green-500 mr-2" />
            <span className="text-white font-bold text-xl tracking-tight">
              TripShare
            </span>
          </div>
          <p className="text-gray-400 text-center text-sm max-w-md">
            Making travel more accessible, affordable, and sustainable for
            everyone through shared journeys.
          </p>
        </div>

        {/* Footer Grid - More compact with smaller spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-8">
          {/* About Us */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 relative after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-1">
              About Us
            </h3>
            <p className="text-gray-400 mb-3 text-sm leading-relaxed">
              TripShare connects travelers going the same way, reducing costs
              and environmental impact.
            </p>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
              <span>123 Travel Lane, Journey City</span>
            </div>
          </div>

          {/* Quick Links - More compact list */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3 relative after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-1">
              Quick Links
            </h4>
            <ul className="grid grid-cols-1 gap-y-1.5 text-sm">
              {[
                "About Us",
                "How It Works",
                "Privacy Policy",
                "Terms of Service",
                "FAQ",
                "Contact",
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="group flex items-center hover:text-green-400 transition-colors duration-300"
                  >
                    <ArrowRight className="h-3 w-3 mr-1.5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section - More compact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3 relative after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-1">
              Contact Us
            </h4>
            <div className="space-y-2 mb-4">
              <a
                href="mailto:support@tripshare.com"
                className="flex items-center group text-sm hover:text-green-400 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2 text-green-500" />
                support@tripshare.com
              </a>
              <a
                href="tel:+9807360833"
                className="flex items-center group text-sm hover:text-green-400 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2 text-green-500" />
                +980 736 0833
              </a>
            </div>

            {/* Social Links - Horizontal layout */}
            <div>
              <p className="text-white text-sm font-medium mb-2">Follow Us</p>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    className="bg-gray-800 p-1.5 rounded-full hover:bg-green-500 transition-colors duration-300"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-4 w-4 text-gray-300 hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter - More compact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3 relative after:content-[''] after:absolute after:w-8 after:h-0.5 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-1">
              Stay Connected
            </h4>
            <p className="text-gray-400 mb-3 text-sm">
              Subscribe for the latest updates and travel tips.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
              <motion.button
                type="submit"
                className="w-full bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </motion.button>
            </form>
          </div>
        </div>

        {/* Footer Bottom - Simplified */}
        <div className="border-t border-gray-800 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <p className="text-gray-500 mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} TripShare. All rights reserved.
          </p>
          <div className="flex space-x-4 text-gray-500">
            {["Privacy Policy", "Terms of Service", "Cookies"].map(
              (link, index) => (
                <a
                  key={index}
                  href="#"
                  className="hover:text-green-400 transition-colors"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
