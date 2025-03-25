"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { Toaster, toast } from "sonner"
import { FaMapMarkerAlt, FaLocationArrow, FaPhoneAlt, FaStar, FaCarSide } from "react-icons/fa"
import { MdCancel } from "react-icons/md"
import Navbar from "../layout/Navbar"
import Footer from "../layout/Footer"
import socketService from "../socket/socketService"
import { fetchActiveRide } from "../Slices/rideSlice"

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
}

const libraries = ["places", "directions"]

const RideStatus = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})
  const { currentRide } = useSelector((state) => state.ride || {})

  const [rideStatus, setRideStatus] = useState(currentRide?.status || "pending")
  const [driver, setDriver] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [directions, setDirections] = useState(null)
  const [mapCenter, setMapCenter] = useState({
    lat: currentRide?.pickupLocation?.latitude || 27.7172,
    lng: currentRide?.pickupLocation?.longitude || 85.324,
  })
  const [rating, setRating] = useState(0)
  const [showRating, setShowRating] = useState(false)

  const mapRef = useRef(null)
  const directionsServiceRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to view ride status")
      navigate("/login")
      return
    }

    // Fetch active ride when component mounts
    dispatch(fetchActiveRide({ passengerId: user._id }))
      .unwrap()
      .then((response) => {
        if (response && response.data) {
          toast.info("You have an active ride")
          setRideStatus(response.data.status)

          if (response.data.driver) {
            setDriver(response.data.driver)
          }

          // Set map center to pickup location
          setMapCenter({
            lat: response.data.pickupLocation.latitude,
            lng: response.data.pickupLocation.longitude,
          })
        } else {
          toast.info("You don't have any active rides")
        }
      })
      .catch((error) => {
        if (error.status !== 404) {
          toast.error(`Error fetching ride status: ${error.message}`)
        }
      })

    // Connect to socket
    const socket = socketService.connect()

    // Join user room
    socketService.joinRoom(`user-${user._id}`)

    // Listen for ride status updates
    socketService.on("rideStatusUpdate", (data) => {
      setRideStatus(data.status)

      if (data.driver) {
        setDriver(data.driver)
      }

      // Show appropriate toast based on status
      if (data.status === "accepted") {
        toast.success(`Driver ${data.driver.name} has accepted your ride!`)
      } else if (data.status === "arrived") {
        toast.success("Your driver has arrived at the pickup location!")
      } else if (data.status === "started") {
        toast.info("Your ride has started")
      } else if (data.status === "completed") {
        toast.success("Your ride has been completed!")
        setShowRating(true)
      } else if (data.status === "cancelled") {
        toast.error("Your ride has been cancelled")
      }
    })

    // Listen for driver location updates
    socketService.on("driverLocationUpdate", (location) => {
      setDriverLocation(location)

      // Update directions if driver location changes
      if (directionsServiceRef.current && currentRide) {
        updateDirections(location, currentRide)
      }
    })

    // Cleanup on component unmount
    return () => {
      socketService.off("rideStatusUpdate")
      socketService.off("driverLocationUpdate")
      socketService.leaveRoom(`user-${user._id}`)
    }
  }, [user, navigate, dispatch])

  // Initialize Google Maps services
  const onMapLoad = (map) => {
    mapRef.current = map
    directionsServiceRef.current = new window.google.maps.DirectionsService()

    // If we have a current ride and driver location, update directions
    if (currentRide && driverLocation) {
      updateDirections(driverLocation, currentRide)
    }
  }

  // Update directions based on driver location and ride details
  const updateDirections = (driverLoc, ride) => {
    if (!directionsServiceRef.current) return

    const origin = {
      lat: driverLoc.latitude,
      lng: driverLoc.longitude,
    }

    // If ride is not started yet, driver is heading to pickup
    // Otherwise, driver is heading to dropoff
    const destination =
      rideStatus === "started"
        ? {
            lat: ride.dropoffLocation.latitude,
            lng: ride.dropoffLocation.longitude,
          }
        : {
            lat: ride.pickupLocation.latitude,
            lng: ride.pickupLocation.longitude,
          }

    directionsServiceRef.current.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result)
        } else {
          console.error("Directions request failed:", status)
        }
      },
    )
  }

  // Handle ride cancellation
  const handleCancelRide = () => {
    if (!currentRide) return

    // Confirm cancellation
    if (window.confirm("Are you sure you want to cancel this ride?")) {
      socketService.emit("cancelRide", { rideId: currentRide._id })
      toast.info("Cancelling your ride...")
    }
  }

  // Handle driver rating
  const handleRateDriver = () => {
    if (!currentRide || !driver) return

    socketService.emit("rateDriver", {
      rideId: currentRide._id,
      driverId: driver._id,
      rating,
    })

    toast.success(`You rated ${driver.name} ${rating} stars!`)
    setShowRating(false)
  }

  // Render status badge
  const renderStatusBadge = () => {
    let bgColor = "bg-yellow-100 text-yellow-800"

    if (rideStatus === "accepted" || rideStatus === "arrived") {
      bgColor = "bg-blue-100 text-blue-800"
    } else if (rideStatus === "started") {
      bgColor = "bg-green-100 text-green-800"
    } else if (rideStatus === "completed") {
      bgColor = "bg-green-100 text-green-800"
    } else if (rideStatus === "cancelled") {
      bgColor = "bg-red-100 text-red-800"
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}>
        {rideStatus.charAt(0).toUpperCase() + rideStatus.slice(1)}
      </span>
    )
  }

  // Render driver information
  const renderDriverInfo = () => {
    if (!driver) return null

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <FaCarSide className="text-gray-500" size={24} />
          </div>
          <div className="ml-4">
            <h3 className="font-medium">{driver.name}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <FaStar className="text-yellow-400 mr-1" />
              <span>
                {driver.rating} • {driver.vehicleType}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {driver.vehicleDetails?.model} • {driver.vehicleDetails?.color} • {driver.vehicleDetails?.plateNumber}
            </p>
          </div>
          <a href={`tel:${driver.phone}`} className="ml-auto p-3 bg-primary text-white rounded-full">
            <FaPhoneAlt />
          </a>
        </div>
      </div>
    )
  }

  // Render rating component
  const renderRatingComponent = () => {
    if (!showRating) return null

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="font-medium mb-3">Rate your driver</h3>
        <div className="flex items-center justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="mx-1">
              <FaStar size={32} className={star <= rating ? "text-yellow-400" : "text-gray-300"} />
            </button>
          ))}
        </div>
        <button
          className="w-full py-2 bg-primary text-white rounded-lg"
          onClick={handleRateDriver}
          disabled={rating === 0}
        >
          Submit Rating
        </button>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ride Status</h1>
          {renderStatusBadge()}
        </div>

        {!currentRide ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg text-gray-500 mb-4">You don't have any active rides</p>
            <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={() => navigate("/")}>
              Book a Ride
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""} libraries={libraries}>
                <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={13} onLoad={onMapLoad}>
                  {/* Pickup location marker */}
                  <Marker
                    position={{
                      lat: currentRide.pickupLocation.latitude,
                      lng: currentRide.pickupLocation.longitude,
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                  />

                  {/* Dropoff location marker */}
                  <Marker
                    position={{
                      lat: currentRide.dropoffLocation.latitude,
                      lng: currentRide.dropoffLocation.longitude,
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                  />

                  {/* Driver location marker */}
                  {driverLocation && (
                    <Marker
                      position={{
                        lat: driverLocation.latitude,
                        lng: driverLocation.longitude,
                      }}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                    />
                  )}

                  {/* Directions */}
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </LoadScript>

              <div className="p-4">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaMapMarkerAlt className="text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="font-medium">{currentRide.pickupLocationName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaLocationArrow className="text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Dropoff</p>
                      <p className="font-medium">{currentRide.dropoffLocationName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium">{currentRide.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Time</p>
                    <p className="font-medium">{currentRide.estimatedTime} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fare</p>
                    <p className="font-medium">NPR {currentRide.fare}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium">{currentRide.vehicleType}</p>
                  </div>
                </div>

                {/* Cancel button - only show if ride is not completed or cancelled */}
                {rideStatus !== "completed" && rideStatus !== "cancelled" && (
                  <button
                    className="w-full py-2 bg-red-500 text-white rounded-lg flex items-center justify-center"
                    onClick={handleCancelRide}
                  >
                    <MdCancel className="mr-2" />
                    Cancel Ride
                  </button>
                )}
              </div>
            </div>

            {/* Driver information */}
            {driver && renderDriverInfo()}

            {/* Rating component */}
            {renderRatingComponent()}
          </>
        )}
      </div>
      <Footer />
    </>
  )
}

export default RideStatus

