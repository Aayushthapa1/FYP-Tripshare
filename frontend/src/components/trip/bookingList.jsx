// Bookinglist.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBookingDetails } from "../Slices/bookingSlice"; // <-- Adjust path if needed

const Bookinglist = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();

  // Destructure the relevant parts of your booking slice state
  const { booking, isLoading, isError, message } = useSelector(
    (state) => state.booking
  );

  // Fetch booking details when the component mounts or when bookingId changes
  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingDetails(bookingId));
    }
  }, [dispatch, bookingId]);

  // Loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading booking details...</div>;
  }

  // Error state
  if (isError) {
    return <div className="p-4 text-center text-red-500">Error: {message}</div>;
  }

  // Main UI
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
      {booking ? (
        <div className="bg-white p-6 rounded shadow-md">
          <p>
            <strong>Booking ID:</strong> {booking._id}
          </p>
          <p>
            <strong>User:</strong> {booking.user?.fullName} (
            {booking.user?.email})
          </p>
          <p>
            <strong>Phone:</strong> {booking.user?.phoneNumber}
          </p>
          {booking.trip && (
            <>
              <p>
                <strong>Trip ID:</strong> {booking.trip._id}
              </p>
              {booking.trip.driver && (
                <div>
                  <p>
                    <strong>Driver:</strong> {booking.trip.driver.fullName}
                  </p>
                  <p>
                    <strong>Driver Phone:</strong>{" "}
                    {booking.trip.driver.phoneNumber}
                  </p>
                </div>
              )}
            </>
          )}
          {/* Add additional booking fields as needed */}
        </div>
      ) : (
        <p className="text-center">No booking details found.</p>
      )}
    </div>
  );
};

export default Bookinglist;
