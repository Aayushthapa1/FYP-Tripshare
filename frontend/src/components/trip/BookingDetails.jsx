import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBookingDetails, cancelBooking } from "../Slices/bookingSlice";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaSeatReclined, FaCreditCard, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import io from "socket.io-client";
import { Base_Backend_Url } from "../../constant";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { booking, loading, error } = useSelector((state) => state.booking);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    dispatch(getBookingDetails(bookingId));
    
    // Connect to socket
    const newSocket = io(Base_Backend_Url);
    setSocket(newSocket);
    
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [dispatch, bookingId]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for booking status updates
    socket.on("booking_confirmed", (data) => {
      if (data.bookingId === bookingId) {
        dispatch(getBookingDetails(bookingId));
        showNotification("Booking Confirmed", "Your booking has been confirmed by the driver.");
      }
    });
    
    socket.on("booking_rejected", (data) => {
      if (data.bookingId === bookingId) {
        dispatch(getBookingDetails(bookingId));
        showNotification("Booking Rejected", "Your booking has been rejected by the driver.");
      }
    });
    
    socket.on("booking_completed", (data) => {
      if (data.bookingId === bookingId) {
        dispatch(getBookingDetails(bookingId));
        showNotification("Ride Completed", "Your ride has been marked as completed.");
      }
    });
    
    return () => {
      socket.off("booking_confirmed");
      socket.off("booking_rejected");
      socket.off("booking_completed");
    };
  }, [socket, bookingId, dispatch]);

  const showNotification = (title, message) => {
    // You can implement your notification system here
    // For simplicity, we'll use alert
    alert(`${title}: ${message}`);
  };

  const handleCancelBooking = () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(cancelBooking(bookingId))
        .unwrap()
        .then(() => {
          showNotification("Booking Cancelled", "Your booking has been cancelled successfully.");
          setTimeout(() => navigate("/bookings"), 2000);
        })
        .catch((err) => {
          showNotification("Error", `Failed to cancel booking: ${err}`);
        });
    }
  };

  if (loading) {
    return (
      <div className="booking-details-container">
        <div className="loading-spinner">Loading booking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-details-container">
        <div className="alert alert-danger">
          <h4>Error loading booking details</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={() => dispatch(getBookingDetails(bookingId))}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-details-container">
        <div className="alert alert-warning">
          <h4>Booking not found</h4>
          <p>The booking you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-details-container">
      <div className="booking-details-card">
        <div className="booking-header">
          <h2>Booking Details</h2>
          <div className={`booking-status status-${booking.status}`}>
            {booking.status === "booked" && <span className="status-badge">Booked</span>}
            {booking.status === "confirmed" && <span className="status-badge">Confirmed</span>}
            {booking.status === "completed" && <span className="status-badge">Completed</span>}
            {booking.status === "cancelled" && <span className="status-badge">Cancelled</span>}
          </div>
        </div>
        
        <div className="booking-trip-info">
          <h3>
            <FaMapMarkerAlt className="icon" />
            {booking.trip.origin} → {booking.trip.destination}
          </h3>
          <p className="booking-date">
            <FaCalendarAlt className="icon" />
            {new Date(booking.trip.departureTime).toLocaleDateString()} at {new Date(booking.trip.departureTime).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="status-tracker">
          <div className="status-line"></div>
          <div className={`status-step ${booking.status !== "cancelled" ? "active" : ""}`}>
            <div className="status-icon">
              {booking.status !== "cancelled" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div className="status-label">Booked</div>
            <div className="status-time">
              {new Date(booking.createdAt).toLocaleTimeString()}
            </div>
          </div>
          
          <div className={`status-step ${booking.status === "confirmed" || booking.status === "completed" ? "active" : ""}`}>
            <div className="status-icon">
              {booking.status === "confirmed" || booking.status === "completed" ? <FaCheckCircle /> : null}
            </div>
            <div className="status-label">Confirmed</div>
            {booking.status === "confirmed" || booking.status === "completed" ? (
              <div className="status-time">
                {/* You would need to store the confirmation time in your backend */}
                {/* For now, we'll just show "By Driver" */}
                By Driver
              </div>
            ) : null}
          </div>
          
          <div className={`status-step ${booking.status === "completed" ? "active" : ""}`}>
            <div className="status-icon">
              {booking.status === "completed" ? <FaCheckCircle /> : null}
            </div>
            <div className="status-label">Completed</div>
            {booking.status === "completed" ? (
              <div className="status-time">
                {/* You would need to store the completion time in your backend */}
                Ride Finished
              </div>
            ) : null}
          </div>
        </div>
        
        <div className="booking-details-section">
          <h4>Driver Information</h4>
          <div className="details-grid">
            <div className="detail-item">
              <FaUser className="icon" />
              <div>
                <span className="label">Name</span>
                <span className="value">{booking.trip.driver.fullName}</span>
              </div>
            </div>
            <div className="detail-item">
              <FaPhone className="icon" />
              <div>
                <span className="label">Phone</span>
                <span className="value">{booking.trip.driver.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="booking-details-section">
          <h4>Booking Information</h4>
          <div className="details-grid">
            <div className="detail-item">
              <FaSeatReclined className="icon" />
              <div>
                <span className="label">Seats Booked</span>
                <span className="value">{booking.seatsBooked}</span>
              </div>
            </div>
            <div className="detail-item">
              <FaCreditCard className="icon" />
              <div>
                <span className="label">Payment Method</span>
                <span className="value">{booking.paymentMethod}</span>
              </div>
            </div>
            <div className="detail-item">
              <div>
                <span className="label">Payment Status</span>
                <span className={`value payment-status-${booking.paymentStatus}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div>
                <span className="label">Booking Date</span>
                <span className="value">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {booking.status === "booked" && (
          <div className="booking-actions">
            <button className="btn btn-danger" onClick={handleCancelBooking}>
              Cancel Booking
            </button>
          </div>
        )}
        
        {booking.status === "confirmed" && (
          <div className="booking-alert success">
            <FaCheckCircle className="alert-icon" />
            <div>
              <h5>Booking Confirmed</h5>
              <p>Your booking has been confirmed by the driver. Please be at the pickup location on time.</p>
            </div>
          </div>
        )}
        
        {booking.status === "completed" && (
          <div className="booking-alert info">
            <FaCheckCircle className="alert-icon" />
            <div>
              <h5>Ride Completed</h5>
              <p>This ride has been completed. Thank you for using our service!</p>
            </div>
          </div>
        )}
        
        {booking.status === "cancelled" && (
          <div className="booking-alert danger">
            <FaTimesCircle className="alert-icon" />
            <div>
              <h5>Booking Cancelled</h5>
              <p>This booking has been cancelled.</p>
            </div>
          </div>
        )}
        
        <div className="booking-footer">
          <button className="btn btn-outline-primary" onClick={() => navigate("/bookings")}>
            Back to All Bookings
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .booking-details-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .booking-details-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
        }
        
        .booking-status {
          padding: 6px 12px;
          border-radius: 20px;
        }
        
        .status-booked {
          background-color: #fff3cd;
        }
        
        .status-confirmed {
          background-color: #d4edda;
        }
        
        .status-completed {
          background-color: #d1ecf1;
        }
        
        .status-cancelled {
          background-color: #f8d7da;
        }
        
        .status-badge {
          font-weight: 600;
          font-size: 14px;
        }
        
        .booking-trip-info {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-trip-info h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        
        .booking-date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          margin: 0;
        }
        
        .status-tracker {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 30px 40px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .status-line {
          position: absolute;
          top: 50px;
          left: 60px;
          right: 60px;
          height: 3px;
          background-color: #e0e0e0;
          z-index: 1;
        }
        
        .status-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        
        .status-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #f8f9fa;
          border: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: #e0e0e0;
        }
        
        .status-step.active .status-icon {
          background-color: #28a745;
          border-color: #28a745;
          color: white;
        }
        
        .status-label {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .status-time {
          font-size: 12px;
          color: #666;
        }
        
        .booking-details-section {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-details-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .icon {
          color: #666;
          margin-top: 2px;
        }
        
        .label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .value {
          font-weight: 500;
        }
        
        .payment-status-paid {
          color: #28a745;
        }
        
        .payment-status-pending {
          color: #ffc107;
        }
        
        .payment-status-failed {
          color: #dc3545;
        }
        
        .booking-actions {
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-alert h5 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .booking-alert p {
          margin: 0;
        }
        
        .alert-icon {
          margin-top: 2px;
          font-size: 20px;
        }
        
        .success {
          background-color: #f8fff9;
        }
        
        .success .alert-icon {
          color: #28a745;
        }
        
        .info {
          background-color: #f8fdff;
        }
        
        .info .alert-icon {
          color: #17a2b8;
        }
        
        .danger {
          background-color: #fff8f8;
        }
        
        .danger .alert-icon {
          color: #dc3545;
        }
        
        .booking-footer {
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        
        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
        }
        
        .btn-outline-primary {
          background-color: transparent;
          color: #007bff;
          border: 1px solid #007bff;
        }
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
          border: none;
        }
        
        .btn-outline-danger {
          background-color: transparent;
          color: #dc3545;
          border: 1px solid #dc3545;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 40px 0;
        }
        
        .alert {
          padding: 16px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .alert-danger {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        .alert-warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }
      `}</style>
    </div>
  );
};

export default BookingDetails;
