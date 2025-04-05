// Bookinglist.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBookingDetails } from "../Slices/bookingSlice";

const Bookinglist = () => {
  const { bookingId } = useParams();
  console.log("Booking ID:", bookingId);
  const dispatch = useDispatch();

  // Destructure the relevant parts of your booking slice state
  const { booking, isLoading, isError, message } = useSelector(
    (state) => state.booking
  );

  // Debug: Component mount and bookingId
  useEffect(() => {
    console.log("Component mounted with bookingId:", bookingId);
    return () => {
      console.log("Component unmounting");
    };
  }, []);

  // Debug: State changes
  useEffect(() => {
    console.log("Current booking state:", {
      booking,
      isLoading,
      isError,
      message,
    });
  }, [booking, isLoading, isError, message]);

  // Fetch booking details when the component mounts or when bookingId changes
  useEffect(() => {
    if (bookingId) {
      console.log("Fetching booking details for ID:", bookingId);
      dispatch(getBookingDetails(bookingId))
        .then((result) => {
          console.log("Booking details fetch result:", result);
        })
        .catch((error) => {
          console.error("Error fetching booking details:", error);
        });
    }
  }, [dispatch, bookingId]);

  // Debug: Loading state
  if (isLoading) {
    console.log("Rendering loading state");
    return <div className="p-4 text-center">Loading booking details...</div>;
  }

  // Debug: Error state
  if (isError) {
    console.error("Rendering error state:", message);
    return <div className="p-4 text-center text-red-500">Error: {message}</div>;
  }

  // Debug: Before rendering main UI
  console.log("Rendering main UI with booking data:", booking);

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
        </div>
      ) : (
        <p className="text-center">No booking details found.</p>
      )}
    </div>
  );
};

export default Bookinglist;
