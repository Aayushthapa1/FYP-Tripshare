import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Map, AlertCircle, Navigation } from "lucide-react";

// Function to load Google Maps API
const loadGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Skip if already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));

    document.head.appendChild(script);
  });
};

const RoutePreviewMap = ({ apiKey, originCoords, destinationCoords }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is required");
      setLoading(false);
      return;
    }

    setApiLoading(true);
    loadGoogleMapsAPI(apiKey)
      .then(() => {
        console.log("Google Maps API loaded successfully");
        setApiLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps API:", err);
        setError("Failed to load Google Maps API");
        setLoading(false);
        setApiLoading(false);
      });
  }, [apiKey]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got user location:", position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Error getting user location:", err.message);
          // Fall back to a default location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.006 }); // New York as default
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      // Geolocation not supported, use a default
      setUserLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  // Initialize Google Maps and DirectionsRenderer
  const initializeMap = useCallback(() => {
    if (!window.google || !window.google.maps) {
      setError("Google Maps API not loaded");
      setLoading(false);
      return;
    }

    try {
      console.log("Initializing map with user location:", userLocation);

      // Center map on user location if available, or use a default world center
      const center = userLocation || { lat: 40.7128, lng: -74.006 };
      const zoom = userLocation ? 12 : 2; // Zoom in if we have user location

      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add a marker for user's current location if available
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Your Location",
        });
      }

      // Create directions renderer
      const renderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
      });

      console.log("Map initialized successfully");
      setMapInstance(map);
      setDirectionsRenderer(renderer);
      setMapLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map: " + err.message);
      setLoading(false);
    }
  }, [userLocation]);

  // Initialize map when API is loaded and userLocation is available
  useEffect(() => {
    // Skip if map ref isn't ready or API is still loading
    if (!mapRef.current || apiLoading) return;

    // Skip if userLocation isn't set yet
    if (userLocation === null) return;

    // Skip if Google Maps isn't loaded yet
    if (!window.google || !window.google.maps) {
      console.log("Waiting for Google Maps API to load...");
      return;
    }

    console.log("Ready to initialize map");
    initializeMap();
  }, [initializeMap, userLocation, apiLoading]);

  // Update directions when coordinates or map changes
  useEffect(() => {
    // Skip if required values are not ready
    if (!mapLoaded || !directionsRenderer || !mapInstance) {
      console.log("Map not ready for directions yet");
      return;
    }

    // Skip if coordinates are not available
    if (!originCoords || !destinationCoords) {
      console.log("Missing coordinates, can't calculate route");
      setDistance(null);
      setDuration(null);
      return;
    }

    // Log coordinate values for debugging
    console.log("Origin coords:", originCoords);
    console.log("Destination coords:", destinationCoords);

    // Validate coordinates
    const isValidCoords = (coords) => {
      return (
        coords &&
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
      );
    };

    if (!isValidCoords(originCoords) || !isValidCoords(destinationCoords)) {
      console.error("Invalid coordinates provided", {
        originCoords,
        destinationCoords,
      });
      setError("Invalid coordinates provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Calculating route...");
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            originCoords.lat,
            originCoords.lng
          ),
          destination: new window.google.maps.LatLng(
            destinationCoords.lat,
            destinationCoords.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
          avoidTolls: false,
          avoidHighways: false,
        },
        (response, status) => {
          setLoading(false);

          if (status === "OK" && response) {
            console.log("Route calculated successfully:", response);
            directionsRenderer.setDirections(response);

            // Extract distance and duration information
            const route = response.routes[0];
            if (route && route.legs && route.legs[0]) {
              setDistance(route.legs[0].distance.text);
              setDuration(route.legs[0].duration.text);
            }

            // Fit the map to the route
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(
              new window.google.maps.LatLng(originCoords.lat, originCoords.lng)
            );
            bounds.extend(
              new window.google.maps.LatLng(
                destinationCoords.lat,
                destinationCoords.lng
              )
            );
            mapInstance.fitBounds(bounds);
          } else {
            console.error("Directions request failed due to " + status);
            setError(`Could not calculate route: ${status}`);
            setDistance(null);
            setDuration(null);

            // Reset the directions
            directionsRenderer.setDirections({ routes: [] });

            // Show both markers even if route fails
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(
              new window.google.maps.LatLng(originCoords.lat, originCoords.lng)
            );
            bounds.extend(
              new window.google.maps.LatLng(
                destinationCoords.lat,
                destinationCoords.lng
              )
            );
            mapInstance.fitBounds(bounds);
          }
        }
      );
    } catch (err) {
      console.error("Error requesting directions:", err);
      setError("Failed to get directions: " + err.message);
      setLoading(false);
    }
  }, [
    mapLoaded,
    mapInstance,
    directionsRenderer,
    originCoords,
    destinationCoords,
  ]);

  // If coordinates not provided, show placeholder
  if (!originCoords || !destinationCoords) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Route Preview
          </span>
        </div>
        <div className="h-48 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">
              Select both locations to see route preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
      <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Route Preview</span>
        {distance && duration && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">{distance}</span> • approx. {duration}
          </div>
        )}
      </div>

      {/* Map container */}
      <div ref={mapRef} className="h-48" />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-gray-600">Loading route...</span>
          </div>
        </div>
      )}

      {/* API loading indicator */}
      {apiLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-gray-600">
              Loading Google Maps...
            </span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-5/6 z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md shadow-sm">
          <div className="flex items-center">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}

      {/* My Location button */}
      {mapInstance && userLocation && (
        <button
          onClick={() => {
            mapInstance.setCenter(userLocation);
            mapInstance.setZoom(15);
          }}
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
          title="Go to my location"
        >
          <Navigation size={16} className="text-blue-500" />
        </button>
      )}
    </div>
  );
};

export default RoutePreviewMap;
