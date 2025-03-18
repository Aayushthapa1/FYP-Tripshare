import React from "react";
import { useDispatch } from "react-redux";
import { createPayment } from "../Slices/paymentSlice";

const PaymentButton = ({ bookingId, amount }) => {
  const dispatch = useDispatch();

  const handlePayment = (paymentMethod) => {
    let transactionId = null;
    let khaltiToken = null;

    if (paymentMethod === "esewa") {
      transactionId = prompt("Enter eSewa Transaction ID");
    } else if (paymentMethod === "khalti") {
      khaltiToken = prompt("Enter Khalti Payment Token");
    }

    dispatch(
      createPayment({
        bookingId,
        amount,
        paymentMethod,
        transactionId,
        khaltiToken,
      })
    )
      .then(() => alert("Payment successful!"))
      .catch((error) => alert("Payment failed: " + error.message));
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handlePayment("esewa")}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Pay with eSewa
      </button>
      <button
        onClick={() => handlePayment("khalti")}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Pay with Khalti
      </button>
      <button
        onClick={() => handlePayment("COD")}
        className="bg-gray-600 text-white px-4 py-2 rounded"
      >
        Cash on Delivery (COD)
      </button>
    </div>
  );
};

export default PaymentButton;
