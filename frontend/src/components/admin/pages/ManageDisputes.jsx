// src/components/admin/pages/ManageDisputes.jsx

import React, { useState, useEffect } from 'react';

function ManageDisputes() {
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    // Example data
    setDisputes([
      {
        id: 301,
        user: 'Mike Johnson',
        reason: 'Driver was late',
        date: '2023-06-05',
        status: 'Open',
      },
      {
        id: 302,
        user: 'Sarah Lee',
        reason: 'Incorrect fare charged',
        date: '2023-06-07',
        status: 'Resolved',
      },
    ]);
  }, []);

  return (
    <div className="bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Manage Disputes</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">User</th>
              <th className="py-2 px-3">Reason</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => (
              <tr className="border-b" key={dispute.id}>
                <td className="py-2 px-3">{dispute.user}</td>
                <td className="py-2 px-3">{dispute.reason}</td>
                <td className="py-2 px-3">{dispute.date}</td>
                <td className="py-2 px-3">
                  {dispute.status === 'Open' && (
                    <span className="text-red-500 font-medium">Open</span>
                  )}
                  {dispute.status === 'Resolved' && (
                    <span className="text-green-600 font-medium">Resolved</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <button className="mr-2 text-blue-600 hover:underline">View</button>
                  <button className="text-red-600 hover:underline">Close</button>
                </td>
              </tr>
            ))}
            {disputes.length === 0 && (
              <tr>
                <td colSpan="5" className="py-2 px-3 text-center text-gray-500">
                  No disputes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageDisputes;
