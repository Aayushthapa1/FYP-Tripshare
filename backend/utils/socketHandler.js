

const socketIO = require("socket.io")

function setupSocketServer(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Store active connections
  const activeDrivers = new Map()
  const activePassengers = new Map()
  const activeRides = new Map()

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    const userId = socket.handshake.query.userId
    const userType = socket.handshake.query.userType || "passenger"

    // Store user connection
    if (userType === "driver") {
      activeDrivers.set(userId, { socketId: socket.id, status: "available" })
    } else {
      activePassengers.set(userId, { socketId: socket.id })
    }

    // Update passenger location
    socket.on("updatePassengerLocation", (data) => {
      const { passengerId, location, lookingForRide } = data

      if (lookingForRide) {
        // Find nearby drivers and emit to passenger
        const nearbyDrivers = findNearbyDrivers(location)
        socket.emit("nearbyDrivers", nearbyDrivers)
      }
    })

    // Update driver location
    socket.on("updateDriverLocation", (data) => {
      const { driverId, location, status } = data

      if (activeDrivers.has(driverId)) {
        const driverInfo = activeDrivers.get(driverId)
        driverInfo.location = location
        driverInfo.status = status || "available"
        activeDrivers.set(driverId, driverInfo)
      }

      // If driver is on a ride, update passenger about driver's location
      if (status === "on_ride") {
        const rideId = data.rideId
        if (activeRides.has(rideId)) {
          const ride = activeRides.get(rideId)
          const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId

          if (passengerSocketId) {
            io.to(passengerSocketId).emit("driverLocationUpdate", location)
          }
        }
      }
    })

    // Find drivers for a ride
    socket.on("findDrivers", (data) => {
      const { passengerId, pickupLocation, vehicleType } = data

      // Find nearby drivers based on location and vehicle type
      const nearbyDrivers = findNearbyDrivers(pickupLocation, vehicleType)
      socket.emit("nearbyDrivers", nearbyDrivers)
    })

    // Request a ride
    socket.on("requestRide", (rideData) => {
      const { passengerId, pickupLocation, dropoffLocation, vehicleType } = rideData

      // Generate a unique ride ID
      const rideId = generateRideId()

      // Store ride information
      activeRides.set(rideId, {
        ...rideData,
        status: "searching",
        createdAt: new Date().toISOString(),
      })

      // Find nearby drivers
      const nearbyDrivers = findNearbyDrivers(pickupLocation, vehicleType)

      // Notify drivers about the ride request
      nearbyDrivers.forEach((driver) => {
        const driverSocketId = activeDrivers.get(driver.driverId)?.socketId
        if (driverSocketId) {
          io.to(driverSocketId).emit("rideRequest", {
            rideId,
            passengerId,
            pickupLocation,
            dropoffLocation,
            fare: rideData.fare,
          })
        }
      })

      // Update passenger about ride status
      socket.emit("rideStatusUpdate", {
        rideId,
        status: "searching",
        message: "Looking for drivers",
      })
    })

    // Driver accepts a ride
    socket.on("acceptRide", (data) => {
      const { rideId, driverId, driverName, estimatedArrival } = data

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId)
        ride.status = "accepted"
        ride.driverId = driverId
        ride.driverName = driverName
        ride.estimatedArrival = estimatedArrival
        activeRides.set(rideId, ride)

        // Update passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "accepted",
            driverInfo: {
              driverId,
              name: driverName,
              // Add more driver info here
            },
            estimatedArrival,
          })
        }
      }
    })

    // Driver arrives at pickup
    socket.on("arrivedAtPickup", (data) => {
      const { rideId } = data

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId)
        ride.status = "arrived"
        activeRides.set(rideId, ride)

        // Update passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "arrived",
            message: "Driver has arrived at pickup location",
          })
        }
      }
    })

    // Ride started
    socket.on("startRide", (data) => {
      const { rideId } = data

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId)
        ride.status = "in_progress"
        ride.startTime = new Date().toISOString()
        activeRides.set(rideId, ride)

        // Update passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "in_progress",
            message: "Your ride has started",
          })
        }
      }
    })

    // Ride completed
    socket.on("completeRide", (data) => {
      const { rideId, finalFare } = data

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId)
        ride.status = "completed"
        ride.endTime = new Date().toISOString()
        ride.finalFare = finalFare || ride.fare
        activeRides.set(rideId, ride)

        // Update passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "completed",
            finalFare,
            message: "Your ride has been completed",
          })
        }
      }
    })

    // Cancel ride
    socket.on("cancelRide", (data) => {
      const { rideId, passengerId } = data

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId)
        ride.status = "cancelled"
        ride.cancelledBy = passengerId ? "passenger" : "driver"
        ride.cancelTime = new Date().toISOString()
        activeRides.set(rideId, ride)

        // Notify passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "cancelled",
            message: "Your ride has been cancelled",
          })
        }

        // Notify driver
        if (ride.driverId) {
          const driverSocketId = activeDrivers.get(ride.driverId)?.socketId
          if (driverSocketId) {
            io.to(driverSocketId).emit("rideStatusUpdate", {
              rideId,
              status: "cancelled",
              message: "Ride has been cancelled",
            })
          }
        }
      }
    })

    // Send message
    socket.on("sendMessage", (data) => {
      const { senderId, receiverId, text, timestamp } = data

      // Find receiver's socket
      let receiverSocketId
      if (activeDrivers.has(receiverId)) {
        receiverSocketId = activeDrivers.get(receiverId).socketId
      } else if (activePassengers.has(receiverId)) {
        receiverSocketId = activePassengers.get(receiverId).socketId
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          senderId,
          text,
          timestamp,
        })
      }
    })

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      // Remove from active connections
      if (userType === "driver") {
        for (const [id, data] of activeDrivers.entries()) {
          if (data.socketId === socket.id) {
            activeDrivers.delete(id)
            break
          }
        }
      } else {
        for (const [id, data] of activePassengers.entries()) {
          if (data.socketId === socket.id) {
            activePassengers.delete(id)
            break
          }
        }
      }
    })
  })

  // Helper function to find nearby drivers
  function findNearbyDrivers(location, vehicleType = null) {
    const nearbyDrivers = []
    const MAX_DISTANCE = 5 // km

    for (const [driverId, driverData] of activeDrivers.entries()) {
      if (driverData.status !== "available" || !driverData.location) continue

      // Skip if vehicle type doesn't match
      if (vehicleType && driverData.vehicleType !== vehicleType) continue

      // Calculate distance between driver and passenger
      const distance = calculateDistance(location.lat, location.lng, driverData.location.lat, driverData.location.lng)

      if (distance <= MAX_DISTANCE) {
        nearbyDrivers.push({
          driverId,
          name: driverData.name || `Driver ${driverId.substring(0, 5)}`,
          vehicleType: driverData.vehicleType || "Car",
          location: driverData.location,
          distance,
        })
      }
    }

    // Sort by distance
    return nearbyDrivers.sort((a, b) => a.distance - b.distance)
  }

  // Helper function to calculate distance between two points
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  // Generate a unique ride ID
  function generateRideId() {
    return "ride_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
  }

  return io
}

module.exports = setupSocketServer

