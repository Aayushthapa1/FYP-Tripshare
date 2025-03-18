import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createBooking } from "../Slices/bookingSlice";
import KhaltiPaymentButton from "../layout/PaymentButton"
import { toast } from "sonner";

const BookingConfirmationModal = ({ trip, onClose }) => {
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const response = await dispatch(
        createBooking({ tripId: trip._id, seats: 1, paymentMethod })
      ).unwrap();
      setBooking(response.booking);

      if (paymentMethod === "online") {
        toast.success("Booking created! Please proceed with Khalti payment.");
      } else {
        toast.success("Booking confirmed! Pay at the time of the trip.");
        onClose();
      }
    } catch (err) {
      toast.error(err?.message || "Failed to book ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold">Confirm Booking</h2>
        <p className="text-gray-600">Choose your payment method:</p>

        <div className="flex gap-3 my-3">
          <button
            className={`px-4 py-2 rounded-lg ${
              paymentMethod === "COD"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("COD")}
          >
            Cash on Delivery
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              paymentMethod === "online"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("online")}
          >
            Khalti
          </button>
        </div>

        {paymentMethod === "online" && booking && (
          <KhaltiPaymentButton bookingId={booking._id} amount={trip.price} />
        )}

        <button
          onClick={handleConfirmBooking}
          className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 w-full"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
