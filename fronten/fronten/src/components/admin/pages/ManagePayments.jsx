// src/components/admin/pages/ManagePayments.jsx

import React, { useState, useEffect } from 'react';

function ManagePayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Mock or real API data
    setPayments([
      {
        id: 201,
        user: 'John Doe',
        amount: 45.99,
        date: '2023-06-10',
        status: 'Completed',
      },
      {
        id: 202,
        user: 'Jane Smith',
        amount: 12.5,
        date: '2023-06-11',
        status: 'Pending',
      },
    ]);
  }, []);

  return (
    <div className="bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Manage Payments</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">User</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr className="border-b" key={payment.id}>
                <td className="py-2 px-3">{payment.user}</td>
                <td className="py-2 px-3">${payment.amount.toFixed(2)}</td>
                <td className="py-2 px-3">{payment.date}</td>
                <td className="py-2 px-3">
                  {payment.status === 'Completed' && (
                    <span className="text-green-600 font-medium">Completed</span>
                  )}
                  {payment.status === 'Pending' && (
                    <span className="text-blue-600 font-medium">Pending</span>
                  )}
                  {payment.status === 'Failed' && (
                    <span className="text-red-500 font-medium">Failed</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <button className="mr-2 text-blue-600 hover:underline">Details</button>
                  <button className="text-red-600 hover:underline">Refund</button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="py-2 px-3 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagePayments;
