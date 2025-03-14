// controllers/bookingController.js

import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Trip from "../models/TripModel.js";
import { createResponse } from "../utils/responseHelper.js";

/**
 * CREATE a new booking
 * (User is not the driver, seats must be available, etc.)
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user._id; // from protectRoute
    const { tripId, seats = 1 } = req.body;

    // 1) Validate tripId
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [
          { message: "Invalid trip ID" }
        ]));
    }

    // 2) Find the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [
          { message: "Trip not found" }
        ]));
    }

    // 3) Ensure user is not the driver
    if (trip.driver && trip.driver._id.toString() === userId.toString()) {
      return res
        .status(400)
        .json(createResponse(400, false, [
          { message: "Driver cannot book their own trip" }
        ]));
    }

    // 4) Check if enough seats remain
    if (trip.availableSeats < seats) {
      return res
        .status(400)
        .json(createResponse(400, false, [
          { message: "Not enough seats available for this trip" }
        ]));
    }

    // 5) Decrement seats
    trip.availableSeats -= seats;
    await trip.save();

    // 6) Create booking
    const newBooking = await Booking.create({
      trip: trip._id,
      user: userId,
      seatsBooked: seats,
      // status: "booked" by default
    });

    // ** Emit a Socket.IO event to let relevant clients know a booking was created **
    // If you want to notify all clients:
    io.emit("booking_created", newBooking);

    // Or if you only want to notify the driver specifically:
    //  - We need the driver's userId. It's trip.driver._id.
    //  - If you're storing user->socket in a Map, do something like:
    /*
    import { onlineUsers } from "../server.js";
    const driverId = trip.driver._id.toString();
    const driverSocketId = onlineUsers.get(driverId);
    if (driverSocketId) {
      io.to(driverSocketId).emit("booking_created", newBooking);
    }
    */

    return res.status(201).json(
      createResponse(201, true, [], {
        message: "Booking created successfully",
        booking: newBooking,
      })
    );
  } catch (error) {
    console.error("Error in createBooking:", error);
    next(error);
  }
};

/**
 * GET a single booking's details
 * Here we populate the trip (and the trip's driver), so you see all the data:
 *  - departure/destination
 *  - date/time
 *  - vehicleDetails
 *  - driver name, phone, etc.
 */
export const getBookingDetails = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    // Populate the trip, and within the trip, populate driver
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "trip",
        populate: {
          path: "driver._id", // We store driver as { _id, name, phoneNumber }
          model: "User", // if you actually reference the user doc
          select: "fullName phoneNumber role", // or whichever fields
        },
      })
      .populate("user", "fullName email phoneNumber");

    if (!booking) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        booking,
      })
    );
  } catch (error) {
    console.error("Error in getBookingDetails:", error);
    next(error);
  }
};

/**
 * GET all bookings for the logged-in user
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Populate trip, driver, etc. if you want
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "trip",
        populate: {
          path: "driver._id",
          model: "User",
          select: "fullName phoneNumber role",
        },
      })
      .populate("user", "fullName email phoneNumber");

    return res.status(200).json(
      createResponse(200, true, [], {
        bookings,
      })
    );
  } catch (error) {
    console.error("Error in getMyBookings:", error);
    next(error);
  }
};

/**
 * CANCEL a booking
 * - sets booking.status = "cancelled"
 * - increments trip.availableSeats
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    const booking = await Booking.findById(bookingId).populate("trip");
    if (!booking) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    // Ensure this booking belongs to the user
    if (booking.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(
          createResponse(403, false, [
            { message: "Not authorized to cancel this booking" },
          ])
        );
    }

    // If it's still "booked", revert seats
    if (booking.status === "booked") {
      booking.status = "cancelled";
      if (booking.trip) {
        booking.trip.availableSeats += booking.seatsBooked;
        await booking.trip.save();
      }
      await booking.save();
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Booking cancelled successfully",
        booking,
      })
    );
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    next(error);
  }
};
