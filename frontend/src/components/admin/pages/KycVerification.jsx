import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKYCData,
  updateDriverVerification,
} from "../../Slices/driverSlice";
import AdminLayout from "../components/AdminLayout";

const KycVerification = () => {
  const dispatch = useDispatch();
  const {
    kycData = [],
    kycLoading,
    kycError,
    verificationError,
  } = useSelector((state) => state.driver);

  const handleVerify = async (userId) => {
    if (window.confirm("Are you sure you want to verify this user?")) {
      console.log("Verifying user with ID:", userId); // Debugging
      await dispatch(
        updateDriverVerification({ driverId: userId, isVerified: true })
      );
      dispatch(fetchKYCData()); // Refresh the KYC data
    }
  };

  useEffect(() => {
    dispatch(fetchKYCData());
  }, [dispatch]);

  if (kycLoading)
    return <div className="text-center py-6">Loading KYC data...</div>;
  if (kycError)
    return (
      <div className="text-center text-red-500 py-6">Error: {kycError}</div>
    );
  if (verificationError)
    return (
      <div className="text-center text-red-500 py-6">
        Error: {verificationError}
      </div>
    );

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>
        {kycData.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No KYC data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border-b text-left">User ID</th>
                  <th className="py-3 px-4 border-b text-left">Name</th>
                  <th className="py-3 px-4 border-b text-left">Status</th>
                  <th className="py-3 px-4 border-b text-left">
                    Document Type
                  </th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycData.map((kyc, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 border-b">{kyc.userId}</td>
                    <td className="py-3 px-4 border-b">{kyc.fullName}</td>{" "}
                    {/* Adjust if needed */}
                    <td className="py-3 px-4 border-b">
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${
                          kyc.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : kyc.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {kyc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">{kyc.documentType}</td>
                    <td className="py-3 px-4 border-b">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleVerify(kyc.userId)}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default KycVerification;
