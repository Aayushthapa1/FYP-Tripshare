import React, { useState, useEffect } from "react";
import driverService from "../../services/driverService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const KYCForm = () => {
  const [activeTab, setActiveTab] = useState("personal");

  // State for each form section
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    address: "",
    email: "",
    gender: "Male",
    dob: "",
    citizenshipNumber: "",
    photo: null,
  });

  const [licenseInfo, setLicenseInfo] = useState({
    licenseNumber: "",
    frontPhoto: null,
    backPhoto: null,
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    vehicleType: "Car",
    numberPlate: "",
    productionYear: "",
    vehiclePhoto: null,
    vehicleDetailPhoto: null,
    ownerDetailPhoto: null,
    renewalDetailPhoto: null,
  });

  const [kycStatus, setKycStatus] = useState({
    status: "",
    rejectionReason: "",
  });

  // Fetch KYC status from the backend
  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const response = await driverService.getPendingKYC();
        if (response.length > 0) {
          const driverKYC = response.find(
            (driver) =>
              driver.citizenshipNumber === personalInfo.citizenshipNumber
          );
          if (driverKYC) {
            setKycStatus({
              status: driverKYC.status,
              rejectionReason: driverKYC.rejectionReason || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      }
    };

    if (personalInfo.citizenshipNumber) {
      fetchKYCStatus();
    }
  }, [personalInfo.citizenshipNumber]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle input changes for each form section
  const handlePersonalInfoChange = (e) => {
    const { name, value, files } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLicenseInfoChange = (e) => {
    const { name, value, files } = e.target;
    setLicenseInfo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleVehicleInfoChange = (e) => {
    const { name, value, files } = e.target;
    setVehicleInfo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle form submission for each tab
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === "personal") {
        const formData = new FormData();
        Object.entries(personalInfo).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await driverService.savePersonalInfo(formData);
        toast.success("Personal information saved successfully!");
        console.log("Personal Info Response:", response);
      }

      if (activeTab === "license") {
        const formData = new FormData();
        Object.entries(licenseInfo).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await driverService.saveLicenseInfo(
          personalInfo.citizenshipNumber,
          formData
        );
        toast.success("License information saved successfully!");
        console.log("License Info Response:", response);
      }

      if (activeTab === "vehicle") {
        const formData = new FormData();
        Object.entries(vehicleInfo).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const response = await driverService.saveVehicleInfo(
          personalInfo.citizenshipNumber,
          formData
        );
        toast.success("Vehicle information saved successfully!");
        console.log("Vehicle Info Response:", response);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Driver Registration Form
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center mb-6">
        <button
          onClick={() => handleTabChange("personal")}
          className={`px-6 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === "personal"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => handleTabChange("license")}
          className={`px-6 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === "license"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          License Information
        </button>
        <button
          onClick={() => handleTabChange("vehicle")}
          className={`px-6 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === "vehicle"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vehicle Information
        </button>
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border border-gray-200 rounded-b-lg"
      >
        {activeTab === "personal" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={personalInfo.dob}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Citizenship Number
                </label>
                <input
                  type="text"
                  name="citizenshipNumber"
                  value={personalInfo.citizenshipNumber}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "license" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">License Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={licenseInfo.licenseNumber}
                  onChange={handleLicenseInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Front Photo
                </label>
                <input
                  type="file"
                  name="frontPhoto"
                  onChange={handleLicenseInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Back Photo
                </label>
                <input
                  type="file"
                  name="backPhoto"
                  onChange={handleLicenseInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "vehicle" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={vehicleInfo.vehicleType}
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number Plate
                </label>
                <input
                  type="text"
                  name="numberPlate"
                  value={vehicleInfo.numberPlate}
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Production Year
                </label>
                <input
                  type="number"
                  name="productionYear"
                  value={vehicleInfo.productionYear}
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Photo
                </label>
                <input
                  type="file"
                  name="vehiclePhoto"
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Detail Photo
                </label>
                <input
                  type="file"
                  name="vehicleDetailPhoto"
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner Detail Photo
                </label>
                <input
                  type="file"
                  name="ownerDetailPhoto"
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Renewal Detail Photo
                </label>
                <input
                  type="file"
                  name="renewalDetailPhoto"
                  onChange={handleVehicleInfoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* KYC Status Display */}
        {kycStatus.status && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">KYC Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="mt-1 text-gray-900">{kycStatus.status}</p>
              </div>
              {kycStatus.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rejection Reason
                  </label>
                  <p className="mt-1 text-gray-900">
                    {kycStatus.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCForm;
