import Ride from "../models/handleRideModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";


const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


const calculateFare = (distance, vehicleType) => {
  if (typeof distance !== 'number' || distance < 0) {
    throw new Error('Invalid distance value');
  }

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


export const postRide = async (req, res) => {
  try {
    const { driverId, pickupLocation, dropoffLocation } = req.body;

    // Validate required fields
    if (!driverId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(driverId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid driver ID format" 
      });
    }

    // Validate location format
    if (!pickupLocation.latitude || !pickupLocation.longitude || 
        !dropoffLocation.latitude || !dropoffLocation.longitude) {
      return res.status(400).json({ 
        success: false,
        message: "Location must include latitude and longitude" 
      });
    }

    // Check if driver exists
    const driverExists = await User.findById(driverId);
    if (!driverExists) {
      return res.status(404).json({ 
        success: false,
        message: "Driver not found" 
      });
    }

    const ride = await Ride.create({
      driverId,
      pickupLocation,
      dropoffLocation,
      status: "available",
    });

    res.status(201).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error("Post ride error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to post ride", 
      error: error.message 
    });
  }
};


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

    // Validate required fields
    if (!passengerId || !pickupLocation || !dropoffLocation || 
        !pickupLocationName || !dropoffLocationName || 
        !vehicleType || distance === undefined || estimatedTime === undefined) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(passengerId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid passenger ID format" 
      });
    }

    // Validate location format
    if (!pickupLocation.latitude || !pickupLocation.longitude || 
        !dropoffLocation.latitude || !dropoffLocation.longitude) {
      return res.status(400).json({ 
        success: false,
        message: "Location must include latitude and longitude" 
      });
    }

    // Validate numeric values
    if (typeof distance !== 'number' || distance < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Distance must be a positive number" 
      });
    }

    if (typeof estimatedTime !== 'number' || estimatedTime < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Estimated time must be a positive number" 
      });
    }

    // Validate vehicle type
    if (!["Bike", "Car", "Electric"].includes(vehicleType)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid vehicle type. Must be Bike, Car, or Electric" 
      });
    }

    // Validate payment method
    if (paymentMethod && !["cash", "card", "wallet"].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid payment method. Must be cash, card, or wallet" 
      });
    }

    // Check if passenger exists
    const passengerExists = await User.findById(passengerId);
    if (!passengerExists) {
      return res.status(404).json({ 
        success: false,
        message: "Passenger not found" 
      });
    }

    // Check if passenger already has an active ride
    const activeRide = await Ride.findOne({
      passengerId,
      status: { $in: ["requested", "accepted", "picked up"] }
    });

    if (activeRide) {
      return res.status(400).json({ 
        success: false,
        message: "Passenger already has an active ride" 
      });
    }

    // Calculate fare
    let fare;
    try {
      fare = calculateFare(distance, vehicleType);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    const ride = await Ride.create({
      passengerId,
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName,
      vehicleType,
      distance,
      estimatedTime,
      fare,
      paymentMethod,
      status: "requested",
    });

    res.status(201).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error("Request ride error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to request ride", 
      error: error.message 
    });
  }
};


