// src/components/user/pages/NotFound.jsx

import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md bg-white shadow-md rounded p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          Sorry, the page you’re looking for isn’t available.
        </p>
        <Link
          to="/"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
