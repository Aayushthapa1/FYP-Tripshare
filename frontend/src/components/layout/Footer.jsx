import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight, Car } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section with Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center mb-4">
            <Car className="h-8 w-8 text-green-500 mr-2" />
            <span className="text-white font-bold text-2xl tracking-tight">TripShare</span>
          </div>
          <p className="text-gray-400 text-center max-w-md">
            Making travel more accessible, affordable, and sustainable for everyone through shared journeys.
          </p>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-2">
              About Us
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              TripShare connects travelers going the same way, reducing costs and environmental impact while creating
              new connections.
            </p>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-sm">123 Travel Lane, Journey City</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-2">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>How It Works</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center hover:text-green-400 transition-colors duration-300">
                  <ArrowRight className="h-3 w-3 mr-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-2">
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="bg-gray-800 p-2 rounded-full mr-3 group-hover:bg-green-500 transition-colors duration-300">
                  <Mail className="h-4 w-4 text-green-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <a
                  href="mailto:support@tripshare.com"
                  className="text-sm sm:text-base hover:text-green-400 transition-colors duration-300"
                >
                  support@tripshare.com
                </a>
              </div>
              <div className="flex items-center group">
                <div className="bg-gray-800 p-2 rounded-full mr-3 group-hover:bg-green-500 transition-colors duration-300">
                  <Phone className="h-4 w-4 text-green-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <a
                  href="tel:+9807360833"
                  className="text-sm sm:text-base hover:text-green-400 transition-colors duration-300"
                >
                  +980 736 0833
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-white font-medium mb-4">Follow Us</h5>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-green-500 transition-colors duration-300 hover:scale-110 transform"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-green-500 transition-colors duration-300 hover:scale-110 transform"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-green-500 transition-colors duration-300 hover:scale-110 transform"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 relative after:content-[''] after:absolute after:w-12 after:h-1 after:bg-green-500 after:left-0 after:bottom-0 after:-mb-2">
              Stay Connected
            </h4>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and travel tips.</p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium flex items-center justify-center"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} TripShare. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-green-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

