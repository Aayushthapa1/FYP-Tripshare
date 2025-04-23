import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";

const EnhancedGoogleMap = ({ trips, apiKey, onLocationFound }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [directionsRenderers, setDirectionsRenderers] = useState([]);
  const markersRef = useRef([]);

  // Load Google Maps script
  useEffect(() => {
    setIsLoading(true);

    // Check if script already exists
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Check if script is already loading
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapCallback`;
    script.async = true;
    script.defer = true;

    // Create a global callback function
    window.initGoogleMapCallback = () => {
      initMap();
    };

    document.head.appendChild(script);

    return () => {
      // Clean up global callback
      window.initGoogleMapCallback = null;
    };
  }, [apiKey]);

  // Initialize the map
  const initMap = () => {
    if (!mapRef.current) return;

    // Default center (center of India)
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 5,
      center: defaultCenter,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      },
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    setMap(newMap);
    setIsLoading(false);

    // Request user location after map is initialized
    requestUserLocation();
  };

  // Request user location
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(userLocation);

          // If map exists, set center and add marker
          if (map) {
            map.setCenter(userLocation);
            map.setZoom(10);

            // Add marker for user's location
            const userMarker = new window.google.maps.Marker({
              position: userLocation,
              map: map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
              title: "Your Location",
              zIndex: 1000, // Make sure user marker is on top
            });

            // Create info window for user marker
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px; text-align: center;">
                  <h3 style="margin: 0 0 5px; font-weight: bold;">Your Location</h3>
                </div>
              `,
            });

            userMarker.addListener("click", () => {
              infoWindow.open(map, userMarker);
            });

            // Store in markers ref
            markersRef.current.push(userMarker);
          }

          // Call the callback with location
          if (onLocationFound) {
            onLocationFound(userLocation);
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
          setLocationPermissionDenied(true);
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      setLocationPermissionDenied(true);
    }
  };

  // Clear all routes and markers
  const clearMapElements = () => {
    // Clear direction renderers
    directionsRenderers.forEach((renderer) => {
      renderer.setMap(null);
    });
    setDirectionsRenderers([]);

    // Clear markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // Keep user location marker if it exists
    if (currentLocation && map) {
      const userMarker = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Your Location",
        zIndex: 1000,
      });

      markersRef.current.push(userMarker);
    }
  };

  // Add markers and routes for trips
  useEffect(() => {
    if (!map || !trips || trips.length === 0) return;

    // Clear existing markers and routes
    clearMapElements();

    // Process each trip
    trips.forEach((trip) => {
      const hasOriginCoords = trip.departureLocationDetails?.coordinates;
      const hasDestinationCoords = trip.destinationLocationDetails?.coordinates;

      // Skip if we don't have coordinate data
      if (!hasOriginCoords || !hasDestinationCoords) return;

      const originCoords = {
        lat: trip.departureLocationDetails.coordinates.lat,
        lng: trip.departureLocationDetails.coordinates.lng,
      };

      const destinationCoords = {
        lat: trip.destinationLocationDetails.coordinates.lat,
        lng: trip.destinationLocationDetails.coordinates.lng,
      };

      // Add marker for departure location
      const departureMarker = new window.google.maps.Marker({
        position: originCoords,
        map: map,
        title: `From: ${trip.departureLocation}`,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        },
      });

      // Add info window for departure
      const departureInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 5px; font-weight: bold;">${
              trip.departureLocation
            }</h3>
            <p style="margin: 0 0 5px;">To: ${trip.destinationLocation}</p>
            <p style="margin: 0 0 5px;">Date: ${formatDate(
              trip.departureDate
            )}</p>
            <p style="margin: 0;">Price: ₹${trip.price}</p>
          </div>
        `,
      });

      departureMarker.addListener("click", () => {
        departureInfoWindow.open(map, departureMarker);
      });

      // Add marker for destination location
      const destinationMarker = new window.google.maps.Marker({
        position: destinationCoords,
        map: map,
        title: `To: ${trip.destinationLocation}`,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Add info window for destination
      const destinationInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 5px; font-weight: bold;">${
              trip.destinationLocation
            }</h3>
            <p style="margin: 0 0 5px;">From: ${trip.departureLocation}</p>
            <p style="margin: 0 0 5px;">Date: ${formatDate(
              trip.departureDate
            )}</p>
            <p style="margin: 0;">Price: ₹${trip.price}</p>
          </div>
        `,
      });

      destinationMarker.addListener("click", () => {
        destinationInfoWindow.open(map, destinationMarker);
      });

      // Store markers in ref
      markersRef.current.push(departureMarker, destinationMarker);

      // Draw route between departure and destination
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 4,
          strokeOpacity: 0.7,
        },
      });

      directionsService.route(
        {
          origin: originCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(response);
            setDirectionsRenderers((prev) => [...prev, directionsRenderer]);
          }
        }
      );
    });

    // Auto-fit bounds if we have trips
    if (trips.length > 0 && markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });

      map.fitBounds(bounds);

      // If the zoom is too close, set a max zoom level
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [trips, map]);

  // Helper function for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If location permission is denied, show request
  const handleRequestLocation = () => {
    requestUserLocation();
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {locationPermissionDenied && (
        <div className="absolute top-4 left-0 right-0 mx-auto max-w-sm bg-white rounded-lg shadow-lg p-4 z-20">
          <div className="flex items-start">
            <div className="flex-shrink-0 p-1">
              <MapPin className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Location access needed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please enable location services to see your position on the map.
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Navigation className="h-3.5 w-3.5 mr-1" />
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGoogleMap;
