import { Link } from "react-router-dom";
import { ShieldX, Home, LogIn } from "lucide-react";

const UnauthPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 px-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Green header section */}
        <div className="bg-green-600 h-2 w-full"></div>

        <div className="p-8 sm:p-10">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-8">
            <ShieldX className="h-10 w-10 text-green-600" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800 text-center">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-8 text-center">
            You don't have permission to access this page. Please verify your
            credentials or contact an administrator for assistance.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-white bg-green-600 rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              Login Again
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-green-700 bg-green-50 border border-green-200 rounded-md font-medium hover:bg-green-100 transition-colors"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>

      {/* Optional subtle branding or additional info */}
      <p className="mt-8 text-sm text-gray-500">
        If you need help, please contact{" "}
        <a
          href="mailto:support@example.com"
          className="text-green-600 hover:underline"
        >
          support@example.com
        </a>
      </p>
    </div>
  );
};

export default UnauthPage;
