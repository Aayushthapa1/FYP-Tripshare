import Ride from "../models/handleRideModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

import { getIO } from "../utils/socketUtil.js";
const io = getIO();

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const calculateFare = (distance, vehicleType) => {
  // Validate distance
  if (typeof distance !== "number" || distance < 0) {
    throw new Error("Invalid distance value");
  }

  // Set appropriate rates based on vehicle type
  let baseFare = 0;
  let ratePerKm = 0;

  switch (vehicleType) {
    case "Bike":
      baseFare = 50; // NPR
      ratePerKm = 15;
      break;
    case "Car":
      baseFare = 100;
      ratePerKm = 30;
      break;
    case "Electric":
      baseFare = 80;
      ratePerKm = 25;
      break;
    default:
      throw new Error(`Invalid vehicle type: ${vehicleType}`);
  }

  return Math.round(baseFare + distance * ratePerKm);
};

/**
 * POST A RIDE (Driver announces availability)
 */
export const postRide = async (req, res) => {
  try {
    const { driverId, pickupLocation, dropoffLocation } = req.body;

    // Validate required fields
    if (!driverId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(driverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid driver ID format",
      });
    }

    // Validate location format
    if (
      !pickupLocation.latitude ||
      !pickupLocation.longitude ||
      !dropoffLocation.latitude ||
      !dropoffLocation.longitude
    ) {
      return res.status(400).json({
        success: false,
        message: "Location must include latitude and longitude",
      });
    }

    // Check if driver exists
    const driverExists = await User.findById(driverId);
    if (!driverExists) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const ride = await Ride.create({
      driverId,
      pickupLocation,
      dropoffLocation,
      status: "available",
    });

    // Get driver details to include in socket event
    const driver = await User.findById(
      driverId,
      "fullName username phone vehicleType numberPlate"
    );

    // Broadcast ride posted event with enhanced data
    if (io) {
      io.emit("ride_posted", {
        rideId: ride._id,
        driverId,
        driverInfo: {
          name: driver.fullName || driver.username || "Driver",
          vehicleType: driver.vehicleType || "Car",
          licensePlate: driver.numberPlate || "",
        },
        pickupLocation: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude,
        },
        dropoffLocation: {
          lat: dropoffLocation.latitude,
          lng: dropoffLocation.longitude,
        },
        message: "A new ride has been posted",
        timestamp: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    console.error("Post ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to post ride",
      error: error.message,
    });
  }
};

/**
 * REQUEST A RIDE (Passenger requests a ride)
 */
