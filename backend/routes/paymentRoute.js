// // routes/payment.routes.js
// import express from "express";
// import { processPayment, esewaSuccess, khaltiSuccess } from "../controllers/paymentController.js";
// import { validateRequest } from '../middlewares/validateRequest.js';
// import { paymentSchema } from '../middlewares/validationSchema.js';

// const router = express.Router();

// router.post("/", validateRequest(paymentSchema), processPayment);
// router.get("/esewa-success", esewaSuccess);
// router.post("/khalti-success", khaltiSuccess);

// export default router;