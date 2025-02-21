import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const DriverSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/trips/my-trips', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.IsSuccess) {
        setSchedules(data.Data.trips);
      } else {
        toast.error('Failed to fetch schedules');
      }
    } catch (error) {
      toast.error('Error loading schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.IsSuccess) {
        toast.success('Schedule deleted successfully');
        fetchSchedules();
      } else {
        toast.error('Failed to delete schedule');
      }
    } catch (error) {
      toast.error('Error deleting schedule');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Trip Schedules</h1>
        <button
          onClick={() => navigate('/trips/create')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add New Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No schedules found</h3>
          <p className="mt-2 text-gray-600">Start by creating a new trip schedule.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {schedules.map((schedule) => (
            <div 
              key={schedule._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                    <MapPin className="text-green-600" size={20} />
                    {schedule.departureLocation} → {schedule.destinationLocation}
                  </div>
                  
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      {new Date(schedule.departureDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      {schedule.departureTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      {schedule.availableSeats} seats
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium text-lg">₹{schedule.price}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      schedule.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      schedule.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      schedule.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/trips/edit/${schedule._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {schedule.description && (
                <p className="mt-4 text-gray-600 border-t pt-4">
                  {schedule.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverSchedules;