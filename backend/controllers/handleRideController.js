import Ride from "../models/handleRideModel.js";

// Post a ride (Driver)
export const postRide = async (req, res) => {
  const { driverId, pickupLocation, dropoffLocation, pickupLocationName, dropoffLocationName, distance, estimatedTime } = req.body;

  if (!driverId || !pickupLocation || !dropoffLocation || !pickupLocationName || !dropoffLocationName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const ride = await Ride.create({
      driverId,
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName,
      distance,
      estimatedTime,
      status: "available",
    });

    res.status(201).json({ message: "Ride posted successfully", ride });
  } catch (error) {
    res.status(500).json({ message: "Failed to post ride", error: error.message });
  }
};

// Request a ride (Passenger)
export const requestRide = async (req, res) => {
  const { passengerId, pickupLocation, dropoffLocation, pickupLocationName, dropoffLocationName, distance, estimatedTime } = req.body;

  if (!passengerId || !pickupLocation || !dropoffLocation || !pickupLocationName || !dropoffLocationName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const ride = await Ride.create({
      passengerId,
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName,
      distance,
      estimatedTime,
      status: "requested",
    });

    res.status(201).json({ message: "Ride requested successfully", ride });
  } catch (error) {
    res.status(500).json({ message: "Failed to request ride", error: error.message });
  }
};

// Update ride status (Driver)
export const updateRideStatus = async (req, res) => {
  const { rideId, status } = req.body;

  if (!rideId || !status) {
    return res.status(400).json({ message: "Ride ID and status are required" });
  }

  try {
    const ride = await Ride.findByIdAndUpdate(rideId, { status }, { new: true });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json({ message: "Ride status updated successfully", ride });
  } catch (error) {
    res.status(500).json({ message: "Failed to update ride status", error: error.message });
  }
};
