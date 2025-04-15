// useGoogleMapsHooks.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook to load the Google Maps script.
 * @param {string} apiKey - Your Google Maps API key
 * @param {Array} libraries - Additional libraries to load (e.g., ['places', 'geometry'])
 * @returns {{ isLoaded: boolean, error: Error | null }}
 */
export const useGoogleMapsScript = (apiKey, libraries = ['places', 'geometry']) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If Google Maps is already loaded, just mark as loaded.
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if the script is already in the DOM.
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      return;
    }

    // Create a unique callback name for Google Maps to call once it’s loaded.
    const callbackName = `initGoogleMapsCallback_${Date.now()}`;

    // Create a script element.
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    // Attach the callback to the window object.
    window[callbackName] = () => {
      setIsLoaded(true);
      delete window[callbackName];
    };

    // Handle script loading errors.
    script.onerror = () => {
      setError(new Error('Failed to load Google Maps script'));
      delete window[callbackName];
    };

    // Append the script to the document head.
    document.head.appendChild(script);

    // Cleanup on unmount.
    return () => {
      if (document.getElementById('google-maps-script') === script) {
        document.head.removeChild(script);
      }
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
  }, [apiKey, libraries]);

  return { isLoaded, error };
};

/**
 * Hook to initialize a Google Map instance.
 * @param {Object} options - Map options
 * @param {boolean} isScriptLoaded - Whether the Google Maps script is loaded
 * @returns {{ map: Object | null, mapRef: React.RefObject, error: Error | null }}
 */
export const useGoogleMap = (options = {}, isScriptLoaded = false) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapRef.current || !isScriptLoaded || !window.google || !window.google.maps) {
      return;
    }

    if (map) {
      return;
    }

    try {
      const defaultOptions = {
        zoom: 7,
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        ...defaultOptions,
        ...options,
      });
      setMap(mapInstance);
    } catch (err) {
      console.error('Error initializing Google Map:', err);
      setError(new Error('Failed to initialize Google Maps'));
    }

    // Cleanup is not strictly needed for the map instance,
    // but we reset state to null if this component unmounts.
    return () => {
      setMap(null);
    };
  }, [isScriptLoaded, map, options]);

  return { map, mapRef, error };
};

/**
 * Hook to calculate and display driving directions between two points.
 * @param {Object} map - Google Map instance
 * @param {Object} origin - Origin coordinates { lat, lng }
 * @param {Object} destination - Destination coordinates { lat, lng }
 * @param {Object} options - DirectionsRenderer options
 * @returns {{ directionsRenderer: Object | null, routeInfo: Object | null, error: Error | null }}
 */
export const useDirections = (map, origin, destination, options = {}) => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!map || !origin || !destination) {
      // If map or coordinates are missing, clear any existing directions.
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      setRouteInfo(null);
      return;
    }

    // Initialize DirectionsRenderer if it's not already.
    if (!directionsRendererRef.current) {
      const defaultOptions = {
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4ade80', // green-400
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      };

      try {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map,
          ...defaultOptions,
          ...options,
        });
      } catch (err) {
        console.error('Error creating DirectionsRenderer:', err);
        setError(new Error('Failed to initialize directions renderer'));
        return;
      }
    } else {
      directionsRendererRef.current.setMap(map);
    }

    // Calculate the route.
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererRef.current.setDirections(result);

          // Extract route details.
          if (result.routes && result.routes.length > 0) {
            const route = result.routes[0];
            if (route.legs && route.legs.length > 0) {
              const leg = route.legs[0];
              setRouteInfo({
                distance: leg.distance.text,
                duration: leg.duration.text,
                bounds: route.bounds,
              });
            }
          }
          setError(null);
        } else {
          console.error('Directions request failed with status:', status);
          const errorMessage =
            status === window.google.maps.DirectionsStatus.ZERO_RESULTS
              ? 'No driving route found between these locations'
              : `Directions request failed: ${status}`;

          setError(new Error(errorMessage));

          // Clear the previously rendered route (if any).
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({ routes: [] });
          }
          setRouteInfo(null);
        }
      }
    );

    // Cleanup on unmount or when parameters change.
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [map, origin, destination, options]);

  return {
    directionsRenderer: directionsRendererRef.current,
    routeInfo,
    error,
  };
};

/**
 * Hook to get the user's current location via the Geolocation API.
 * @returns {{ location: Object | null, isLoading: boolean, error: Error | null, requestPermission: Function }}
 */
export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = () => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(userLocation);
        setIsLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError(
          new Error(
            err.code === 1
              ? 'Location permission denied'
              : 'Failed to get your location'
          )
        );
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Optionally request location immediately on load:
  useEffect(() => {
    requestPermission();
  }, []);

  return { location, isLoading, error, requestPermission };
};
