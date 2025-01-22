// src/components/admin/pages/AdminSettings.jsx

import React, { useState } from 'react';

function AdminSettings() {
  const [theme, setTheme] = useState('light');
  const [enableNotifications, setEnableNotifications] = useState(true);

  const handleSave = () => {
    alert('Settings saved (not really).');
    // In real code, you'd call an API or update a context, etc.
  };

  return (
    <div className="bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>

      <div className="bg-white rounded shadow p-4 max-w-md">
        {/* Theme selector */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">
            Theme
          </label>
          <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full 
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Notifications toggle */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">
            Notifications
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={() => setEnableNotifications(!enableNotifications)}
              className="h-5 w-5 text-green-600"
            />
            <span>Enable notifications</span>
          </label>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded 
                     hover:bg-green-600 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;
