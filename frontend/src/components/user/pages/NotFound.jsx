import { Link } from "react-router-dom";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";

function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon with Paper */}
          <div className="relative mx-auto mb-8 w-40 h-40">
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg transform rotate-6"></div>
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-center h-full">
                <h1 className="text-7xl font-bold text-green-500">
                  4<span className="inline-block mx-1">0</span>4
                </h1>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-4xl font-bold text-gray-600 mb-6">
            Page Not Found
          </h2>

          <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
            Uh oh, we can't seem to find the page you're looking for. Try going
            back to previous page or{" "}
            <Link
              to="/contact"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Contact us
            </Link>{" "}
            for more information.
          </p>

          {/* Home Button */}
          <Link
            to="/"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200 uppercase tracking-wide"
          >
            Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;