export const requestRide = async (req, res) => {
  try {
    const {
      passengerId,
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName,
      vehicleType,
      distance,
      estimatedTime,
      paymentMethod = "cash",
    } = req.body;

    // Essential validation with fallbacks
    if (!passengerId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({
        success: false,
        message:
          "Missing essential fields: passengerId, pickupLocation, and dropoffLocation are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(passengerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid passenger ID format",
      });
    }

    // Validate location format
    if (
      !pickupLocation.latitude ||
      !pickupLocation.longitude ||
      !dropoffLocation.latitude ||
      !dropoffLocation.longitude
    ) {
      return res.status(400).json({
        success: false,
        message: "Location must include latitude and longitude",
      });
    }

    // Validate with sensible defaults
    const validVehicleType = ["Bike", "Car", "Electric"].includes(vehicleType)
      ? vehicleType
      : "Car"; // Default to Car if not provided or invalid

    const validDistance =
      typeof distance === "number" && distance >= 0 ? distance : 5; // Default to 5km

    const validEstimatedTime =
      typeof estimatedTime === "number" && estimatedTime >= 0
        ? estimatedTime
        : 15; // Default to 15 mins

    // Use provided location names or defaults
    const validPickupLocationName = pickupLocationName || "Unknown location";
    const validDropoffLocationName =
      dropoffLocationName || "Unknown destination";

    // Validate payment method
    if (paymentMethod && !["cash", "card", "wallet"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Must be cash, card, or wallet",
      });
    }

    // Check if passenger exists
    const passengerExists = await User.findById(passengerId);
    if (!passengerExists) {
      return res.status(404).json({
        success: false,
        message: "Passenger not found",
      });
    }

    // Check if passenger already has an active ride
    const activeRide = await Ride.findOne({
      passengerId,
      status: { $in: ["requested", "accepted", "picked up"] },
    });

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: "Passenger already has an active ride",
      });
    }

    // Calculate fare
    let fare;
    try {
      fare = calculateFare(validDistance, validVehicleType);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Create the ride in the database
    const ride = await Ride.create({
      passengerId,
      pickupLocation,
      dropoffLocation,
      pickupLocationName: validPickupLocationName,
      dropoffLocationName: validDropoffLocationName,
      vehicleType: validVehicleType,
      distance: validDistance,
      estimatedTime: validEstimatedTime,
      fare,
      paymentMethod,
      status: "requested",
    });

    // Get passenger details
    const passenger = await User.findById(
      passengerId,
      "fullName username phone"
    );

    // Emit socket event with complete ride data
    if (io) {
      const eventData = {
        rideId: ride._id,
        passengerId,
        passengerName:
          passenger?.fullName || passenger?.username || "Passenger",
        passengerPhone: passenger?.phone || "",
        pickupLocation: {
          lat: parseFloat(pickupLocation.latitude),
          lng: parseFloat(pickupLocation.longitude),
        },
        dropoffLocation: {
          lat: parseFloat(dropoffLocation.latitude),
          lng: parseFloat(dropoffLocation.longitude),
        },
        pickupLocationName: validPickupLocationName,
        dropoffLocationName: validDropoffLocationName,
        vehicleType: validVehicleType,
        distance: validDistance,
        estimatedTime: validEstimatedTime,
        fare,
        paymentMethod,
        timestamp: new Date(),
      };

      // Emit to both general and driver-specific channels
      io.emit("ride_requested", eventData);
      io.emit("driver_ride_request", eventData); // Specific event for drivers
    }

    return res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    console.error("Request ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to request ride",
      error: error.message,
    });
  }
};

/**
 * UPDATE RIDE STATUS
 */
