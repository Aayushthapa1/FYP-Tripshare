import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  deleteExistingTrip,
  updateExistingTrip,
  getTripById,
  getTrips 
} from '../Slices/tripSlice';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

const TripList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { trips, loading, error, currentTrip } = useSelector((state) => state.trip);

  useEffect(() => {
    dispatch(getTrips());
  }, [dispatch]);

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await dispatch(deleteExistingTrip(tripId)).unwrap();
        toast.success('Trip deleted successfully');
        // Refresh the list after deletion
        dispatch(getTrips());
      } catch (error) {
        toast.error(error || 'Failed to delete trip');
      }
    }
  };

  const handleEditNavigation = (tripId) => {
    // Fetch specific trip data before navigation
    dispatch(getTripById(tripId));
    navigate(`/trips/edit/${tripId}`);
  };

  const handleStatusUpdate = async (tripId, currentStatus) => {
    try {
      await dispatch(updateExistingTrip({
        tripId,
        tripData: { status: currentStatus === 'active' ? 'canceled' : 'active' }
      })).unwrap();
      toast.success('Trip status updated');
      dispatch(getTrips());
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="top-right" richColors />
      <h1 className="text-2xl font-bold mb-6">Your Trips</h1>
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  {trip.departureLocation} → {trip.destinationLocation}
                </h2>
                <p className="text-gray-600">
                  {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-sm rounded ${
                  trip.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {trip.status}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusUpdate(trip._id, trip.status)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Toggle Status
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNavigation(trip._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList;