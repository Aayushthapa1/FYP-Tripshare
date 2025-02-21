// // paymentController.js
// import axios from "axios";
// import Payment from "../models/paymentModel.js";
// import mongoose from "mongoose";

// // API Constants
// const PAYMENT_URLS = {
//   ESEWA: {
//     development: 'https://uat.esewa.com.np/epay/main',
//     production: 'https://esewa.com.np/epay/main'
//   },
//   KHALTI: {
//     development: 'https://a.khalti.com/api/v2/epayment/initiate/',
//     production: 'https://khalti.com/api/v2/epayment/initiate/'
//   }
// };

// // Generate unique transaction ID
// const generateTransactionId = (prefix) => {
//   return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
// };

// export const processPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { amount, method } = req.body;

//     // Base payment data
//     const paymentData = {
//       amount: Number(amount),
//       method,
//       metadata: {
//         ipAddress: req.ip,
//         userAgent: req.headers['user-agent']
//       }
//     };

//     // Handle eSewa Payment
//     if (method === "esewa") {
//       const transactionId = generateTransactionId('ESW');
//       const successUrl = `${req.protocol}://${req.get('host')}/api/payment/esewa-success`;
//       const failureUrl = `${req.protocol}://${req.get('host')}/api/payment/esewa-failure`;

//       if (!process.env.ESEWA_MERCHANT_CODE) {
//         throw new Error("eSewa merchant code not configured");
//       }

//       const esewaParams = new URLSearchParams({
//         amt: amount,
//         scd: process.env.ESEWA_MERCHANT_CODE,
//         pid: transactionId,
//         su: successUrl,
//         fu: failureUrl
//       });

//       const payment = new Payment({
//         ...paymentData,
//         transactionId
//       });

//       await payment.save({ session });
//       await session.commitTransaction();

//       return res.status(200).json({
//         success: true,
//         message: "eSewa payment initiated",
//         paymentUrl: `${PAYMENT_URLS.ESEWA[process.env.NODE_ENV]}?${esewaParams.toString()}`,
//         transactionId
//       });
//     }

//     // Handle Khalti Payment
//     if (method === "khalti") {
//       const transactionId = generateTransactionId('KHL');
      
//       if (!process.env.KHALTI_SECRET_KEY) {
//         throw new Error("Khalti secret key not configured");
//       }

//       const khaltiPayload = {
//         return_url: `${req.protocol}://${req.get('host')}/api/payment/khalti-success`,
//         website_url: `${req.protocol}://${req.get('host')}`,
//         amount: amount * 100, // Convert to paisa
//         purchase_order_id: transactionId,
//         purchase_order_name: "Purchase",
//         customer_info: {
//           name: "Customer",
//           email: "customer@example.com",
//           phone: "9800000000"
//         }
//       };

//       const khaltiResponse = await axios.post(
//         PAYMENT_URLS.KHALTI[process.env.NODE_ENV],
//         khaltiPayload,
//         {
//           headers: {
//             'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       const payment = new Payment({
//         ...paymentData,
//         transactionId,
//         metadata: {
//           ...paymentData.metadata,
//           khaltiPidx: khaltiResponse.data.pidx
//         }
//       });

//       await payment.save({ session });
//       await session.commitTransaction();

//       return res.status(200).json({
//         success: true,
//         message: "Khalti payment initiated",
//         paymentUrl: khaltiResponse.data.payment_url,
//         transactionId
//       });
//     }

//     throw new Error("Invalid payment method");

//   } catch (error) {
//     await session.abortTransaction();
    
//     if (error.response?.data) {
//       return res.status(error.response.status || 500).json({
//         success: false,
//         message: error.response.data.message || "Payment gateway error",
//         error: error.response.data
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Payment processing failed",
//       error: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });

//   } finally {
//     session.endSession();
//   }
// };

// export const esewaSuccess = async (req, res) => {
//   try {
//     const { oid: transactionId, amt, refId } = req.query;

//     if (!transactionId || !amt || !refId) {
//       throw new Error("Invalid eSewa callback parameters");
//     }

//     const payment = await Payment.findOne({ transactionId });
    
//     if (!payment) {
//       throw new Error("Payment record not found");
//     }

//     if (payment.status === 'success') {
//       return res.redirect(`${process.env.FRONTEND_URL}/payment-success?tid=${transactionId}`);
//     }

//     // Verify amount matches
//     if (Number(amt) !== payment.amount) {
//       payment.status = 'failed';
//       payment.errorMessage = 'Amount mismatch';
//       await payment.save();
//       throw new Error("Payment amount mismatch");
//     }

//     // Update payment status
//     payment.status = 'success';
//     payment.metadata.refId = refId;
//     await payment.save();

//     return res.redirect(`${process.env.FRONTEND_URL}/payment-success?tid=${transactionId}`);

//   } catch (error) {
//     return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=${encodeURIComponent(error.message)}`);
//   }
// };

// export const khaltiSuccess = async (req, res) => {
//   try {
//     const { pidx, transaction_id, purchase_order_id, amount } = req.body;

//     if (!pidx || !transaction_id || !purchase_order_id) {
//       throw new Error("Invalid Khalti callback parameters");
//     }

//     const payment = await Payment.findOne({ transactionId: purchase_order_id });
    
//     if (!payment) {
//       throw new Error("Payment record not found");
//     }

//     if (payment.status === 'success') {
//       return res.redirect(`${process.env.FRONTEND_URL}/payment-success?tid=${purchase_order_id}`);
//     }

//     // Verify amount matches (Khalti amount is in paisa)
//     if (Number(amount) !== payment.amount * 100) {
//       payment.status = 'failed';
//       payment.errorMessage = 'Amount mismatch';
//       await payment.save();
//       throw new Error("Payment amount mismatch");
//     }

//     // Verify payment with Khalti
//     const verificationResponse = await axios.post(
//       'https://khalti.com/api/v2/payment/verify/',
//       { pidx },
//       {
//         headers: {
//           'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     if (verificationResponse.data.status === 'Completed') {
//       payment.status = 'success';
//       payment.metadata.khaltiTransactionId = transaction_id;
//       payment.metadata.verificationData = verificationResponse.data;
//       await payment.save();

//       return res.redirect(`${process.env.FRONTEND_URL}/payment-success?tid=${purchase_order_id}`);
//     }

//     throw new Error("Payment verification failed");

//   } catch (error) {
//     return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?error=${encodeURIComponent(error.message)}`);
//   }
// };

// // Add this new endpoint to check payment status
// export const checkPaymentStatus = async (req, res) => {
//   try {
//     const { transactionId } = req.params;

//     const payment = await Payment.findOne({ transactionId });
    
//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         transactionId: payment.transactionId,
//         status: payment.status,
//         amount: payment.amount,
//         method: payment.method,
//         createdAt: payment.createdAt,
//         updatedAt: payment.updatedAt
//       }
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };