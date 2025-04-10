import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings } from "../Slices/bookingSlice";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const BookingsList = () => {
  const dispatch = useDispatch();
  const { myBookings, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return <span className="badge badge-warning">Booked</span>;
      case "confirmed":
        return <span className="badge badge-success">Confirmed</span>;
      case "completed":
        return <span className="badge badge-info">Completed</span>;
      case "cancelled":
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-secondary">Unknown</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "booked":
        return <FaClock className="status-icon text-warning" />;
      case "confirmed":
        return <FaCheckCircle className="status-icon text-success" />;
      case "completed":
        return <FaCheckCircle className="status-icon text-info" />;
      case "cancelled":
        return <FaTimesCircle className="status-icon text-danger" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="booking-list-container">
        <div className="loading-spinner">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-list-container">
        <div className="alert alert-danger">
          <h4>Error loading bookings</h4>
          <p>{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => dispatch(fetchMyBookings())}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-list-container">
      <h2 className="page-title">My Bookings</h2>

      {myBookings.length === 0 ? (
        <div className="no-bookings-message">
          <p>You don't have any bookings yet.</p>
          <Link to="/trips" className="btn btn-primary">
            Find a Trip
          </Link>
        </div>
      ) : (
        <div className="booking-cards">
          {myBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <div className="trip-route">
                  <FaMapMarkerAlt className="icon" />
                  <span>
                    {booking.trip.origin} → {booking.trip.destination}
                  </span>
                </div>
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className="booking-card-body">
                <div className="booking-info">
                  <div className="info-item">
                    <FaCalendarAlt className="icon" />
                    <span>
                      {new Date(
                        booking.trip.departureTime
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        booking.trip.departureTime
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="info-item">
                    <FaUser className="icon" />
                    <span>Driver: {booking.trip.driver.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span>Seats: {booking.seatsBooked}</span>
                  </div>
                  <div className="info-item">
                    <span>
                      Payment: {booking.paymentMethod} ({booking.paymentStatus})
                    </span>
                  </div>
                </div>

                <div className="booking-status-tracker">
                  <div className="status-line"></div>
                  <div
                    className={`status-step ${
                      booking.status !== "cancelled" ? "active" : ""
                    }`}
                  >
                    <div className="status-dot"></div>
                    <div className="status-label">Booked</div>
                  </div>
                  <div
                    className={`status-step ${
                      booking.status === "confirmed" ||
                      booking.status === "completed"
                        ? "active"
                        : ""
                    }`}
                  >
                    <div className="status-dot"></div>
                    <div className="status-label">Confirmed</div>
                  </div>
                  <div
                    className={`status-step ${
                      booking.status === "completed" ? "active" : ""
                    }`}
                  >
                    <div className="status-dot"></div>
                    <div className="status-label">Completed</div>
                  </div>
                </div>
              </div>

              <div className="booking-card-footer">
                <Link
                  to={`/bookings/${booking._id}`}
                  className="btn btn-outline-primary"
                >
                  View Details
                </Link>
                {booking.status === "booked" && (
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="btn btn-outline-danger"
                  >
                    Cancel
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .booking-list-container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .page-title {
          margin-bottom: 24px;
          font-size: 24px;
          font-weight: 600;
        }

        .no-bookings-message {
          text-align: center;
          padding: 40px 0;
        }

        .booking-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .booking-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .booking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .trip-route {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .icon {
          color: #666;
        }

        .badge {
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-warning {
          background-color: #fff3cd;
          color: #856404;
        }

        .badge-success {
          background-color: #d4edda;
          color: #155724;
        }

        .badge-info {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .badge-danger {
          background-color: #f8d7da;
          color: #721c24;
        }

        .booking-card-body {
          padding: 16px;
        }

        .booking-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .booking-status-tracker {
          position: relative;
          display: flex;
          justify-content: space-between;
          padding: 20px 0;
          margin-top: 20px;
        }

        .status-line {
          position: absolute;
          top: 30px;
          left: 0;
          right: 0;
          height: 2px;
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

        .status-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #e0e0e0;
          margin-bottom: 8px;
        }

        .status-step.active .status-dot {
          background-color: #28a745;
        }

        .status-label {
          font-size: 12px;
          font-weight: 500;
        }

        .booking-card-footer {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 8px 16px;
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

        .btn-outline-danger {
          background-color: transparent;
          color: #dc3545;
          border: 1px solid #dc3545;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px 0;
        }
      `}</style>
    </div>
  );
};

export default BookingsList;
