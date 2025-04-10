import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import { Car, Bike, AlertCircle } from "lucide-react";

/**
 * Enhanced map component with smooth animations and real-time driver location tracking
 */
const EnhancedMapSection = memo(
  ({
    pickupLocation,
    dropoffLocation,
    directions,
    onMapLoad,
    mapCenter,
    driverLocation,
    driverInfo,
    isRideAccepted,
    estimatedArrival,
    rideStatus = "requested",
    vehicleType = "Car",
  }) => {
    const [showDriverInfo, setShowDriverInfo] = useState(false);
    const [currentDriverLocation, setCurrentDriverLocation] =
      useState(driverLocation);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showRouteLine, setShowRouteLine] = useState(true);
    const [routePath, setRoutePath] = useState([]);
    const [remainingPath, setRemainingPath] = useState([]);
    const [driverPositionOnPath, setDriverPositionOnPath] = useState(0);
    const [simulationSpeed, setSimulationSpeed] = useState(1); // For testing only
    const [reachedPickup, setReachedPickup] = useState(false);
    const [reachedDestination, setReachedDestination] = useState(false);
    const [driverToPickupDirections, setDriverToPickupDirections] =
      useState(null);

    const mapRef = useRef(null);
    const animationFrameRef = useRef(null);
    const pathAnimationRef = useRef(null);

    const mapContainerStyle = {
      width: "100%",
      height: "300px",
      borderRadius: "12px",
    };

    const mapOptions = {
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: "cooperative",
      clickableIcons: false,
    };

    // Handle map load - store ref
    const handleMapLoad = (map) => {
      mapRef.current = map;
      if (onMapLoad) onMapLoad(map);
    };

    // Calculate center of map based on all points
    useEffect(() => {
      if (!mapRef.current) return;

      // Create bounds only if we have multiple points to show
      if (
        (pickupLocation && dropoffLocation) ||
        (pickupLocation && currentDriverLocation) ||
        (dropoffLocation && currentDriverLocation)
      ) {
        const bounds = new window.google.maps.LatLngBounds();

        if (pickupLocation) {
          bounds.extend(
            new window.google.maps.LatLng(
              pickupLocation.lat,
              pickupLocation.lng
            )
          );
        }

        if (dropoffLocation) {
          bounds.extend(
            new window.google.maps.LatLng(
              dropoffLocation.lat,
              dropoffLocation.lng
            )
          );
        }

        if (currentDriverLocation) {
          bounds.extend(
            new window.google.maps.LatLng(
              currentDriverLocation.lat,
              currentDriverLocation.lng
            )
          );
        }

        // Fit map to show all points
        mapRef.current.fitBounds(bounds);

        // Don't zoom in too far
        const zoom = mapRef.current.getZoom();
        if (zoom > 16) {
          mapRef.current.setZoom(16);
        }
      }
    }, [pickupLocation, dropoffLocation, currentDriverLocation]);

    // Get driver-to-pickup directions when driver location changes
    useEffect(() => {
      // Only calculate directions if we have both driver and pickup locations during "accepted" status
      if (
        !driverLocation ||
        !pickupLocation ||
        rideStatus !== "accepted" ||
        !window.google?.maps?.DirectionsService
      )
        return;

      const fetchDirections = async () => {
        try {
          const directionsService = new window.google.maps.DirectionsService();

          const result = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: driverLocation,
                destination: pickupLocation,
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (response, status) => {
                if (status === "OK") {
                  resolve(response);
                } else {
                  reject(new Error(`Directions request failed: ${status}`));
                }
              }
            );
          });

          setDriverToPickupDirections(result);

          // Extract route path for animation
          if (result.routes && result.routes[0]) {
            const route = result.routes[0];
            const points = [];

            route.legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                if (step.path) {
                  points.push(
                    ...step.path.map((point) => ({
                      lat: point.lat(),
                      lng: point.lng(),
                    }))
                  );
                }
              });
            });

            setRoutePath(points);
            setRemainingPath(points);
          }
        } catch (error) {
          console.error("Error fetching driver-to-pickup directions:", error);
        }
      };

      fetchDirections();
    }, [driverLocation, pickupLocation, rideStatus]);

    // Extract route path from directions
    useEffect(() => {
      if (!directions || !directions.routes || !directions.routes[0]) return;

      const route = directions.routes[0];
      const points = [];

      // Extract all points from the route
      route.legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          if (step.path) {
            points.push(
              ...step.path.map((point) => ({
                lat: point.lat(),
                lng: point.lng(),
              }))
            );
          }
        });
      });

      if (rideStatus === "picked up") {
        setRoutePath(points);
        setRemainingPath(points);
        setDriverPositionOnPath(0);

        // Start the animation for ride in progress
        if (points.length > 0) {
          startPathAnimation();
        }
      }
    }, [directions, rideStatus]);

    // Animate driver movement along path
    const startPathAnimation = useCallback(() => {
      if (pathAnimationRef.current) {
        cancelAnimationFrame(pathAnimationRef.current);
      }

      if (remainingPath.length === 0) return;

      let pathIndex = driverPositionOnPath;
      const animatePath = () => {
        if (pathIndex < remainingPath.length) {
          setCurrentDriverLocation(remainingPath[pathIndex]);
          pathIndex += 1 * simulationSpeed;
          setDriverPositionOnPath(pathIndex);

          // Check if reached pickup (first 10% of path)
          if (!reachedPickup && pathIndex > remainingPath.length * 0.1) {
            setReachedPickup(true);
          }

          // Check if reached destination (last 5% of path)
          if (!reachedDestination && pathIndex > remainingPath.length * 0.95) {
            setReachedDestination(true);
          }

          pathAnimationRef.current = requestAnimationFrame(animatePath);
        } else {
          // Reached end of path
          if (remainingPath.length > 0) {
            setCurrentDriverLocation(remainingPath[remainingPath.length - 1]);
          }
          setReachedDestination(true);
        }
      };

      pathAnimationRef.current = requestAnimationFrame(animatePath);
    }, [
      remainingPath,
      driverPositionOnPath,
      simulationSpeed,
      reachedPickup,
      reachedDestination,
    ]);

    // Animate driver movement when location changes
    useEffect(() => {
      if (!isRideAccepted || !driverLocation || !pickupLocation || isAnimating)
        return;

      // For real driver updates (not path animation)
      if (rideStatus !== "picked up") {
        // Start position is current driver location or new driver location
        const startLat = currentDriverLocation?.lat || driverLocation.lat;
        const startLng = currentDriverLocation?.lng || driverLocation.lng;

        // End position is new driver location
        const endLat = driverLocation.lat;
        const endLng = driverLocation.lng;

        // Don't animate if it's the initial setting or same location
        if (
          !currentDriverLocation ||
          (startLat === endLat && startLng === endLng)
        ) {
          setCurrentDriverLocation(driverLocation);
          return;
        }

        // Calculate distance
        if (window.google?.maps?.geometry?.spherical) {
          const distance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              new window.google.maps.LatLng(startLat, startLng),
              new window.google.maps.LatLng(endLat, endLng)
            );

          // If distance is very small, don't animate
          if (distance < 10) {
            setCurrentDriverLocation(driverLocation);
            return;
          }
        }

        // Set animating flag
        setIsAnimating(true);

        // Calculate steps for animation (more steps = smoother animation)
        const steps = 100;
        const latStep = (endLat - startLat) / steps;
        const lngStep = (endLng - startLng) / steps;

        let step = 0;
        let animLat = startLat;
        let animLng = startLng;

        const animate = () => {
          step++;
          if (step <= steps) {
            // Update driver position
            animLat += latStep;
            animLng += lngStep;

            setCurrentDriverLocation({
              lat: animLat,
              lng: animLng,
            });

            // Continue animation
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            // Animation complete
            setCurrentDriverLocation(driverLocation);
            setIsAnimating(false);
          }
        };

        // Start animation
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      // Cleanup animation on unmount or when dependencies change
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          setIsAnimating(false);
        }
      };
    }, [
      driverLocation,
      pickupLocation,
      isRideAccepted,
      currentDriverLocation,
      isAnimating,
      rideStatus,
    ]);

    // Start path animation when ride status changes to "picked up"
    useEffect(() => {
      if (
        isRideAccepted &&
        rideStatus === "picked up" &&
        remainingPath.length > 0
      ) {
        startPathAnimation();
      }

      return () => {
        if (pathAnimationRef.current) {
          cancelAnimationFrame(pathAnimationRef.current);
        }
      };
    }, [isRideAccepted, rideStatus, remainingPath, startPathAnimation]);

    // Create custom driver icon based on vehicle type
    const getDriverIcon = () => {
      const vehicleIcon = (
        vehicleType ||
        driverInfo?.vehicleType ||
        "Car"
      ).toLowerCase();

      let iconUrl;

      if (vehicleIcon === "bike" || vehicleIcon === "motorcycle") {
        iconUrl = "https://maps.google.com/mapfiles/ms/icons/motorcycling.png";
      } else if (vehicleIcon === "electric") {
        iconUrl = "https://maps.google.com/mapfiles/ms/icons/cabs.png";
      } else {
        // Default to car
        iconUrl = "https://maps.google.com/mapfiles/ms/icons/cabs.png";
      }

      return {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
        // Add animation for better visibility
        animation: window.google.maps.Animation.DROP,
      };
    };

    return (
      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onLoad={handleMapLoad}
          options={mapOptions}
        >
          {/* Pickup Location Marker */}
          {pickupLocation && (
            <Marker
              position={pickupLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              title="Pickup Location"
              onClick={() => setShowDriverInfo(false)}
            />
          )}

          {/* Dropoff Location Marker */}
          {dropoffLocation && (
            <Marker
              position={dropoffLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              title="Dropoff Location"
              onClick={() => setShowDriverInfo(false)}
            />
          )}

          {/* Driver Marker - shown when ride is accepted */}
          {isRideAccepted && currentDriverLocation && (
            <Marker
              position={currentDriverLocation}
              icon={getDriverIcon()}
              onClick={() => setShowDriverInfo(true)}
              title={driverInfo?.name || "Your Driver"}
            />
          )}

          {/* Driver Info Window */}
          {isRideAccepted && currentDriverLocation && showDriverInfo && (
            <InfoWindow
              position={currentDriverLocation}
              onCloseClick={() => setShowDriverInfo(false)}
            >
              <div className="p-2">
                <h3 className="font-medium">
                  {driverInfo?.name || "Your Driver"}
                </h3>
                <p className="text-sm text-gray-600">
                  {driverInfo?.vehicleType || vehicleType || "Vehicle"} •{" "}
                  {driverInfo?.licensePlate || ""}
                </p>
                <p className="text-xs mt-1">
                  ETA: {estimatedArrival || "10-15 mins"}
                </p>
              </div>
            </InfoWindow>
          )}

          {/* Driver to Pickup Route for "accepted" status */}
          {rideStatus === "accepted" && driverToPickupDirections && (
            <DirectionsRenderer
              directions={driverToPickupDirections}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#4285F4",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {/* Pickup to Dropoff Route for "picked up" status */}
          {rideStatus === "picked up" && directions && !showRouteLine && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#34A853",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                },
              }}
            />
          )}

          {/* Custom polyline for route with animation */}
          {showRouteLine &&
            routePath.length > 0 &&
            rideStatus === "picked up" && (
              <Polyline
                path={routePath}
                options={{
                  strokeColor: "#4285F4",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                }}
              />
            )}

          {/* Show the portion of the route already traveled in a different color */}
          {showRouteLine &&
            rideStatus === "picked up" &&
            driverPositionOnPath > 0 && (
              <Polyline
                path={routePath.slice(0, driverPositionOnPath)}
                options={{
                  strokeColor: "#34A853",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                }}
              />
            )}
        </GoogleMap>

        {/* Status Overlay - Driver approaching */}
        {isRideAccepted &&
          rideStatus === "accepted" &&
          currentDriverLocation && (
            <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-white shadow-lg rounded-lg px-4 py-2 border border-green-100">
              <div className="flex items-center space-x-2">
                {vehicleType?.toLowerCase() === "bike" ? (
                  <Bike className="w-4 h-4 text-blue-500" />
                ) : (
                  <Car className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  Driver on the way • ETA: {estimatedArrival || "10-15 mins"}
                </span>
              </div>
            </div>
          )}

        {/* Status Overlay - On ride */}
        {rideStatus === "picked up" && !reachedDestination && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-white shadow-lg rounded-lg px-4 py-2 border border-yellow-100">
            <div className="flex items-center space-x-2">
              {vehicleType?.toLowerCase() === "bike" ? (
                <Bike className="w-4 h-4 text-yellow-500" />
              ) : (
                <Car className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                On the way to destination
              </span>
            </div>
          </div>
        )}

        {/* Status Overlay - Arrived */}
        {reachedDestination && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-max bg-white shadow-lg rounded-lg px-4 py-2 border border-green-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Arrived at destination
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default EnhancedMapSection;
