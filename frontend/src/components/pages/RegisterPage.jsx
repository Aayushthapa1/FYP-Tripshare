import React from "react";
import RegisterForm from "../auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex  flex-col md:flex-row bg-white h-auto md:h-[600px] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Right Side - Decorative Area */}
        <div className="w-full md:w-5/12 h-auto md:h-full bg-gradient-to-br from-green-600 to-green-800 flex flex-col justify-center items-center p-8 md:p-12">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Join Our Community!</h1>
            <p className="text-green-100 mb-8">
              Create your account and start sharing rides with fellow travelers
            </p>
            {/* Add your illustration or decorative elements here */}
            <div className="w-full max-w-sm mx-auto">
              {/* You can add an SVG illustration or image here */}
            </div>
          </div>
        </div>

        {/* Left Side - Form Area */}
        <div className=" md:w-7/12 p-8 md:p-12 flex flex-col justify-center ">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              Create Account
            </h2>
            <p className="text-gray-600  ">Get started with your journey</p>

            <RegisterForm />

            <p className="text-center text-sm mt-2 text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;