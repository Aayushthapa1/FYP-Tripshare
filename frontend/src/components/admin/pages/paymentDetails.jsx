import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentDetails } from '../../Slices/paymentSlice';

const PaymentDetails = () => {
  const { paymentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPayment, loading, error } = useSelector(state => state.payment);

  useEffect(() => {
    if (paymentId) {
      dispatch(getPaymentDetails(paymentId));
    }
  }, [dispatch, paymentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="text-center py-8">
        <p>No payment found with ID: {paymentId}</p>
        <button
          onClick={() => navigate('/admin/payments')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Details</h1>
        <button
          onClick={() => navigate('/admin/payments')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Payments
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the payment transaction.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment._id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Rs. {payment.amount.toFixed(2)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {payment.status}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{payment.paymentMethod}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {payment.transactionId || 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(payment.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {user && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the user who made the payment.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name || 'N/A'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {booking && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the associated booking.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Booking ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking._id}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Seats Booked</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.seatsBooked}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Booking Status</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'booked' ? 'bg-blue-100 text-blue-800' : 
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {booking.status}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {booking.paymentStatus}
                  </span>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(booking.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {trip && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Trip Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the associated trip.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Trip ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip._id}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">From</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.startLocation}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">To</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{trip.endLocation}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Departure Time</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(trip.departureTime).toLocaleString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fare</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Rs. {trip.fare.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;