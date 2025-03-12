import Trip from "../models/TripModel.js";
import User from "../models/UserModel.js"; // ensure correct import name/path
import { createResponse } from "../utils/responseHelper.js";

/**
 * CREATE a new trip (driver only)
 */
export const createTrip = async (req, res, next) => {
  try {
    // The driver is the logged-in user
    const userId = req.user._id;
    console.log("Driver ID:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Driver (User) not found" }]));
    }

    // Destructure input
    const {
      departureLocation,
      destinationLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
      vehicleDetails, // { vehicleType, model, color, plateNumber }
      preferences,    // { smoking, pets, music }
    } = req.body;

    // Create
    const newTrip = await Trip.create({
      driver: {
        _id: user._id,
        name: user.fullName || user.name || "Unnamed Driver",
        phoneNumber: user.phoneNumber || "N/A",
      },
      departureLocation,
      destinationLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
      vehicleDetails,
      preferences,
    });

    return res.status(201).json(
      createResponse(201, true, [], {
        message: "Trip created successfully",
        trip: newTrip,
      })
    );
  } catch (error) {
    console.error("Error in createTrip:", error);
    next(error);
  }
};

/**
 * BOOK a seat on a trip (any authenticated user except the driver)
 */
export const bookSeat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    // If you're the driver, can't book your own
    if (trip.driver && trip.driver._id.toString() === userId.toString()) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [{ message: "Driver cannot book own trip" }])
        );
    }

    // Check seats
    if (trip.availableSeats < 1) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [{ message: "No seats left for this trip" }])
        );
    }

    // Already booked?
    const alreadyBooked = trip.bookedSeats.some(
      (bookedUserId) => bookedUserId.toString() === userId.toString()
    );
    if (alreadyBooked) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Already booked" }]));
    }

    trip.bookedSeats.push(userId);
    trip.availableSeats -= 1;
    await trip.save();

    return res
      .status(200)
      .json(createResponse(200, true, [], { message: "Seat booked", trip }));
  } catch (error) {
    console.error("Error in bookSeat:", error);
    next(error);
  }
};

/**
 * GET all trips
 */
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().sort({ departureDate: 1 });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in getAllTrips:", error);
    next(error);
  }
};

/**
 * GET single trip by ID
 */
export const getTripById = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }
    return res.status(200).json(createResponse(200, true, [], { trip }));
  } catch (error) {
    console.error("Error in getTripById:", error);
    next(error);
  }
};

/**
 * UPDATE a trip (driver only)
 */
export const updateTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    if (trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "Not authorized" }]));
    }

    // optionally block direct driver overrides
    delete req.body.driver;

    if (req.body.departureDate) {
      const newDate = new Date(req.body.departureDate);
      if (newDate <= new Date()) {
        return res
          .status(400)
          .json(createResponse(400, false, [
            { message: "Departure date must be in the future" }
          ]));
      }
    }

    Object.assign(trip, req.body);
    await trip.save();

    return res
      .status(200)
      .json(
        createResponse(200, true, [], { message: "Trip updated", trip })
      );
  } catch (error) {
    console.error("Error in updateTrip:", error);
    next(error);
  }
};

/**
 * DELETE a trip (driver only)
 */
export const deleteTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    if (trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "Not authorized" }]));
    }

    if (trip.bookedSeats.length > 0) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [
            { message: "Cannot delete trip with bookings" }
          ])
        );
    }

    await Trip.findByIdAndDelete(tripId);
    return res
      .status(200)
      .json(createResponse(200, true, [], { message: "Trip deleted" }));
  } catch (error) {
    console.error("Error in deleteTrip:", error);
    next(error);
  }
};

/**
 * GET trips for the driver
 */
export const getDriverTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({ "driver._id": userId });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in getDriverTrips:", error);
    next(error);
  }
};

/**
 * SEARCH trips
 */
export const searchTrips = async (req, res, next) => {
  try {
    const { departureLocation, destinationLocation, departureDate, availableSeats } = req.query;

    const query = {};
    if (departureLocation) {
      query.departureLocation = { $regex: departureLocation, $options: "i" };
    }
    if (destinationLocation) {
      query.destinationLocation = { $regex: destinationLocation, $options: "i" };
    }
    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.departureDate = { $gte: date, $lt: nextDay };
    }
    if (availableSeats) {
      query.availableSeats = { $gte: parseInt(availableSeats) };
    }

    const trips = await Trip.find(query).sort({ departureDate: 1 });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in searchTrips:", error);
    next(error);
  }
};
