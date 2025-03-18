import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Trip from "../models/TripModel.js";
import { createResponse } from "../utils/responseHelper.js";

/**
 * CREATE a new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let { tripId, seats = 1, paymentMethod } = req.body;

    // Ensure seats is a number
    seats = Number(seats);
    if (isNaN(seats) || seats < 1) {
      return res.status(400).json(createResponse(400, false, [{ message: "Invalid seats value" }]));
    }

    // Validate payment method
    if (!["COD", "online"].includes(paymentMethod)) {
      return res.status(400).json(createResponse(400, false, [{ message: "Invalid payment method" }]));
    }

    // Find the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    // Check available seats
    if (trip.availableSeats < seats) {
      return res.status(400).json(createResponse(400, false, [{ message: "Not enough seats available for this trip" }]));
    }

    // Decrement available seats and save the trip
    trip.availableSeats -= seats;
    await trip.save();

    // Determine payment status based on method
    const paymentStatus = paymentMethod === "COD" ? "pending" : "pending"; // Payment is "pending" until online payment is confirmed

    // Create the booking
    const newBooking = await Booking.create({
      trip: trip._id,
      user: userId,
      seatsBooked: seats,
      paymentMethod,
      paymentStatus,
    });

    return res.status(201).json(
      createResponse(201, true, [], {
        message: paymentMethod === "COD" 
          ? "Booking confirmed with Cash on Delivery. Pay at the time of the trip." 
          : "Booking created. Please proceed with online payment.",
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
 */
export const getBookingDetails = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    // Populate the trip and, within the trip, populate the driver field
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "trip",
        populate: {
          path: "driver",
          model: "User",
          select: "fullName phoneNumber role",
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

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "trip",
        populate: {
          path: "driver",
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

    // Ensure the booking belongs to the user
    if (booking.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json(
          createResponse(403, false, [
            { message: "Not authorized to cancel this booking" },
          ])
        );
    }

    // If the booking is still booked, cancel it and revert seats
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
