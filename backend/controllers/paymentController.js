import Payment from "../models/paymentModel.js"
import Booking from "../models/bookingModel.js"
import { createResponse } from "../utils/responseHelper.js"
import axios from "axios"
import _config from "../utils/config.js"
import Trip from "../models/TripModel.js"


/**
* INITIATE PAYMENT (handles eSewa, COD directly,
* and initiates Khalti "Web Checkout").
*/
// In your payment controller
export const initiatePayment = async (req, res, next) => {
  try {
    const { userId, bookingId, tripId, seats, amount, bookingType } = req.body;
    const user = req.user._id;

    // Create Payment record with appropriate fields
    const paymentData = {
      user,
      amount, 
      paymentMethod: "khalti",
      status: "pending",
      bookingType: bookingType || "trip"
    };
    
    // Handle different scenarios
    if (bookingId) {
      // If bookingId is provided, use it
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json(createResponse(404, false, [{ message: "Booking not found" }]));
      }
      
      paymentData.booking = bookingId;
    } 
    else if (tripId) {
      // For direct trip payments without booking
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json(createResponse(404, false, [{ message: "Trip not found" }]));
      }
      
      if (trip.availableSeats < seats) {
        return res.status(400).json(createResponse(400, false, [{ 
          message: `Not enough seats available. Requested: ${seats}, Available: ${trip.availableSeats}` 
        }]));
      }
      
      paymentData.tripId = tripId;
      paymentData.seats = seats;
    }
    else {
      return res.status(400).json(createResponse(400, false, [{ 
        message: "Either bookingId or tripId must be provided" 
      }]));
    }

    // Create the payment record
    const payment = await Payment.create(paymentData);
    const backendUrl = "http://localhost:3301"; // Replace with your actual backend URL
    const frontendUrl = "http://localhost:5173";

    // Convert to paisa for Khalti
    const amountInPaisa = amount * 100;

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
      }
    };

    const headers = {
      Authorization: `Key ${_config.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    // Call Khalti API
    const khaltiResponse = await axios.post(
      `https://a.khalti.com/api/v2/epayment/initiate/`, 
      khaltiPaymentData, 
      { headers }
    );

    const { pidx, payment_url, expires_at } = khaltiResponse.data;

    // Update payment with Khalti token
    payment.khaltiToken = pidx;
    await payment.save();

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
    // Khalti sends us query params
    const {
      pidx,
      transaction_id,
      amount,
      purchase_order_id,
      status,
    } = req.query;

    console.log("Khalti callback received:", req.query);

    // Create a correct URL without double slashes
    const khaltiBaseUrl = "https://a.khalti.com";
    const lookupUrl = `${khaltiBaseUrl}/api/v2/epayment/lookup/`;
    
    // Ensure the URL is properly formatted (no double slashes)
    const cleanUrl = lookupUrl.replace(/([^:]\/)\/+/g, "$1");
    
    console.log("Using Khalti lookup URL:", cleanUrl);

    const headers = {
      Authorization: `Key ${_config.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    if (!pidx) {
      return res.status(400).send("Missing pidx in Khalti callback query string");
    }

    // Fetch Payment doc
    const payment = await Payment.findById(purchase_order_id);
    if (!payment) {
      return res.status(404).send("Payment record not found");
    }

    // Call epayment/lookup with the corrected URL
    const lookupResponse = await axios.post(
      cleanUrl, 
      { pidx }, 
      { headers }
    );

    // Rest of your code remains the same
    const paymentInfo = lookupResponse.data;
    
    if (!paymentInfo) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).send("No payment info from Khalti");
    }

    // Also fix the redirect URLs
    const frontendUrl = "http://localhost:5173"; // Replace with your actual frontend URL

    if (paymentInfo.status === "Completed") {
      // Update payment and booking as before
      payment.status = "completed";
      payment.transactionId = paymentInfo.transaction_id;
      payment.khaltiToken = pidx;
      await payment.save();

      // Update booking
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = "paid";
        booking.status = "completed"; 
        await booking.save();
      } else {
        // Handle case where payment was for a trip without a pre-created booking
        if (payment.tripId && payment.seats) {
          // Create the booking now
          const booking = await Booking.create({
            trip: payment.tripId,
            user: payment.user,
            seatsBooked: payment.seats,
            paymentMethod: "online",
            paymentStatus: "paid",
            status: "booked"
          });
          
          // Update trip available seats
          const trip = await Trip.findById(payment.tripId);
          if (trip) {
            trip.availableSeats -= payment.seats;
            await trip.save();
          }
          
          // Link booking to payment
          payment.booking = booking._id;
          await payment.save();
        }
      }

      return res.redirect(`${frontendUrl}/payment-success`);
    } else if (paymentInfo.status === "User canceled") {
      payment.status = "canceled";
      await payment.save();
      return res.redirect(`${frontendUrl}/payment-cancel`);
    } else {
      payment.status = "failed";
      await payment.save();
      return res.redirect(`${frontendUrl}/payment-failed`);
    }
  } catch (error) {
    console.error("Error completing Khalti Payment:", error);
    const { purchase_order_id } = req.query;
    if (purchase_order_id) {
      await Payment.findByIdAndUpdate(purchase_order_id, { status: "failed" });
    }
    return res.redirect("http://localhost:5173/payment-error"); // Hardcoded fallback URL
  }
};


/**
* Get details of a specific payment
*/
export const getPaymentDetails = async (req, res, next) => {
 try {
   const { paymentId } = req.params


   const payment = await Payment.findById(paymentId).populate("booking").populate("user", "name email")


   if (!payment) {
     return res.status(404).json(createResponse(404, false, [{ message: "Payment not found" }]))
   }


   return res.status(200).json(
     createResponse(200, true, [], {
       payment,
     }),
   )
 } catch (error) {
   console.error("Error fetching payment details:", error)
   next(error)
 }
}


/**
* Get all payments (with optional filtering)
*/
export const getAllPayments = async (req, res, next) => {
 try {
   // You could add filters here based on req.query
   // For example: status, paymentMethod, date range, etc.
   const { status, method, startDate, endDate } = req.query


   const query = {}


   if (status) query.status = status
   if (method) query.paymentMethod = method


   if (startDate && endDate) {
     query.createdAt = {
       $gte: new Date(startDate),
       $lte: new Date(endDate),
     }
   }


   const payments = await Payment.find(query)
     .populate("booking")
     .populate("user", "name email")
     .sort({ createdAt: -1 })


   return res.status(200).json(
     createResponse(200, true, [], {
       count: payments.length,
       payments,
     }),
   )
 } catch (error) {
   console.error("Error fetching all payments:", error)
   next(error)
 }
}


/**
* Helper function for eSewa verification (if needed)
*/
const verifyEsewaPayment = async (transactionId, amount) => {
 try {
   // Example config
   const eSewaConfig = {
     MERCHANT_ID: _config.ESEWA_MERCHANT_ID,
     SECRET_KEY: _config.ESEWA_SECRET_KEY,
   }


   // STILL depends on eSewa's doc. This is a placeholder.
   const response = await axios.post("https://uat.esewa.com.np/epay/transrec", {
     amt: amount,
     scd: eSewaConfig.MERCHANT_ID,
     rid: transactionId,
   })


   return response.data === "Success"
 } catch (error) {
   console.error("eSewa verification error:", error)
   return false
 }
}
