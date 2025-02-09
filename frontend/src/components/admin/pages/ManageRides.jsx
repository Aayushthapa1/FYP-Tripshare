// src/components/admin/pages/ManageRides.jsx

import React, { useState, useEffect } from 'react';

function ManageRides() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    // Mock data or fetch from your API
    setRides([
      {
        id: 101,
        driver: 'Jane Smith',
        pickup: 'City A',
        dropoff: 'City B',
        date: '2023-05-18',
        status: 'In Progress',
      },
      {
        id: 102,
        driver: 'John Doe',
        pickup: 'City C',
        dropoff: 'City D',
        date: '2023-06-01',
        status: 'Completed',
      },
    ]);
  }, []);

  return (
    <div className="bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Manage Rides</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">Driver</th>
              <th className="py-2 px-3">Pickup</th>
              <th className="py-2 px-3">Dropoff</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr className="border-b" key={ride.id}>
                <td className="py-2 px-3">{ride.driver}</td>
                <td className="py-2 px-3">{ride.pickup}</td>
                <td className="py-2 px-3">{ride.dropoff}</td>
                <td className="py-2 px-3">{ride.date}</td>
                <td className="py-2 px-3">
                  {ride.status === 'In Progress' && (
                    <span className="text-blue-600 font-medium">In Progress</span>
                  )}
                  {ride.status === 'Completed' && (
                    <span className="text-green-600 font-medium">Completed</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <button className="mr-2 text-blue-600 hover:underline">View</button>
                  <button className="text-red-600 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
            {rides.length === 0 && (
              <tr>
                <td colSpan="6" className="py-2 px-3 text-center text-gray-500">
                  No rides found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageRides;
