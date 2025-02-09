import React from 'react';
import Navbar from './../layout/Navbar';

function HelpCenter() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* If Navbar is fixed/sticky, we add top padding on the container below */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full px-4 py-8 pt-20">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-center mb-6">
          How can we help you?
        </h1>

        {/* Search Box */}
        <div className="flex justify-center mb-8">
          <input
            type="search"
            placeholder="Search for help..."
            className="w-full max-w-md p-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-xl font-medium mb-4">Frequently Asked Questions</h2>

          <details className="mb-4">
            <summary className="cursor-pointer font-semibold text-gray-800">
              How do I reset my password?
            </summary>
            <p className="mt-2 text-gray-600 leading-relaxed">
              To reset your password, click on the "Forgot Password" link on
              the login page and follow the instructions sent to your email.
            </p>
          </details>

          <details className="mb-4">
            <summary className="cursor-pointer font-semibold text-gray-800">
              How do I upgrade my subscription?
            </summary>
            <p className="mt-2 text-gray-600 leading-relaxed">
              Go to your account settings and click on "Subscription". From there, 
              you can view and select available upgrade options.
            </p>
          </details>

          <details className="mb-4">
            <summary className="cursor-pointer font-semibold text-gray-800">
              What payment methods do you accept?
            </summary>
            <p className="mt-2 text-gray-600 leading-relaxed">
              We accept all major credit cards, PayPal, and bank transfers for 
              business accounts.
            </p>
          </details>
        </section>

        {/* Contact Support Section */}
        <section>
          <h2 className="text-xl font-medium mb-4">Contact Support</h2>
          <form className="flex flex-col space-y-4">
            {/* Name inputs (stack on mobile, side-by-side on md+) */}
            <div className="flex flex-col md:flex-row md:space-x-4">
              <input
                type="text"
                placeholder="First Name"
                className="flex-1 p-2 border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 md:mb-0"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="flex-1 p-2 border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email Address */}
            <input
              type="email"
              placeholder="Email Address"
              className="p-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject"
              className="p-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Message */}
            <textarea
              placeholder="Message"
              rows={5}
              className="p-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* File attachment */}
            <label className="text-gray-700 flex flex-col">
              Attach files (Max file size: 10MB)
              <input
                type="file"
                className="mt-2"
              />
            </label>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-block px-6 py-2 bg-green-500 text-white 
                         font-semibold rounded-md hover:bg-green-600 transition"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default HelpCenter;
