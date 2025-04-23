// bookingController.js

import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Trip from "../models/TripModel.js";
import { createResponse } from "../utils/responseHelper.js";

// Add import for the Chat initialization if available
// import { initializeChat } from "../controllers/chatController.js";

export const initializeChatAfterBooking = async (booking, req) => {
  try {
    // Populate necessary fields
    const populatedBooking = await Booking.findById(booking._id)
      .populate("trip")
      .populate("user", "fullName")
      .exec();

    if (!populatedBooking || !populatedBooking.trip) {
      console.error("Could not find booking or trip details for chat initialization");
      return;
    }

    const tripId = populatedBooking.trip._id;
    const userId = populatedBooking.user._id;

    // Create a welcome message
    const message = `Booking confirmed! ${populatedBooking.user.fullName} has booked ${populatedBooking.seatsBooked} seat(s).`;

    // Assuming initializeChat is imported from chatController
    return await initializeChat(tripId, userId, message, req);
  } catch (error) {
    console.error("Error initializing chat after booking:", error);
  }
};

/**
 * CREATE a new booking
 */
export const createBooking = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let { tripId, seats = 1, paymentMethod } = req.body;
    console.log("Request values:", tripId, seats, paymentMethod);

    // (A) Validate, find trip, handle seats, etc...
    seats = Number(seats);
    if (isNaN(seats) || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid seats value. Must be a positive number."
      });
    }

    if (!["COD", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    const trip = await Trip.findById(tripId).populate("driver", "fullName phoneNumber");
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (trip.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Cannot book a trip that is not scheduled"
      });
    }

    if (trip.availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Requested: ${seats}, Available: ${trip.availableSeats}`
      });
    }

    // (B) Check for existing booking
    const existingBooking = await Booking.findOne({
      trip: tripId,
      user: userId,
      status: { $ne: "cancelled" }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have a booking for this trip",
        existingBooking
      });
    }

    // (C) Create booking with a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      trip.availableSeats -= seats;
      await trip.save({ session });

      const paymentStatus = paymentMethod === "COD" ? "pending" : "pending";

      const newBooking = await Booking.create(
        [
          {
            trip: trip._id,
            user: userId,
            seatsBooked: seats,
            paymentMethod,
            paymentStatus,
            // Set initial status to "pending" instead of "booked"
            status: "pending"
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Notify the driver about the new booking
      if (req.io) {
        req.io.to(`driver-${trip.driver._id}`).emit("new_booking", {
          bookingId: newBooking[0]._id,
          tripId: trip._id,
          driverId: trip.driver._id,
          message: `New booking request: ${seats} seat(s) booked`
        });
      }

      return res.status(201).json({
        success: true,
        message: `Booking request sent. Waiting for driver confirmation. ${seats} seat(s) reserved for you.`,
        booking: newBooking[0]
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in createBooking:", error);
    next(error);
  }
};

/**
 * Driver accepts a booking
 */
export const acceptBooking = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    const booking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("user", "fullName email phoneNumber");

    if (!booking) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    // Check if this driver owns the trip
    if (!booking.trip || booking.trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(
          createResponse(403, false, [
            { message: "Not authorized to accept this booking" },
          ])
        );
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: `Cannot accept booking with status: ${booking.status}` }]));
    }

    // Update booking status to "booked"
    booking.status = "booked";
    await booking.save();

    // Notify the user that their booking was accepted
    if (req.io) {
      req.io.to(`user-${booking.user._id}`).emit("booking_accepted", {
        bookingId: booking._id,
        tripId: booking.trip._id,
        message: "Your booking has been accepted by the driver"
      });
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Booking accepted successfully",
        booking,
      })
    );
  } catch (error) {
    console.error("Error in acceptBooking:", error);
    next(error);
  }
};

/**
 * Driver rejects a booking
 */
export const rejectBooking = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    const booking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("user", "fullName email phoneNumber");

    if (!booking) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    // Check if this driver owns the trip
    if (!booking.trip || booking.trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(
          createResponse(403, false, [
            { message: "Not authorized to reject this booking" },
          ])
        );
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: `Cannot reject booking with status: ${booking.status}` }]));
    }

    // Create a session to handle both booking status and seats update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update booking status to "cancelled"
      booking.status = "cancelled";
      booking.rejectionReason = reason || "Driver unavailable";
      await booking.save({ session });

      // Restore available seats
      if (booking.trip) {
        booking.trip.availableSeats += booking.seatsBooked;
        await booking.trip.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Notify the user that their booking was rejected
      if (req.io) {
        req.io.to(`user-${booking.user._id}`).emit("booking_rejected", {
          bookingId: booking._id,
          tripId: booking.trip._id,
          reason: booking.rejectionReason,
          message: "Your booking has been rejected by the driver"
        });
      }

      return res.status(200).json(
        createResponse(200, true, [], {
          message: "Booking rejected successfully",
          booking,
        })
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in rejectBooking:", error);
    next(error);
  }
};

/**
 * Mark booking as completed (for driver)
 */
export const completeBooking = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid booking ID" }]));
    }

    const booking = await Booking.findById(bookingId)
      .populate("trip")
      .populate("user", "fullName email phoneNumber");

    if (!booking) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    // Check if this driver owns the trip
    if (!booking.trip || booking.trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(
          createResponse(403, false, [
            { message: "Not authorized to complete this booking" },
          ])
        );
    }

    if (booking.status !== "booked") {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: `Cannot complete booking with status: ${booking.status}` }]));
    }

    // Create a session to handle both booking and trip updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update booking status to "completed"
      booking.status = "completed";

      // If payment method was COD, update payment status to paid
      if (booking.paymentMethod === "COD") {
        booking.paymentStatus = "paid";
      }

      await booking.save({ session });

      // Check if all bookings for this trip are complete, and if so, mark trip as completed
      const pendingBookings = await Booking.countDocuments({
        trip: booking.trip._id,
        status: { $nin: ["completed", "cancelled"] }
      });

      if (pendingBookings === 0) {
        booking.trip.status = "completed";
        await booking.trip.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Notify the user that their trip is completed
      if (req.io) {
        req.io.to(`user-${booking.user._id}`).emit("booking_completed", {
          bookingId: booking._id,
          tripId: booking.trip._id,
          message: "Your trip has been completed"
        });
      }

      return res.status(200).json(
        createResponse(200, true, [], {
          message: "Booking marked as completed successfully",
          booking,
        })
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in completeBooking:", error);
    next(error);
  }
};

/**
 * GET pending bookings for driver
 */
export const getDriverPendingBookings = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    // Find all trips by this driver
    const driverTrips = await Trip.find({ "driver._id": driverId });
    const tripIds = driverTrips.map(trip => trip._id);

    // Find all pending bookings for these trips
    const pendingBookings = await Booking.find({
      trip: { $in: tripIds },
      status: "pending"
    })
      .populate({
        path: "trip",
        select: "departureLocation destinationLocation departureDate departureTime price"
      })
      .populate("user", "fullName email phoneNumber");

    return res.status(200).json(
      createResponse(200, true, [], {
        bookings: pendingBookings,
      })
    );
  } catch (error) {
    console.error("Error in getDriverPendingBookings:", error);
    next(error);
  }
};

/**
 * GET all bookings for driver's trips
 */
export const getDriverBookings = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    // Find all trips by this driver
    const driverTrips = await Trip.find({ "driver._id": driverId });
    const tripIds = driverTrips.map(trip => trip._id);

    // Find all bookings for these trips
    const bookings = await Booking.find({
      trip: { $in: tripIds }
    })
      .populate({
        path: "trip",
        select: "departureLocation destinationLocation departureDate departureTime price status"
      })
      .populate("user", "fullName email phoneNumber");

    return res.status(200).json(
      createResponse(200, true, [], {
        bookings,
      })
    );
  } catch (error) {
    console.error("Error in getDriverBookings:", error);
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
/**
 * CANCEL a booking with transaction
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

    // If the booking is still booked or pending, cancel it and revert seats using a transaction
    if (booking.status === "booked" || booking.status === "pending") {
      // Start a transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update booking status to cancelled
        booking.status = "cancelled";
        await booking.save({ session });

        // Restore available seats in the trip
        if (booking.trip) {
          booking.trip.availableSeats += booking.seatsBooked;
          await booking.trip.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Emit a real-time notification that a booking was cancelled
        if (req.io) {
          // Notify the driver
          req.io.to(`driver-${booking.trip.driver._id}`).emit("booking_cancelled", {
            bookingId: booking._id,
            tripId: booking.trip._id,
            userId,
            message: "A booking has been cancelled by the user"
          });
        }

        return res.status(200).json(
          createResponse(200, true, [], {
            message: "Booking cancelled successfully",
            booking,
          })
        );
      } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } else {
      return res.status(400).json(
        createResponse(400, false, [
          { message: `Cannot cancel booking with status: ${booking.status}` }
        ])
      );
    }
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    next(error);
  }
};