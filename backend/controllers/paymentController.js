//--------------------------------------------------------
// File: paymentController.js
//--------------------------------------------------------
import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import { createResponse } from "../utils/responseHelper.js";
import axios from "axios";
import _config from "../utils/config.js";
import Trip from "../models/TripModel.js";
import User from "../models/userModel.js";


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
    if (io) {
      console.log("Emitting payment_initiated event");
      io.emit("payment_initiated", {
        paymentId: payment._id,
        userId: user,
        amount,
        method: "khalti",
        message: "Payment initiated by user",
      });
    }

    const backendUrl = "http://localhost:3301"; // Replace with your actual backend URL
    const frontendUrl = "http://localhost:5173";

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
        name: req.user.name || "NoName",
        email: req.user.email || "NoEmail",
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
    
    const frontendUrl = "http://localhost:5173"; // Update with your actual frontend URL
    
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
          booking.status = "completed";
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
    return res.redirect("http://localhost:5173/payment-error");
  }
};

/**
 * Get details of a specific payment
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate({
        path: "booking",
        populate: { path: "trip" },
      })
      .populate("user", "fullName email");

    if (!payment) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Payment not found" }]));
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
    const { status, method, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (method) query.paymentMethod = method;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const payments = await Payment.find(query)
      .populate("booking")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      createResponse(200, true, [], {
        count: payments.length,
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
    const userId = req.user._id;
    const { status, startDate, endDate } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: {
          path: "trip",
          select: "startLocation endLocation departureTime fare driver",
        },
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalAmount = payments.reduce((sum, payment) => {
      return payment.status === "completed" ? sum + payment.amount : sum;
    }, 0);

    const paymentStats = {
      total: payments.length,
      completed: payments.filter((p) => p.status === "completed").length,
      pending: payments.filter((p) => p.status === "pending").length,
      failed: payments.filter((p) => p.status === "failed").length,
      totalAmount,
    };

    return res.status(200).json(
      createResponse(200, true, [], {
        payments,
        stats: paymentStats,
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
    const driverId = req.user._id;
    const { status, startDate, endDate } = req.query;

    // First, find all trips by this driver
    const driverTrips = await Trip.find({ driver: driverId }).select("_id");
    const tripIds = driverTrips.map((trip) => trip._id);

    // Then find bookings for these trips
    const bookings = await Booking.find({
      trip: { $in: tripIds },
      status: { $ne: "cancelled" },
    }).select("_id");

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

    const payments = await Payment.find(query)
      .populate({
        path: "booking",
        populate: [
          {
            path: "trip",
            select: "startLocation endLocation departureTime fare",
          },
          {
            path: "user",
            select: "fullName email phoneNumber",
          },
        ],
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalEarnings = payments.reduce((sum, payment) => {
      return payment.status === "completed" ? sum + payment.amount : sum;
    }, 0);

    // Group by day for chart data
    const paymentsByDay = {};
    payments.forEach((payment) => {
      if (payment.status === "completed") {
        const date = payment.createdAt.toISOString().split("T")[0];
        paymentsByDay[date] = (paymentsByDay[date] || 0) + payment.amount;
      }
    });

    const chartData = Object.keys(paymentsByDay)
      .map((date) => ({
        date,
        amount: paymentsByDay[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const paymentStats = {
      totalTrips: tripIds.length,
      totalBookings: bookingIds.length,
      totalPayments: payments.length,
      completedPayments: payments.filter((p) => p.status === "completed")
        .length,
      totalEarnings,
      chartData,
    };

    return res.status(200).json(
      createResponse(200, true, [], {
        payments,
        stats: paymentStats,
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
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get all payments within date range
    const allPayments = await Payment.find(dateQuery);

    // Calculate overall statistics
    const totalAmount = allPayments.reduce((sum, payment) => {
      return payment.status === "completed" ? sum + payment.amount : sum;
    }, 0);

    // Group by status
    const paymentsByStatus = {
      completed: allPayments.filter((p) => p.status === "completed").length,
      pending: allPayments.filter((p) => p.status === "pending").length,
      failed: allPayments.filter((p) => p.status === "failed").length,
      canceled: allPayments.filter((p) => p.status === "canceled").length,
    };

    // Group by payment method
    const paymentsByMethod = {};
    allPayments.forEach((payment) => {
      const method = payment.paymentMethod;
      paymentsByMethod[method] = (paymentsByMethod[method] || 0) + 1;
    });

    // Group by day for chart
    const paymentsByDay = {};
    allPayments.forEach((payment) => {
      if (payment.status === "completed") {
        const date = payment.createdAt.toISOString().split("T")[0];
        paymentsByDay[date] = (paymentsByDay[date] || 0) + payment.amount;
      }
    });

    const chartData = Object.keys(paymentsByDay)
      .map((date) => ({
        date,
        amount: paymentsByDay[date],
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get recent payments
    const recentPayments = await Payment.find({})
      .populate({
        path: "booking",
        populate: [
          {
            path: "trip",
            select: "startLocation endLocation",
          },
          {
            path: "user",
            select: "fullName",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(
      createResponse(200, true, [], {
        stats: {
          totalPayments: allPayments.length,
          totalAmount,
          byStatus: paymentsByStatus,
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
