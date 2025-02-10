import React, { useEffect } from "react";
import LoginForm from "../auth/LoginForm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state?.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white h-auto md:h-[600px] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Form Area */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600 mb-8">Please sign in to your account</p>

            <LoginForm />

            <p className="text-center text-sm mt-6 text-gray-600">
              Don't have an account yet?{" "}
              <a
                href="/register"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Right Side - Decorative Area */}
        <div className="w-full md:w-5/12 h-auto md:h-full bg-gradient-to-br from-green-600 to-green-800 flex flex-col justify-center items-center p-8 md:p-12">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Welcome to TripShare!</h1>
            <p className="text-green-100 mb-8">
              Enter your personal details and start your journey with us
            </p>
            {/* Add your illustration or decorative elements here */}
            <div className="w-full max-w-sm mx-auto">
              {/* You can add an SVG illustration or image here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;