export const updateRideStatus = async (req, res) => {
  try {
    const { rideId, status, driverId, fare, cancelReason } = req.body;

    // Validate required fields
    if (!rideId || !status) {
      return res.status(400).json({
        success: false,
        message: "Ride ID and status are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID format",
      });
    }

    // Validate status
    const validStatuses = [
      "requested",
      "accepted",
      "picked up",
      "completed",
      "canceled",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate fare if provided
    if (fare !== undefined && (typeof fare !== "number" || fare < 0)) {
      return res.status(400).json({
        success: false,
        message: "Fare must be a positive number",
      });
    }

    // Require cancel reason if status is canceled or rejected
    if ((status === "canceled" || status === "rejected") && !cancelReason) {
      return res.status(400).json({
        success: false,
        message: "Cancel reason is required when canceling or rejecting a ride",
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Validate status transition
    const validTransitions = {
      requested: ["accepted", "rejected", "canceled"],
      accepted: ["picked up", "canceled"],
      "picked up": ["completed", "canceled"],
      completed: [],
      canceled: [],
      rejected: [],
    };

    if (
      !validTransitions[ride.status].includes(status) &&
      ride.status !== status
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${ride.status} to ${status}`,
      });
    }

    // Save the previous status for event tracking
    const previousStatus = ride.status;

    // Update ride
    ride.status = status;

    // Update driver ID if provided and status is being changed to accepted
    if (driverId && status === "accepted" && isValidObjectId(driverId)) {
      ride.driverId = driverId;
    }

    // Update fare if provided
    if (fare !== undefined) {
      ride.fare = fare;
    }

    // Add cancel reason if provided
    if (cancelReason) {
      ride.cancelReason = cancelReason;
    }

    // If status is completed, calculate final fare if not already set
    if (status === "completed" && !ride.fare) {
      try {
        ride.fare = calculateFare(ride.distance, ride.vehicleType);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    await ride.save();

    // Populate ride with passenger and driver details for the event
    const updatedRide = await Ride.findById(rideId)
      .populate("passengerId", "fullName username phone")
      .populate("driverId", "fullName username phone vehicleType numberPlate");

    // Get passenger ID for notification
    const passengerId = updatedRide.passengerId
      ? typeof updatedRide.passengerId === "object"
        ? updatedRide.passengerId._id
        : updatedRide.passengerId
      : null;

    // Get driver ID for notification
    const driverIdForNotification = updatedRide.driverId
      ? typeof updatedRide.driverId === "object"
        ? updatedRide.driverId._id
        : updatedRide.driverId
      : null;

    // Build complete notification data
    const notificationData = {
      rideId,
      previousStatus,
      newStatus: status,
      passengerId: passengerId,
      driverId: driverIdForNotification,
      cancelReason: cancelReason || null,
      fare: updatedRide.fare,
      pickupLocationName: updatedRide.pickupLocationName || "Unknown location",
      dropoffLocationName:
        updatedRide.dropoffLocationName || "Unknown destination",
      message: `Ride status updated to ${status}`,
      timestamp: new Date(),
    };

    // Emit appropriate socket events based on the status
    if (io) {
      // Always emit the general status update
      io.emit("ride_status_updated", notificationData);

      // Also emit specific event types for different status changes
      if (status === "rejected") {
        io.emit("ride_rejected", {
          ...notificationData,
          message: `Ride rejected: ${cancelReason || "No reason provided"}`,
        });
      } else if (status === "canceled") {
        io.emit("ride_canceled", {
          ...notificationData,
          message: `Ride canceled: ${cancelReason || "No reason provided"}`,
        });
      } else if (status === "completed") {
        io.emit("ride_completed", {
          ...notificationData,
          message: "Ride completed successfully",
        });
      } else if (status === "accepted") {
        // Add driver info to accepted notification
        const driverData =
          updatedRide.driverId && typeof updatedRide.driverId === "object"
            ? {
                driverName:
                  updatedRide.driverId.fullName ||
                  updatedRide.driverId.username ||
                  "Driver",
                vehicleType: updatedRide.driverId.vehicleType || "Vehicle",
                licensePlate: updatedRide.driverId.numberPlate || "",
              }
            : { driverName: "Driver" };

        io.emit("ride_accepted", {
          ...notificationData,
          ...driverData,
          message: `Ride accepted by ${driverData.driverName}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedRide,
    });
  } catch (error) {
    console.error("Update ride status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update ride status",
      error: error.message,
    });
  }
};

/**
 * GET RIDE HISTORY
 */
export const getRideHistory = async (req, res) => {
  try {
    const { userId, userType, page = 1, limit = 10, status } = req.query;

    // Validate required fields
    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: "User ID and user type are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate user type
    if (!["passenger", "driver"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "User type must be passenger or driver",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number",
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    // Build query
    const query = {};

    if (userType === "passenger") {
      query.passengerId = userId;
    } else if (userType === "driver") {
      query.driverId = userId;
    }

    // Add status filter if provided
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    const total = await Ride.countDocuments(query);

    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate(
        userType === "passenger" ? "driverId" : "passengerId",
        "fullName username phone vehicleType numberPlate"
      );

    return res.status(200).json({
      success: true,
      data: rides,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get ride history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ride history",
      error: error.message,
    });
  }
};

/**
 * GET ACTIVE RIDE
 */
export const getActiveRide = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    // Validate required fields
    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: "User ID and user type are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate user type
    if (!["passenger", "driver"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "User type must be passenger or driver",
      });
    }

    let activeRide;

    if (userType === "passenger") {
      activeRide = await Ride.findOne({
        passengerId: userId,
        status: { $in: ["requested", "accepted", "picked up"] },
      }).populate(
        "driverId",
        "fullName username phone vehicleType numberPlate profileImage"
      );
    } else if (userType === "driver") {
      activeRide = await Ride.findOne({
        driverId: userId,
        status: { $in: ["accepted", "picked up"] },
      }).populate("passengerId", "fullName username phone profileImage");
    }

    if (!activeRide) {
      return res.status(404).json({
        success: false,
        message: "No active ride found",
      });
    }

    return res.status(200).json({
      success: true,
      data: activeRide,
    });
  } catch (error) {
    console.error("Get active ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active ride",
      error: error.message,
    });
  }
};

