// // paymentModel.js
// import mongoose from "mongoose";

// const PaymentSchema = new mongoose.Schema(
//   {
//     amount: { 
//       type: Number, 
//       required: true,
//       min: [10, "Amount must be at least 10"],
//       max: [100000, "Amount cannot exceed 100000"]
//     },
//     method: { 
//       type: String, 
//       required: true,
//       enum: {
//         values: ['esewa', 'khalti'],
//         message: '{VALUE} is not a supported payment method'
//       }
//     },
//     transactionId: { 
//       type: String, 
//       required: true,
//       unique: true,
//       index: true
//     },
//     status: { 
//       type: String, 
//       default: "pending",
//       enum: {
//         values: ['pending', 'success', 'failed', 'expired'],
//         message: '{VALUE} is not a valid status'
//       }
//     },
//     metadata: {
//       ipAddress: String,
//       userAgent: String,
//       referenceId: String
//     },
//     errorMessage: String,
//     successResponse: Object
//   },
//   { 
//     timestamps: true 
//   }
// );

// // Add indexes for better query performance
// PaymentSchema.index({ createdAt: 1 });
// PaymentSchema.index({ status: 1 });

// export default mongoose.model("Payment", PaymentSchema);