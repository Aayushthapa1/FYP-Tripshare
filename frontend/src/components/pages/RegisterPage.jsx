import React from "react";
import RegisterForm from "../auth/RegisterForm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state?.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white w-full max-w-5xl rounded-2xl shadow-[0_10px_40px_rgba(8,_112,_84,_0.12)] overflow-hidden">
        {/* Left Side - Decorative Area */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

          <div className="text-left relative z-10 max-w-sm">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Welcome to <span className="text-green-100">TripShare</span>
            </h1>
            <p className="text-green-100 text-lg mb-8 font-light leading-relaxed">
              Join our community and start sharing eco-friendly rides with
              fellow travelers today.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-green-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-green-100">Reduce your carbon footprint</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-green-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-green-100">Save money on transportation</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-green-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <p className="text-green-100">
                  Connect with like-minded people
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-12 overflow-y-auto">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

          <div className="max-w-md mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Create Account
              </h2>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
            </div>

            <RegisterForm />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  Sign in
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
