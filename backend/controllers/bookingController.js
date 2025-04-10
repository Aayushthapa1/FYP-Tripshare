
import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Trip from "../models/TripModel.js";
import User from "../models/userModel.js";
import { createResponse } from "../utils/responseHelper.js";

// 1) Import the "io" from server.js
import { io } from "../server.js";



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

    const trip = await Trip.findById(tripId);
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
            status: "booked"
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // (D) Emit a real-time notification that a new booking was created
      if (io) {
        io.emit("booking_created", {
          bookingId: newBooking[0]._id,
          tripId: trip._id,
          userId,
          seats,
          message: "A new booking has been created"
        });
      }

      return res.status(201).json({
        success: true,
        message:
          paymentMethod === "COD"
            ? `Booking confirmed with Cash on Delivery. ${seats} seat(s) reserved for you.`
            : `Booking created. Please proceed with online payment for ${seats} seat(s).`,
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

      // Emit a real-time notification that a booking was cancelled
      if (io) {
        io.emit("booking_cancelled", {
          bookingId: booking._id,
          tripId: booking.trip._id,
          userId,
          message: "A booking has been cancelled"
        });
      }
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

export const getChatUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role; 
    
    // If the user is a normal user (booker)
    if (userRole === 'user') {
      const bookings = await Booking.find({ user: userId, status: 'booked' }).populate('trip');
      const chatUsers = bookings.map((booking) => booking.trip.driver);
      
      return res.status(200).json(
        createResponse(200, true, [], {
          message: 'Chat users retrieved successfully',
          chatUsers
        })
      );
    }
    
    // If the user is a driver
    if (userRole === 'driver') {
      const trips = await Trip.find({ 'driver._id': userId });
      const bookedUsers = [];
      
      // Get all users who have booked with this driver
      for (const trip of trips) {
        const bookings = await Booking.find({ trip: trip._id, status: 'booked' }).populate('user');
        bookedUsers.push(...bookings.map((booking) => booking.user));
      }

      return res.status(200).json(
        createResponse(200, true, [], {
          message: 'Users who booked with the driver retrieved successfully',
          bookedUsers
        })
      );
    }
    
    return res.status(400).json(createResponse(400, false, [], { message: 'Invalid role' }));
    
  } catch (error) {
    console.error('Error in getChat:', error);
    next(error);
  }
};
