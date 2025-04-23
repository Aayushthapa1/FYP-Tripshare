import React, { memo, useState, useEffect } from "react";
import { LoadScript } from "@react-google-maps/api";

const libraries = ["places", "directions", "geometry"];

const MapContainer = memo(({ children }) => {
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Get API key with fallback
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Handle API loading errors
  useEffect(() => {
    if (loadError && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        console.log(`Retry attempt ${retryCount + 1} for Google Maps`);
        setRetryCount((prev) => prev + 1);
        setLoadError(null);
        setIsLoading(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loadError, retryCount]);

  // Handle successful loading
  const handleLoad = () => {
    console.log("Google Maps API loaded successfully");
    setIsLoading(false);
    setLoadError(null);
  };

  // Handle loading error
  const handleError = (error) => {
    console.error("Error loading Google Maps API:", error);
    setLoadError(error);
    setIsLoading(false);
  };

  // Retry loading manually
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      setLoadError(null);
      setIsLoading(true);
    }
  };

  // Error display component
  const ErrorDisplay = () => (
    <div className="h-64 bg-red-50 rounded-lg flex flex-col items-center justify-center p-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-red-500 mb-2"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-red-600 font-medium">Failed to load Google Maps</p>
      {retryCount < maxRetries && (
        <button
          onClick={handleRetry}
          className="mt-3 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
        >
          Retry Loading
        </button>
      )}
    </div>
  );

  // Loading display component
  const LoadingDisplay = () => (
    <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
      <div className="animate-spin mr-2 h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      <span className="text-gray-700 font-medium">Loading Maps...</span>
    </div>
  );

  // If there's an error after max retries, show error UI
  if (loadError && retryCount >= maxRetries) {
    return <ErrorDisplay />;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={<LoadingDisplay />}
    >
      {children}
    </LoadScript>
  );
});

// Set display name for debugging
MapContainer.displayName = "MapContainer";

export default MapContainer;
