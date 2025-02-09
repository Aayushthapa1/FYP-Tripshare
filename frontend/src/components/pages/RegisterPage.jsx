import React from "react";
import RegisterForm from "../auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row bg-white h-auto md:h-[600px] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Decorative Area */}
        <div className="w-full md:w-5/12 h-auto md:h-full bg-gradient-to-br from-green-600 to-green-800 flex flex-col justify-center items-center p-8 md:p-12">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Welcome Aboard!</h1>
            <p className="text-green-100 mb-6">
              Join our community of travelers and start sharing rides today
            </p>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>
          <RegisterForm />
          <p className="text-center text-sm mt-6 text-gray-600">
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
  );
};

export default RegisterPage;