import React from 'react';
import { X, MapPin, Calendar, User } from 'lucide-react';

export default function UserInfoModal({ isOpen, onClose, section, userInfo }) {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (section) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto mb-4">
                <User className="w-full h-full p-4 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold">{userInfo?.name}</h2>
              <p className="text-gray-500">{userInfo?.email}</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Phone:</span> {userInfo?.phone || 'Not provided'}</p>
                  <p><span className="text-gray-500">Location:</span> {userInfo?.location || 'Not provided'}</p>
                  <p><span className="text-gray-500">Joined:</span> {userInfo?.joinDate || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'trips':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Trips</h2>
            {userInfo?.trips?.length > 0 ? (
              <div className="space-y-4">
                {userInfo.trips.map((trip, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-start space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{trip.destination}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{trip.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{trip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No trips found</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl max-w-lg w-full p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}