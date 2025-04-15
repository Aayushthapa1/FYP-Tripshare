import React, { memo } from "react";
import { LoadScript } from "@react-google-maps/api";

const libraries = ["places", "directions", "geometry"];

const MapContainer = memo(({ children }) => {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
      libraries={libraries}
      loadingElement={
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin mr-2 h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          Loading Maps...
        </div>
      }
    >
      {children}
    </LoadScript>
  );
});

export default MapContainer;