/**
 * UPDATE PAYMENT STATUS
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { rideId, paymentStatus, paymentMethod } = req.body;

    // Validate required fields
    if (!rideId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Ride ID and payment status are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID format",
      });
    }

    // Validate payment status
    if (!["pending", "completed"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be pending or completed",
      });
    }

    // Validate payment method if provided
    if (paymentMethod && !["cash", "card", "wallet"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be cash, card, or wallet",
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Only allow payment completion for completed rides
    if (paymentStatus === "completed" && ride.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot complete payment for a ride that is not completed",
      });
    }

    ride.paymentStatus = paymentStatus;
    if (paymentMethod) {
      ride.paymentMethod = paymentMethod;
    }

    await ride.save();

    // Notify about payment update
    if (io) {
      io.emit("ride_payment_updated", {
        rideId,
        paymentStatus,
        paymentMethod: ride.paymentMethod,
        message: `Payment status updated to ${paymentStatus}`,
        timestamp: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

/**
 * SEARCH DRIVERS
 */
export const searchDrivers = async (req, res) => {
  try {
    const { vehicleType, latitude, longitude, radius = 5 } = req.query; // radius in km

    // Validate required fields
    if (!vehicleType || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type, latitude, and longitude are required",
      });
    }

    if (!["Bike", "Car", "Electric"].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type. Must be Bike, Car, or Electric",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    const radiusNum = parseFloat(radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Radius must be a positive number",
      });
    }

    // Find drivers with the requested vehicle type
    // This is placeholder logic; you'd ideally have a geospatial index
    const drivers = await User.find({
      role: "driver",
      vehicleType,
      isAvailable: true,
    }).select(
      "fullName username phone vehicleType numberPlate profileImage location"
    );

    // Notify that a search was performed
    if (io) {
      io.emit("drivers_searched", {
        count: drivers.length,
        vehicleType,
        location: { lat, lng },
        radius: radiusNum,
        message: "A driver search was performed",
        timestamp: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      data: drivers,
      count: drivers.length,
    });
  } catch (error) {
    console.error("Search drivers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search for drivers",
      error: error.message,
    });
  }
};

/**
 * RATE RIDE
 */
export const rateRide = async (req, res) => {
  try {
    const { rideId, rating, feedback } = req.body;

    // Validate required fields
    if (!rideId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Ride ID and rating are required",
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID format",
      });
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const ride = await Ride.findById(rideId)
      .populate("passengerId", "fullName username")
      .populate("driverId", "fullName username");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Only allow rating completed rides
    if (ride.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed rides",
      });
    }

    // Update ride with rating and feedback
    ride.rating = rating;
    if (feedback) {
      ride.feedback = feedback;
    }

    await ride.save();

    // Get user names for the notification
    const passengerName =
      ride.passengerId?.fullName || ride.passengerId?.username || "Passenger";
    const driverName =
      ride.driverId?.fullName || ride.driverId?.username || "Driver";

    // Emit event with proper names
    if (io) {
      io.emit("ride_rated", {
        rideId,
        rating,
        feedback: feedback || "",
        passengerId:
          typeof ride.passengerId === "object"
            ? ride.passengerId._id
            : ride.passengerId,
        driverId:
          typeof ride.driverId === "object" ? ride.driverId._id : ride.driverId,
        passengerName,
        driverName,
        message: `${passengerName} rated the ride ${rating} stars`,
        timestamp: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    console.error("Rate ride error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to rate ride",
      error: error.message,
    });
  }
};

/**
 * GET PENDING RIDES
 */
export const getPendingRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: "requested",
      $or: [{ driverId: null }, { driverId: { $exists: false } }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending rides",
      error: error.message,
    });
  }
};
