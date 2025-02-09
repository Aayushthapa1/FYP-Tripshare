// src/components/admin/pages/ManageUsers.jsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate initial data fetch
  useEffect(() => {
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', created: '2023-01-12' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Driver', created: '2023-02-05' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User', created: '2023-03-15' },
    ]);
  }, []);

  // Filter users by name based on searchTerm
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {/* Search bar */}
      <div className="flex items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr className="border-b" key={user.id}>
                <td className="py-2 px-3">{user.name}</td>
                <td className="py-2 px-3">{user.email}</td>
                <td className="py-2 px-3">{user.role}</td>
                <td className="py-2 px-3">{user.created}</td>
                <td className="py-2 px-3">
                  <button className="mr-2 text-blue-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="py-2 px-3 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;
