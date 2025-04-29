import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldX, Home, LogIn, ArrowLeft, AlertCircle } from "lucide-react";

const UnauthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get error information from router state, or use defaults if not provided
  const errorInfo = location.state?.error || {
    title: "Access Denied",
    message: "You don't have permission to access this page.",
    suggestion:
      "Please verify your credentials or contact an administrator for assistance.",
  };

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
            {errorInfo.title}
          </h1>

          <div className="mb-8 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">{errorInfo.message}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-center text-sm">
              {errorInfo.suggestion}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-200 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

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
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Role-specific help text based on error info */}
      <div className="mt-8 max-w-md text-center">
        {errorInfo.title.includes("Driver") && (
          <p className="text-sm text-gray-600">
            Need to register as a driver?{" "}
            <Link
              to="/register"
              className="text-green-600 hover:underline font-medium"
            >
              Sign up here
            </Link>{" "}
            and select the driver option during registration.
          </p>
        )}

        {errorInfo.title.includes("Admin") && (
          <p className="text-sm text-gray-600">
            Admin access is restricted to authorized personnel only. Please
            contact your organization administrator.
          </p>
        )}

        {!errorInfo.title.includes("Driver") &&
          !errorInfo.title.includes("Admin") && (
            <p className="text-sm text-gray-500">
              If you need help, please contact{" "}
              <a
                href="mailto:support@example.com"
                className="text-green-600 hover:underline"
              >
                support@example.com
              </a>
            </p>
          )}
      </div>
    </div>
  );
};

export default UnauthPage;
