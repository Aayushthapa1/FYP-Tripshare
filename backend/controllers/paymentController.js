import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import { createResponse } from "../utils/responseHelper.js";
import axios from "axios";
import _config from "../utils/config.js";
import Trip from "../models/TripModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Helper function for chat initialization - needed for completeKhaltiPayment
const initializeChat = async (tripId, userId, message, req) => {
  try {
    // If you have a chat model and controller, import and use them
    // This is a placeholder that can be implemented based on your chat system
    console.log(`Initializing chat for trip ${tripId} and user ${userId} with message: ${message}`);

    // If you have a chat service, you would use it like this:
    // const chatService = req.app.get('chatService'); 
    // await chatService.createConversation(tripId, userId, message);

    return true;
  } catch (error) {
    console.error("Error initializing chat:", error);
    return false;
  }
};

/**
 * INITIATE PAYMENT (handles eSewa, COD directly,
 * and initiates Khalti "Web Checkout").
 */
export const initiatePayment = async (req, res, next) => {
  try {
    console.log("Received request for payment initiation:", req.body);

    const { userId, bookingId, tripId, seats, amount, bookingType } = req.body;
    const user = req.user._id; // the logged-in user
    console.log("Logged-in user ID:", user);

    // Create Payment record with appropriate fields
    const paymentData = {
      user,
      amount,
      paymentMethod: "khalti",
      status: "pending",
      bookingType: bookingType || "trip",
    };

    console.log("Initial payment data:", paymentData);

    // Handle different scenarios
    if (bookingId) {
      console.log("Processing payment for booking ID:", bookingId);

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.warn("Booking not found:", bookingId);
        return res
          .status(404)
          .json(createResponse(404, false, [{ message: "Booking not found" }]));
      }
      paymentData.booking = bookingId;
    } else if (tripId) {
      console.log("Processing payment for trip ID:", tripId);

      const trip = await Trip.findById(tripId);
      if (!trip) {
        console.warn("Trip not found:", tripId);
        return res
          .status(404)
          .json(createResponse(404, false, [{ message: "Trip not found" }]));
      }

      if (trip.availableSeats < seats) {
        console.warn(
          `Not enough seats available. Requested: ${seats}, Available: ${trip.availableSeats}`
        );
        return res.status(400).json(
          createResponse(400, false, [
            {
              message: `Not enough seats available. Requested: ${seats}, Available: ${trip.availableSeats}`,
            },
          ])
        );
      }

      paymentData.tripId = tripId;
      paymentData.seats = seats;
    } else {
      console.warn("Neither bookingId nor tripId provided");
      return res.status(400).json(
        createResponse(400, false, [
          {
            message: "Either bookingId or tripId must be provided",
          },
        ])
      );
    }

    // Create the payment record
    console.log("Creating payment record with data:", paymentData);
    const payment = await Payment.create(paymentData);
    console.log("Payment created successfully:", payment);

    // Emit real-time event
    if (req.app.get('io')) {
      const io = req.app.get('io');
      console.log("Emitting payment_initiated event");
      io.emit("payment_initiated", {
        paymentId: payment._id,
        userId: user,
        amount,
        method: "khalti",
        message: "Payment initiated by user",
      });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3301";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Convert to paisa for Khalti
    const amountInPaisa = amount * 100;
    console.log("Amount converted to paisa:", amountInPaisa);

    // Prepare Khalti request
    const khaltiPaymentData = {
      return_url: `${backendUrl}/api/payments/completeKhaltiPayment`,
      website_url: frontendUrl,
      amount: amountInPaisa,
      purchase_order_id: payment._id.toString(),
      purchase_order_name: `${bookingType || "Trip"} Payment`,
      customer_info: {
        name: req.user.name || req.user.fullName || "NoName",
        email: req.user.email || "NoEmail",
        phone: req.user.phoneNumber || "NoPhone",
      },
    };

    console.log("Khalti payment data prepared:", khaltiPaymentData);

    const headers = {
      Authorization: `Key ${_config.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    console.log("Sending request to Khalti API...");
    const khaltiResponse = await axios.post(
      `https://a.khalti.com/api/v2/epayment/initiate/`,
      khaltiPaymentData,
      { headers }
    );

    console.log("Received response from Khalti:", khaltiResponse.data);

    const { pidx, payment_url, expires_at } = khaltiResponse.data;

    // Update payment with Khalti token
    console.log("Updating payment record with Khalti token:", pidx);
    payment.khaltiToken = pidx;
    await payment.save();
    console.log("Payment record updated successfully");

    // Return response to client
    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Khalti payment initiated successfully",
        paymentId: payment._id,
        pidx,
        payment_url,
        expires_at,
      })
    );
  } catch (error) {
    console.error("Error in initiatePayment:", error);
    next(error);
  }
};

