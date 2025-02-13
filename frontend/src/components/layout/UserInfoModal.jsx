import React, { useState } from 'react';
import { X, MapPin, Calendar, User, Settings, Clock, Save, ChevronLeft, Bell, Lock, Eye, HelpCircle } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, userInfo }) {
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    address: userInfo?.address || '',
    bio: userInfo?.bio || ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    tripUpdates: true,
    marketing: false
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const recentTrips = [
    {
      destination: "Pokhara",
      date: "Feb 10, 2024",
      status: "Completed",
      image: "/api/placeholder/100/100"
    },
    {
      destination: "Chitwan",
      date: "Jan 25, 2024",
      status: "Upcoming",
      image: "/api/placeholder/100/100"
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </form>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Back
              </button>
              <button
                onClick={() => console.log('Save changes:', formData)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'trips':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Trips</h2>
            <div className="space-y-4">
              {recentTrips.map((trip, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{trip.destination}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{trip.date}</span>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      trip.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.emailNotifications ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('pushNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.pushNotifications ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">Trip Updates</span>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('tripUpdates')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.tripUpdates ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.tripUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">Marketing Emails</span>
                    </div>
                    <button
                      onClick={() => handleSettingsChange('marketing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        settings.marketing ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        settings.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl max-w-2xl w-full p-6">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveSection('personal')}
              className={`px-4 py-2 border-b-2 ${
                activeSection === 'personal'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveSection('trips')}
              className={`px-4 py-2 border-b-2 ${
                activeSection === 'trips'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Trips
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`px-4 py-2 border-b-2 ${
                activeSection === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}