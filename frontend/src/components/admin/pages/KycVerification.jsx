import React, { useEffect, useState } from "react";
import axios from "axios";
import driverService from "../../../services/driverService";
import { Base_Backend_Url } from "../../../../constant"; // Import the correct base URL

const KycVerification = () => {
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  const fetchKYCData = async () => {
    try {
      setLoading(true);
      const response = await driverService.getPendingKYC(); // Adjust API endpoint if needed
      setKycData(response);
      console.log("the response is", response);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await axios.post("/api/kyc/verify", {
        driverId: userId,
        isVerified: true,
      });
      fetchKYCData(); // Refresh data after verification
    } catch (err) {
      setVerificationError(err.message);
    }
  };

  useEffect(() => {
    fetchKYCData();
  }, []);

  if (loading)
    return <div className="text-center py-6">Loading KYC data...</div>;
  if (error)
    return <div className="text-center text-red-500 py-6">Error: {error}</div>;
  if (verificationError)
    return (
      <div className="text-center text-red-500 py-6">
        Error: {verificationError}
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-3 px-4 border-b">User ID</th>
            <th className="py-3 px-4 border-b">Name</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Document Type</th>
            <th className="py-3 px-4 border-b">License Number</th>
            <th className="py-3 px-4 border-b">Address</th>
            <th className="py-3 px-4 border-b">Vehicle Type</th>
            <th className="py-3 px-4 border-b">Profile Photo</th>
            <th className="py-3 px-4 border-b">Vehicle Photo</th>
            <th className="py-3 px-4 border-b">Owner Detail Photo</th>
            <th className="py-3 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {kycData.map((kyc) => {
            return (
              <tr
                key={kyc._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 border-b">{kyc?.email}</td>
                <td className="py-3 px-4 border-b">{kyc?.fullName}</td>
                <td className="py-3 px-4 border-b">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      kyc?.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : kyc?.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {kyc?.status}
                  </span>
                </td>
                
                <td className="py-3 px-4 border-b">{kyc?.licenseNumber}</td>
                <td className="py-3 px-4 border-b">{kyc?.address}</td>
                <td className="py-3 px-4 border-b">{kyc?.vehicleType}</td>
                <td className="py-3 px-4 border-b">
                  <img
                    src={kyc?.frontPhoto} // Profile Photo
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <img
                    src={kyc?.vehiclePhoto} // Vehicle Photo
                    alt="Vehicle"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <img
                    src={`kyc?.ownerDetailPhoto}`} // Owner Detail Photo
                    alt="Owner Detail"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    onClick={() => handleVerify(kyc.userId)}
                  >
                    Verify
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KycVerification;