/**
 * KHALTI PAYMENT COMPLETION (callback route for Khalti)
 * This is the return_url where Khalti redirects after user finishes payment.
 * We do a lookup with `pidx` to confirm status is "Completed."
 */
export const completeKhaltiPayment = async (req, res, next) => {
  try {
    console.log("Khalti callback received:", req.query);

    const { pidx, transaction_id, amount, purchase_order_id, status } = req.query;

    if (!pidx) {
      console.warn("Missing pidx in Khalti callback query string");
      return res.status(400).send("Missing pidx in Khalti callback query string");
    }

    const khaltiBaseUrl = "https://a.khalti.com";
    const lookupUrl = `${khaltiBaseUrl}/api/v2/epayment/lookup/`.replace(/([^:]\/\/)+/g, "$1");

    console.log("Khalti lookup URL:", lookupUrl);

    const headers = {
      Authorization: `Key ${_config.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    console.log("Fetching payment record for order ID:", purchase_order_id);
    const payment = await Payment.findById(purchase_order_id);
    if (!payment) {
      console.warn("Payment record not found for:", purchase_order_id);
      return res.status(404).send("Payment record not found");
    }

    console.log("Sending request to Khalti lookup API...");
    const lookupResponse = await axios.post(lookupUrl, { pidx }, { headers });
    const paymentInfo = lookupResponse.data;

    console.log("Received response from Khalti lookup API:", paymentInfo);

    if (!paymentInfo) {
      console.warn("No payment info received from Khalti");
      payment.status = "failed";
      await payment.save();
      return res.status(400).send("No payment info from Khalti");
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const io = req.app?.get('io');

    if (paymentInfo.status === "Completed") {
      console.log("Payment completed successfully for:", payment._id);

      payment.status = "completed";
      payment.transactionId = paymentInfo.transaction_id;
      payment.khaltiToken = pidx;
      await payment.save();

      let booking;

      if (payment.booking) {
        console.log("Updating booking payment status for:", payment.booking);
        booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.paymentStatus = "paid";
          booking.status = "booked";
          await booking.save();

          console.log("Initializing chat for booking");
          const user = await User.findById(booking.user);
          const trip = await Trip.findById(booking.trip);

          if (user && trip) {
            const message = `Payment completed for booking #${booking._id.toString().substring(0, 8)}. ${user.fullName || "User"} has booked ${booking.seatsBooked} seat(s).`;
            await initializeChat(booking.trip, booking.user, message, req);
          }
        }
      } else if (payment.tripId && payment.seats) {
        console.log("Creating new booking for trip payment");

        booking = await Booking.create({
          trip: payment.tripId,
          user: payment.user,
          seatsBooked: payment.seats,
          paymentMethod: "online",
          paymentStatus: "paid",
          status: "booked",
        });

        const trip = await Trip.findById(payment.tripId);
        if (trip) {
          trip.availableSeats -= payment.seats;
          await trip.save();

          const user = await User.findById(payment.user);
          if (user) {
            const message = `Payment completed for booking #${booking._id.toString().substring(0, 8)}. ${user.fullName || "User"} has booked ${booking.seatsBooked} seat(s).`;
            await initializeChat(payment.tripId, payment.user, message, req);
          }
        }
        payment.booking = booking._id;
        await payment.save();
      }

      if (io) {
        console.log("Emitting real-time payment_completed event");
        io.emit("payment_completed", {
          paymentId: payment._id,
          bookingId: booking?._id,
          userId: payment.user,
          amount: payment.amount,
          message: "Payment completed successfully",
        });
      }
      return res.redirect(`${frontendUrl}/payment-success`);
    } else if (paymentInfo.status === "User canceled") {
      console.warn("User canceled payment for:", payment._id);
      payment.status = "canceled";
      await payment.save();
      if (io) {
        io.emit("payment_canceled", {
          paymentId: payment._id,
          userId: payment.user,
          amount: payment.amount,
          message: "Payment was canceled by user",
        });
      }
      return res.redirect(`${frontendUrl}/payment-cancel`);
    } else {
      console.error("Payment failed for:", payment._id);
      payment.status = "failed";
      await payment.save();
      if (io) {
        io.emit("payment_failed", {
          paymentId: payment._id,
          userId: payment.user,
          amount: payment.amount,
          message: "Payment failed",
        });
      }
      return res.redirect(`${frontendUrl}/payment-failed`);
    }
  } catch (error) {
    console.error("Error completing Khalti Payment:", error);
    const { purchase_order_id } = req.query;
    if (purchase_order_id) {
      await Payment.findByIdAndUpdate(purchase_order_id, { status: "failed" });
    }
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/payment-error`);
  }
};

/**
 * Get details of a specific payment
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Invalid payment ID format" }])
      );
    }

    const payment = await Payment.findById(paymentId)
      .populate({
        path: "booking",
        populate: { path: "trip" },
      })
      .populate("user", "fullName email")
      .populate("tripId", "departureLocation destinationLocation departureDate departureTime");

    if (!payment) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Payment not found" }]));
    }

    // Check if the user has permission to view this payment
    if (req.user.role !== "Admin" && payment.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "You do not have permission to view this payment" }]));
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        payment,
      })
    );
  } catch (error) {
    console.error("Error fetching payment details:", error);
    next(error);
  }
};

/**
 * Get all payments (with optional filtering)
 */
export const getAllPayments = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json(
        createResponse(403, false, [{ message: "Unauthorized: Admin access required" }])
      );
    }

    const { status, method, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.paymentMethod = method;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: {
          path: "trip",
          select: "departureLocation destinationLocation departureDate"
        }
      })
      .populate("user", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json(
      createResponse(200, true, [], {
        count: payments.length,
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        currentPage: parseInt(page),
        payments,
      })
    );
  } catch (error) {
    console.error("Error fetching all payments:", error);
    next(error);
  }
};


/**
 * Get payments for a specific user (for user dashboard)
 */
export const getUserPayments = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    if (!req.user || !req.user._id) {
      return res.status(401).json(
        createResponse(401, false, [{ message: "Unauthorized: Authentication required" }])
      );
    }

    const userId = req.user._id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: {
          path: "trip",
          select: "departureLocation destinationLocation departureDate departureTime price"
        },
      })
      .populate("tripId", "departureLocation destinationLocation departureDate departureTime price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate statistics
    const totalAmount = payments.reduce((sum, payment) => {
      return payment.status === "completed" ? sum + payment.amount : sum;
    }, 0);

    // Get counts for each status
    const [
      completedCount,
      pendingCount,
      failedCount,
      canceledCount
    ] = await Promise.all([
      Payment.countDocuments({ user: userId, status: "completed" }),
      Payment.countDocuments({ user: userId, status: "pending" }),
      Payment.countDocuments({ user: userId, status: "failed" }),
      Payment.countDocuments({ user: userId, status: "canceled" })
    ]);

    const paymentStats = {
      total: totalCount,
      completed: completedCount,
      pending: pendingCount,
      failed: failedCount,
      canceled: canceledCount,
      totalAmount,
    };

    return res.status(200).json(
      createResponse(200, true, [], {
        payments,
        stats: paymentStats,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      })
    );
  } catch (error) {
    console.error("Error fetching user payments:", error);
    next(error);
  }
};

/**
 * Get payments for trips driven by a specific driver (for driver dashboard)
 */
export const getDriverPayments = async (req, res, next) => {
  try {
    // Ensure authentication and driver role
    if (!req.user || !req.user._id) {
      return res.status(401).json(
        createResponse(401, false, [{ message: "Unauthorized: Authentication required" }])
      );
    }

    if (req.user.role !== "driver") {
      return res.status(403).json(
        createResponse(403, false, [{ message: "Forbidden: Driver role required" }])
      );
    }

    const driverId = req.user._id;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // First, find all trips by this driver
    const driverTrips = await Trip.find({ "driver._id": driverId }).select("_id");

    if (!driverTrips || driverTrips.length === 0) {
      return res.status(200).json(
        createResponse(200, true, [], {
          payments: [],
          stats: {
            totalTrips: 0,
            totalBookings: 0,
            totalPayments: 0,
            completedPayments: 0,
            totalEarnings: 0,
            chartData: []
          },
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        })
      );
    }

    const tripIds = driverTrips.map((trip) => trip._id);

    // Then find bookings for these trips
    const bookings = await Booking.find({
      trip: { $in: tripIds },
      status: { $ne: "cancelled" },
    }).select("_id");

    if (!bookings || bookings.length === 0) {
      return res.status(200).json(
        createResponse(200, true, [], {
          payments: [],
          stats: {
            totalTrips: tripIds.length,
            totalBookings: 0,
            totalPayments: 0,
            completedPayments: 0,
            totalEarnings: 0,
            chartData: []
          },
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        })
      );
    }

    const bookingIds = bookings.map((booking) => booking._id);

    // Now find payments for these bookings
    const query = { booking: { $in: bookingIds } };

    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: [
          {
            path: "trip",
            select: "departureLocation destinationLocation departureDate departureTime price",
          },
          {
            path: "user",
            select: "fullName email phoneNumber",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate statistics
    const totalEarnings = await Payment.aggregate([
      { $match: { booking: { $in: bookingIds }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const completedPayments = await Payment.countDocuments({
      booking: { $in: bookingIds },
      status: "completed"
    });

    // Group by day for chart data
    const paymentsByDay = await Payment.aggregate([
      {
        $match: {
          booking: { $in: bookingIds },
          status: "completed",
          createdAt: startDate && endDate ? {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          } : { $exists: true }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = paymentsByDay.map(item => ({
      date: item._id,
      amount: item.amount
    }));

    const paymentStats = {
      totalTrips: tripIds.length,
      totalBookings: bookingIds.length,
      totalPayments: totalCount,
      completedPayments,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
      chartData,
    };

    return res.status(200).json(
      createResponse(200, true, [], {
        payments,
        stats: paymentStats,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      })
    );
  } catch (error) {
    console.error("Error fetching driver payments:", error);
    next(error);
  }
};

/**
 * Get admin dashboard payment statistics
 */
export const getAdminPaymentStats = async (req, res, next) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json(
        createResponse(403, false, [{ message: "Unauthorized: Admin access required" }])
      );
    }

    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [
      totalCount,
      completedCount,
      pendingCount,
      failedCount,
      canceledCount
    ] = await Promise.all([
      Payment.countDocuments(dateQuery),
      Payment.countDocuments({ ...dateQuery, status: "completed" }),
      Payment.countDocuments({ ...dateQuery, status: "pending" }),
      Payment.countDocuments({ ...dateQuery, status: "failed" }),
      Payment.countDocuments({ ...dateQuery, status: "canceled" })
    ]);

    const methodCounts = await Payment.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
    ]);

    const paymentsByMethod = methodCounts.reduce((acc, curr) => {
      acc[curr._id || "Unknown"] = curr.count;
      return acc;
    }, {});

    const totalAmountResult = await Payment.aggregate([
      { $match: { ...dateQuery, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    const paymentsByDay = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: "completed"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = paymentsByDay.map(item => ({
      date: item._id,
      amount: item.amount
    }));

    const recentPayments = await Payment.find({})
      .populate({
        path: "booking",
        populate: {
          path: "trip",
          select: "departureLocation destinationLocation"
        }
      })
      .populate("user", "fullName email phoneNumber")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(
      createResponse(200, true, [], {
        stats: {
          totalPayments: totalCount,
          totalAmount,
          byStatus: {
            completed: completedCount,
            pending: pendingCount,
            failed: failedCount,
            canceled: canceledCount
          },
          byMethod: paymentsByMethod,
          chartData,
        },
        recentPayments,
      })
    );
  } catch (error) {
    console.error("Error fetching admin payment stats:", error);
    next(error);
  }
};
