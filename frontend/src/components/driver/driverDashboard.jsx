import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const DriverDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    try {
      const response = await fetch('/api/trips/my-trips', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.IsSuccess) {
        setTrips(data.Data.trips);
      } else {
        toast.error(data.ErrorMessage?.[0]?.message || 'Failed to fetch trips');
      }
    } catch (error) {
      toast.error('Error fetching trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const response = await fetch(`/api/trips/${tripId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await response.json();

        if (data.IsSuccess) {
          toast.success('Trip deleted successfully');
          fetchMyTrips();
        } else {
          toast.error(data.ErrorMessage?.[0]?.message || 'Failed to delete trip');
        }
      } catch (error) {
        toast.error('Error deleting trip');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
        <button
          onClick={() => navigate('/trips/create')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No trips found</h3>
          <p className="mt-2 text-gray-600">Get started by creating a new trip.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {trip.departureLocation} → {trip.destinationLocation}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/trips/edit/${trip._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">₹{trip.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Seats:</span>
                  <span className="font-medium">{trip.availableSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${
                    trip.status === 'scheduled' ? 'text-green-600' :
                    trip.status === 'in-progress' ? 'text-blue-600' :
                    trip.status === 'completed' ? 'text-gray-600' :
                    'text-red-600'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </div>

              {trip.description && (
                <p className="mt-4 text-sm text-gray-600 border-t pt-4">
                  {trip.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;