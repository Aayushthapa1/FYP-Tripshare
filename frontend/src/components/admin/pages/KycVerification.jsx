import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingKYC, updateDriverVerification } from "../../Slices/KYCSlice";
import { Check, X, AlertCircle, ChevronRight, ChevronDown, Search, FileText, User, Car, Phone, MapPin, Mail } from 'lucide-react';

const KycVerification = () => {
  const dispatch = useDispatch();
  const { pendingDrivers, kycLoading, kycError } = useSelector((state) => state.driver);
  const [confirmVerifyId, setConfirmVerifyId] = useState(null);
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [filteredDrivers, setFilteredDrivers] = useState([]);

  useEffect(() => {
    dispatch(fetchPendingKYC());
  }, [dispatch]);

  useEffect(() => {
    if (pendingDrivers) {
      setFilteredDrivers(
        pendingDrivers.filter(
          (driver) =>
            driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, pendingDrivers]);

  const initiateVerify = (driverId) => {
    setConfirmVerifyId(driverId);
    setConfirmRejectId(null);
  };

  const handleConfirmVerify = async () => {
    if (!confirmVerifyId) return;
    try {
      await dispatch(updateDriverVerification({ 
        driverId: confirmVerifyId, 
        status: "verified" 
      })).unwrap();
      setConfirmVerifyId(null);
      dispatch(fetchPendingKYC());
    } catch (error) {
      console.error("Verification failed:", error);
      alert(`Failed to verify driver: ${error}`);
    }
  };

  const handleCancelVerify = () => {
    setConfirmVerifyId(null);
  };

  const initiateReject = (driverId) => {
    setConfirmRejectId(driverId);
    setRejectReason("");
    setConfirmVerifyId(null);
  };

  const handleConfirmReject = async () => {
    if (!confirmRejectId || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    try {
      await dispatch(updateDriverVerification({ 
        driverId: confirmRejectId, 
        status: "rejected", 
        rejectionReason: rejectReason 
      })).unwrap();
      setConfirmRejectId(null);
      dispatch(fetchPendingKYC());
    } catch (error) {
      console.error("Rejection failed:", error);
      alert(`Failed to reject driver: ${error}`);
    }
  };

  const handleCancelReject = () => {
    setConfirmRejectId(null);
  };

  const toggleExpandDriver = (driverId) => {
    setExpandedDriver(expandedDriver === driverId ? null : driverId);
  };

  if (kycLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (kycError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-center my-4">
        <AlertCircle className="mr-2 h-5 w-5" />
        <span>Error: {kycError}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Driver KYC Verification</h1>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search drivers..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">No pending KYC requests</h3>
          <p className="mt-2">When drivers submit KYC information, they will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-gray-200">
            {filteredDrivers.map((driver) => {
              const isVerifying = confirmVerifyId === driver._id;
              const isRejecting = confirmRejectId === driver._id;
              const isExpanded = expandedDriver === driver._id;
              
              return (
                <div key={driver._id} className="bg-white hover:bg-gray-50 transition-colors">
                  <div 
                    className="p-4 cursor-pointer flex flex-wrap md:flex-nowrap items-center justify-between gap-4"
                    onClick={() => toggleExpandDriver(driver._id)}
                  >
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {driver.photo ? (
                          <img 
                            src={driver.photo || "/placeholder.svg"} 
                            alt={driver.fullName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{driver.fullName}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          {driver.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 ml-auto">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        driver.status === "pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : driver.status === "verified" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                      }`}>
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden md:inline-block">
                          <Car className="h-4 w-4 inline-block mr-1" />
                          {driver.vehicleType || "N/A"}
                        </span>
                        
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <User className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium">{driver.fullName}</p>
                                <p className="text-xs text-gray-500">{driver.gender || "N/A"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                              <p className="text-sm">{driver.user?.phoneNumber || "N/A"}</p>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                              <p className="text-sm">{driver.address || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Vehicle Information</h4>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Type:</span> {driver.vehicleType || "N/A"}</p>
                            <p className="text-sm"><span className="font-medium">Plate:</span> {driver.numberPlate || "N/A"}</p>
                            <p className="text-sm"><span className="font-medium">Year:</span> {driver.productionYear || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md md:col-span-2 lg:col-span-1">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {driver.vehiclePhoto && (
                              <div className="relative h-20 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={driver.vehiclePhoto || "/placeholder.svg"} 
                                  alt="Vehicle" 
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                  Vehicle
                                </div>
                              </div>
                            )}
                            
                            {driver.licenseNumber && driver.frontPhoto && (
                              <div className="relative h-20 bg-gray-100 rounded overflow-hidden">
                                <img 
                                  src={driver.frontPhoto || "/placeholder.svg"} 
                                  alt="License" 
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                  License
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {driver.status === "pending" && (
                        <div className="mt-4 flex flex-wrap gap-3 justify-end">
                          {!isVerifying && !isRejecting && (
                            <>
                              <button
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateVerify(driver._id);
                                }}
                              >
                                <Check className="h-4 w-4 mr-1.5" />
                                Verify
                              </button>
                              <button
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateReject(driver._id);
                                }}
                              >
                                <X className="h-4 w-4 mr-1.5" />
                                Reject
                              </button>
                            </>
                          )}
                          
                          {isVerifying && (
                            <div className="w-full bg-green-50 border border-green-100 rounded-md p-3">
                              <p className="text-sm text-green-800 mb-3">Are you sure you want to verify this driver?</p>
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelVerify();
                                  }}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmVerify();
                                  }}
                                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  Confirm Verification
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {isRejecting && (
                            <div className="w-full bg-red-50 border border-red-100 rounded-md p-3">
                              <p className="text-sm text-red-800 mb-2">Please provide a reason for rejection:</p>
                              <textarea
                                className="w-full border border-red-200 rounded-md p-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter detailed reason for rejection..."
                                rows={3}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelReject();
                                  }}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfirmReject();
                                  }}
                                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                                  disabled={!rejectReason.trim()}
                                >
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KycVerification;
