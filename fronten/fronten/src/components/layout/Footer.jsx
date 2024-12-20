import React from "react";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">TripShare</h3>
            <p className="text-sm">
              Making travel more accessible, affordable, and sustainable for everyone.
            </p>
          </div>
          <div className="space-y-4 sm:space-y-2">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2">
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
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">support@tripshare.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
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
        </div>
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
