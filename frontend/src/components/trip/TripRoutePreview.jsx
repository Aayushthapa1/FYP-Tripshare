"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const TripRoutePreview = ({ trip, apiKey }) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Known city coordinates in Nepal and India
  const cityCoordinates = {
    // Nepal cities
    Kathmandu: { lat: 27.7172, lng: 85.324 },
    Pokhara: { lat: 28.2096, lng: 83.9856 },
    Itahari: { lat: 26.6631, lng: 87.2773 },
    Biratnagar: { lat: 26.4525, lng: 87.2718 },
    Birgunj: { lat: 27.0104, lng: 84.877 },
    Dharan: { lat: 26.8065, lng: 87.2846 },
    Butwal: { lat: 27.7006, lng: 83.4482 },
    Nepalgunj: { lat: 28.05, lng: 81.6167 },
    Bhaktapur: { lat: 27.671, lng: 85.4298 },
    Lalitpur: { lat: 27.6588, lng: 85.3247 },
    // Add more cities as needed
    // India cities
    Delhi: { lat: 28.7041, lng: 77.1025 },
    Mumbai: { lat: 19.076, lng: 72.8777 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
    Chennai: { lat: 13.0827, lng: 80.2707 },
    Kolkata: { lat: 22.5726, lng: 88.3639 },
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Skip if we don't have Google Maps loaded
    if (!window.google || !window.google.maps) {
      setMapError("Google Maps is not loaded yet");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Try to get coordinates from different possible sources
      let originCoords, destinationCoords;

      // First try to get from departureLocationDetails.coordinates
      if (trip.departureLocationDetails?.coordinates) {
        originCoords = {
          lat: trip.departureLocationDetails.coordinates.lat,
          lng: trip.departureLocationDetails.coordinates.lng,
        };
      }
      // Then try to get from city name lookup
      else if (cityCoordinates[trip.departureLocation]) {
        originCoords = cityCoordinates[trip.departureLocation];
      }

      // Same for destination
      if (trip.destinationLocationDetails?.coordinates) {
        destinationCoords = {
          lat: trip.destinationLocationDetails.coordinates.lat,
          lng: trip.destinationLocationDetails.coordinates.lng,
        };
      }
      // Then try to get from city name lookup
      else if (cityCoordinates[trip.destinationLocation]) {
        destinationCoords = cityCoordinates[trip.destinationLocation];
      }

      // Check if we have both coordinates
      if (!originCoords || !destinationCoords) {
        setMapError("Route information is not available");
        setIsLoading(false);
        return;
      }

      // Create map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: originCoords, // Center initially on departure
        disableDefaultUI: true, // Disable all controls for preview
        draggable: false, // Disable panning
        zoomControl: false,
        clickableIcons: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Create directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#4ade80", // green-400
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      // Calculate route
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: originCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            // Extract route information
            if (result.routes && result.routes.length > 0) {
              const route = result.routes[0];
              if (route.legs && route.legs.length > 0) {
                const leg = route.legs[0];
                setRouteInfo({
                  distance: leg.distance.text,
                  duration: leg.duration.text,
                });
              }
            }

            // Fit the map to the route bounds
            mapInstance.fitBounds(result.routes[0].bounds);

            setIsLoading(false);
          } else {
            console.error("Directions request failed with status:", status);
            setMapError("Couldn't find a driving route");
            setIsLoading(false);
          }
        }
      );
    } catch (err) {
      console.error("Error initializing map:", err);
      setMapError("Failed to initialize the route preview");
      setIsLoading(false);
    }
  }, [trip]);

  return (
    <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
      {/* Map container */}
      <div
        ref={mapRef}
        className={`w-full h-28 bg-gray-100 ${isLoading ? "opacity-50" : ""}`}
      ></div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error display */}
      {mapError && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-2 text-center">
          <div className="flex flex-col items-center space-y-1">
            <AlertTriangle size={18} className="text-yellow-500" />
            <p className="text-xs text-gray-600">{mapError}</p>
          </div>
        </div>
      )}

      {/* Route information */}
      {routeInfo && (
        <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-between text-xs">
          <div>
            <span className="font-medium">Distance:</span>{" "}
            <span className="text-gray-700">{routeInfo.distance}</span>
          </div>
          <div>
            <span className="font-medium">Time:</span>{" "}
            <span className="text-gray-700">{routeInfo.duration}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripRoutePreview;
