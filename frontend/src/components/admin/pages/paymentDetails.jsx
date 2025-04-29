import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentDetails } from "../../Slices/paymentSlice";
import {
  ArrowLeft,
  // DollarSign,
  User,
  Calendar,
  CreditCard,
  TruckIcon,
  MapPin,
  Tag,
} from "lucide-react";

const PaymentDetails = () => {
  const { paymentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPayment, loading, error } = useSelector(
    (state) => state.payment
  );

  useEffect(() => {
    if (paymentId) {
      dispatch(getPaymentDetails(paymentId));
    }
  }, [dispatch, paymentId]);

  // Format status for better display
  const formatStatus = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A";
  };

  // Get CSS classes for status badges
  const getStatusClasses = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
      case "booked":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => navigate("/admin/payments")}
          className="mt-4 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payments
        </button>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-lg text-gray-700 mb-4">
          No payment found with ID: {paymentId}
        </p>
        <button
          onClick={() => navigate("/admin/payments")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payments
        </button>
      </div>
    );
  }

  const { payment } = currentPayment;
  const booking = payment?.booking;
  const trip = booking?.trip;
  const user = payment?.user;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Details
            </h1>
            <p className="text-gray-500 mt-1">Payment ID: {payment._id}</p>
          </div>
          <button
            onClick={() => navigate("/admin/payments")}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </button>
        </div>

        {/* Payment Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-5">
            <div className="flex items-center space-x-2 mb-1">
              {/* <DollarSign className="h-5 w-5 text-purple-600" /> */}
              <span className="text-sm font-medium text-gray-600">Amount</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              Rs. {payment.amount.toFixed(2)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-5">
            <div className="flex items-center space-x-2 mb-1">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Method</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {payment.paymentMethod || "N/A"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-5">
            <div className="flex items-center space-x-2 mb-1">
              <Tag className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Status</span>
            </div>
            <div className="flex items-center">
              <span
                className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusClasses(
                  payment.status
                )}`}
              >
                {formatStatus(payment.status)}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-5">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Date</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {new Date(payment.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800">
              Payment Information
            </h3>
          </div>
          <div className="p-6">
            <dl className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Transaction ID
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {payment.transactionId || "N/A"}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Payment Date
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {new Date(payment.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Payment Method
                </dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {payment.paymentMethod}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  Rs. {payment.amount.toFixed(2)}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm col-span-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                      payment.status
                    )}`}
                  >
                    {formatStatus(payment.status)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">
                User Information
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">{user.email || "N/A"}</p>
                </div>
              </div>

              <dl className="space-y-4 mt-6">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {user._id || "N/A"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {user.phoneNumber || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Booking and Trip Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Information */}
        {booking && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">
                Booking Information
              </h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Booking ID
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {booking._id}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Seats Booked
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {booking.seatsBooked}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Booking Status
                  </dt>
                  <dd className="text-sm col-span-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Payment Status
                  </dt>
                  <dd className="text-sm col-span-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                        booking.paymentStatus
                      )}`}
                    >
                      {formatStatus(booking.paymentStatus)}
                    </span>
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Booking Date
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {new Date(booking.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Trip Information */}
        {trip && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800">
                Trip Information
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="font-medium text-gray-800">
                      {trip.startLocation}
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 flex-1 mx-4 opacity-50"></div>

                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">To</p>
                    <p className="font-medium text-gray-800">
                      {trip.endLocation}
                    </p>
                  </div>
                </div>
              </div>

              <dl className="space-y-4 mt-6">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Trip ID</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {trip._id}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Departure Time
                  </dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {new Date(trip.departureTime).toLocaleString()}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Fare</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    Rs. {trip.fare.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
