import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import { createResponse } from "../utils/responseHelper.js";
import axios from "axios";

/**
 * CREATE PAYMENT - Handles all payment methods
 */
export const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod, transactionId, khaltiToken } = req.body;
    const userId = req.user._id; 

    // Validate booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json(createResponse(404, false, [{ message: "Booking not found" }]));
    }

    // Ensure user is the owner of the booking
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json(createResponse(403, false, [{ message: "Unauthorized" }]));
    }

    // Check if booking is already paid
    if (booking.paymentStatus === "paid") {
      return res.status(400).json(createResponse(400, false, [{ message: "Booking already paid" }]));
    }

    // Create a payment record with "pending" status
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount,
      paymentMethod,
      status: "pending",
      transactionId: paymentMethod === "esewa" ? transactionId : null,
      khaltiToken: paymentMethod === "khalti" ? khaltiToken : null,
    });

    let isPaymentVerified = false;

    // Handle different payment methods
    if (paymentMethod === "esewa") {
      isPaymentVerified = await verifyEsewaPayment(transactionId, amount);
    } else if (paymentMethod === "khalti") {
      isPaymentVerified = await verifyKhaltiPayment(khaltiToken, amount);
    } else if (paymentMethod === "bank_transfer" || paymentMethod === "COD") {
      isPaymentVerified = true; // Assume success for offline payments
    }

    if (!isPaymentVerified) {
      return res.status(400).json(createResponse(400, false, [{ message: "Payment verification failed" }]));
    }

    // Update payment and booking status
    payment.status = "completed";
    await payment.save();
    
    booking.paymentStatus = "paid";
    booking.status = "completed";
    await booking.save();

    return res.status(201).json(
      createResponse(201, true, [], {
        message: "Payment successful",
        payment,
      })
    );
  } catch (error) {
    console.error("Error in createPayment:", error);
    next(error);
  }
};

/**
 * GET Payment Details by paymentId
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment) {
      return res.status(404).json(createResponse(404, false, [{ message: "Payment not found" }]));
    }
    return res.status(200).json(createResponse(200, true, [], { payment }));
  } catch (error) {
    console.error("Error in getPaymentDetails:", error);
    next(error);
  }
};

/**
 * GET All Payments for the Logged-in User
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId }).populate("booking").sort({ createdAt: -1 });

    return res.status(200).json(createResponse(200, true, [], { payments }));
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    next(error);
  }
};

/**
 * VERIFY eSewa Payment
 */
const verifyEsewaPayment = async (transactionId, amount) => {
  try {
    const eSewaConfig = {
      MERCHANT_ID: "YOUR_ESEWA_MERCHANT_ID",
      SECRET_KEY: "YOUR_ESEWA_SECRET_KEY",
    };

    const response = await axios.post("https://uat.esewa.com.np/epay/transrec", {
      amt: amount,
      scd: eSewaConfig.MERCHANT_ID,
      rid: transactionId,
    });

    return response.data === "Success";
  } catch (error) {
    console.error("eSewa verification error:", error);
    return false;
  }
};

/**
 * VERIFY Khalti Payment
 */
const verifyKhaltiPayment = async (khaltiToken, amount) => {
  try {
    const KHALTI_SECRET_KEY = "YOUR_KHALTI_SECRET_KEY";
    
    const response = await axios.post("https://khalti.com/api/v2/payment/verify/", {
      token: khaltiToken,
      amount: amount * 100, // Khalti uses paisa, so multiply by 100
    }, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
      },
    });

    return response.data?.status === "Completed";
  } catch (error) {
    console.error("Khalti verification error:", error);
    return false;
  }
};
