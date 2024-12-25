import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TripShare</h3>
            <p className="text-sm">
              Making travel more accessible, affordable, and sustainable for
              everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm sm:text-base">
                  support@tripshare.com
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm sm:text-base">+9807360833</span>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 text-center">
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-green-500 transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-green-500 transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="hover:text-green-500 transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm sm:text-base">
            &copy; {new Date().getFullYear()} TripShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
