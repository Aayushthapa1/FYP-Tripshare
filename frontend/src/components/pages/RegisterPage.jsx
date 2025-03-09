import React from "react";
import RegisterForm from "../auth/RegisterForm";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state?.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white w-full max-w-4xl h-[750px] rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_84,_0.15)] overflow-hidden">
        {/* Left Side - Decorative Area */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-76 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full translate-x-1/2 translate-y-1/2" />
          
          <div className="text-center text-white relative z-10">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-green-100">
              Join Our Community!
            </h1>
            <p className="text-green-100 text-lg mb-8 font-light">
              Create your account and start sharing rides with fellow travelers
            </p>
            <div className="w-3/4 max-w-[280px] mx-auto">
              {/* Optional: Add an illustration or icon here */}
  
            </div>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-7/12 bg-white p-6 md:p-8 overflow-y-auto relative">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
          
          <div className="max-w-[400px] mx-auto py-2">
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-800 ">
                Create Account
              </h2>
  
            </div>

            <RegisterForm />

            <div className="mt-4 text-center">
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