export const updateRideStatus = async (req, res) => {
  try {
    const { rideId, status, fare, cancelReason } = req.body;

    // Validate required fields
    if (!rideId || !status) {
      return res.status(400).json({ 
        success: false,
        message: "Ride ID and status are required" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ride ID format" 
      });
    }

    // Validate status
    const validStatuses = ["requested", "accepted", "picked up", "completed", "canceled", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Validate fare if provided
    if (fare !== undefined && (typeof fare !== 'number' || fare < 0)) {
      return res.status(400).json({ 
        success: false,
        message: "Fare must be a positive number" 
      });
    }

    // Require cancel reason if status is canceled or rejected
    if ((status === "canceled" || status === "rejected") && !cancelReason) {
      return res.status(400).json({ 
        success: false,
        message: "Cancel reason is required when canceling or rejecting a ride" 
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ 
        success: false,
        message: "Ride not found" 
      });
    }

    // Validate status transition
    const validTransitions = {
      "requested": ["accepted", "rejected", "canceled"],
      "accepted": ["picked up", "canceled"],
      "picked up": ["completed", "canceled"],
      "completed": [],
      "canceled": [],
      "rejected": []
    };

    if (!validTransitions[ride.status].includes(status) && ride.status !== status) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot change status from ${ride.status} to ${status}` 
      });
    }

    // Update ride
    ride.status = status;

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
          message: error.message 
        });
      }
    }

    await ride.save();

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error("Update ride status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update ride status", 
      error: error.message 
    });
  }
};

export const getRideHistory = async (req, res) => {
  try {
    const { userId, userType, page = 1, limit = 10, status } = req.query;

    // Validate required fields
    if (!userId || !userType) {
      return res.status(400).json({ 
        success: false,
        message: "User ID and user type are required" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }

    // Validate user type
    if (!["passenger", "driver"].includes(userType)) {
      return res.status(400).json({ 
        success: false,
        message: "User type must be passenger or driver" 
      });
    }

    // Validate pagination params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ 
        success: false,
        message: "Page must be a positive number" 
      });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Limit must be between 1 and 100" 
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

    // Count total documents for pagination
    const total = await Ride.countDocuments(query);
    
    // Get rides with pagination
    const rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate(userType === "passenger" ? "driverId" : "passengerId", "fullName username phone vehicleType numberPlate");

    res.status(200).json({
      success: true,
      data: rides,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("Get ride history error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch ride history", 
      error: error.message 
    });
  }
};


export const getActiveRide = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    // Validate required fields
    if (!userId || !userType) {
      return res.status(400).json({ 
        success: false,
        message: "User ID and user type are required" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }

    // Validate user type
    if (!["passenger", "driver"].includes(userType)) {
      return res.status(400).json({ 
        success: false,
        message: "User type must be passenger or driver" 
      });
    }

    let activeRide;

    if (userType === "passenger") {
      activeRide = await Ride.findOne({
        passengerId: userId,
        status: { $in: ["requested", "accepted", "picked up"] },
      }).populate("driverId", "fullName username phone vehicleType numberPlate profileImage");
    } else if (userType === "driver") {
      activeRide = await Ride.findOne({
        driverId: userId,
        status: { $in: ["accepted", "picked up"] },
      }).populate("passengerId", "fullName username phone profileImage");
    }

    if (!activeRide) {
      return res.status(404).json({ 
        success: false,
        message: "No active ride found" 
      });
    }

    res.status(200).json({
      success: true,
      data: activeRide
    });
  } catch (error) {
    console.error("Get active ride error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch active ride", 
      error: error.message 
    });
  }
};


export const updatePaymentStatus = async (req, res) => {
  try {
    const { rideId, paymentStatus, paymentMethod } = req.body;

    // Validate required fields
    if (!rideId || !paymentStatus) {
      return res.status(400).json({ 
        success: false,
        message: "Ride ID and payment status are required" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ride ID format" 
      });
    }

    // Validate payment status
    if (!["pending", "completed"].includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false,
        message: "Payment status must be pending or completed" 
      });
    }

    // Validate payment method if provided
    if (paymentMethod && !["cash", "card", "wallet"].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false,
        message: "Payment method must be cash, card, or wallet" 
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ 
        success: false,
        message: "Ride not found" 
      });
    }

    // Only allow payment completion for completed rides
    if (paymentStatus === "completed" && ride.status !== "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Cannot complete payment for a ride that is not completed" 
      });
    }

    ride.paymentStatus = paymentStatus;
    if (paymentMethod) {
      ride.paymentMethod = paymentMethod;
    }

    await ride.save();

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update payment status", 
      error: error.message 
    });
  }
};


export const searchDrivers = async (req, res) => {
  try {
    const { vehicleType, latitude, longitude, radius = 5 } = req.query; // radius in km

    // Validate required fields
    if (!vehicleType || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        message: "Vehicle type, latitude, and longitude are required" 
      });
    }

    // Validate vehicle type
    if (!["Bike", "Car", "Electric"].includes(vehicleType)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid vehicle type. Must be Bike, Car, or Electric" 
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ 
        success: false,
        message: "Latitude must be between -90 and 90" 
      });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false,
        message: "Longitude must be between -180 and 180" 
      });
    }

    // Validate radius
    const radiusNum = parseFloat(radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Radius must be a positive number" 
      });
    }

    // Find drivers with the requested vehicle type
    // Note: This assumes User model has location field with GeoJSON point
    // If not, you'll need to modify this query
    const drivers = await User.find({
      role: "driver",
      vehicleType,
      isAvailable: true,
      // If your User model has GeoJSON location field, use this:
      // location: {
      //   $near: {
      //     $geometry: {
      //       type: "Point",
      //       coordinates: [lng, lat]
      //     },
      //     $maxDistance: radiusNum * 1000 // convert km to meters
      //   }
      // }
    }).select("fullName username phone vehicleType numberPlate profileImage location");

    // If GeoJSON is not available, we can filter drivers manually
    // This is less efficient but works as a fallback
    // In a production app, you should implement proper geospatial indexing
    
    res.status(200).json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    console.error("Search drivers error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to search for drivers", 
      error: error.message 
    });
  }
};


export const rateRide = async (req, res) => {
  try {
    const { rideId, rating, feedback } = req.body;

    // Validate required fields
    if (!rideId || !rating) {
      return res.status(400).json({ 
        success: false,
        message: "Ride ID and rating are required" 
      });
    }

    // Validate ObjectId
    if (!isValidObjectId(rideId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid ride ID format" 
      });
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "Rating must be a number between 1 and 5" 
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ 
        success: false,
        message: "Ride not found" 
      });
    }

    // Only allow rating completed rides
    if (ride.status !== "completed") {
      return res.status(400).json({ 
        success: false,
        message: "Can only rate completed rides" 
      });
    }

    // Update ride with rating and feedback
    ride.rating = rating;
    if (feedback) {
      ride.feedback = feedback;
    }

    await ride.save();

   
    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error("Rate ride error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to rate ride", 
      error: error.message 
    });
  }
};

/**
 * Get all rides that are "requested" and have no driverId assigned
 * e.g. GET /api/rides/pending
 */
export const getPendingRides = async (req, res) => {
  try {
    // Find all rides where status is "requested" and driverId is null or not set
    const rides = await Ride.find({
      status: "requested",
      $or: [
        { driverId: null },          // driverId is null
        { driverId: { $exists: false } }, // or driverId field doesn't exist
      ],
    })
      .sort({ createdAt: -1 }); // newest first, optional

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
