import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  savePersonalInfo,
  saveLicenseInfo,
  saveVehicleInfo,
  fetchDriverById,
} from "../Slices/KYCSlice";
import {
  CheckCircle,
  ChevronRight,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function KYCForm() {
  // 1) All hooks at the top
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth) || {};
  const { loading, error, driver } = useSelector((state) => state.driver);

  const [activeTab, setActiveTab] = useState("personal");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    address: "",
    email: "",
    gender: "Male",
    dob: "",
    citizenshipNumber: "",
    photo: null,
    userId: user?._id || "",
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

  // Effects
  useEffect(() => {
    if (personalInfo.citizenshipNumber?.length > 3) {
      dispatch(fetchDriverById(personalInfo.citizenshipNumber));
    }
  }, [dispatch, personalInfo.citizenshipNumber]);

  useEffect(() => {
    if (driver) {
      if (driver.personalInfo) {
        setPersonalInfo((prev) => ({
          ...prev,
          ...driver.personalInfo,
          photo: null,
        }));
      }
      if (driver.licenseInfo) {
        setLicenseInfo((prev) => ({
          ...prev,
          ...driver.licenseInfo,
          frontPhoto: null,
          backPhoto: null,
        }));
      }
      if (driver.vehicleInfo) {
        setVehicleInfo((prev) => ({
          ...prev,
          ...driver.vehicleInfo,
          vehiclePhoto: null,
          vehicleDetailPhoto: null,
          ownerDetailPhoto: null,
          renewalDetailPhoto: null,
        }));
      }
    }
  }, [driver]);

  // 2) If user is NOT logged in, show a message
  if (!user?._id) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Please log in</h2>
        <p className="text-gray-600">
          You must be logged in to complete KYC verification.
        </p>
      </div>
    );
  }

  const handleTabChange = (tab) => setActiveTab(tab);

  // Handlers
  const handlePersonalInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };
  const handleLicenseInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    setLicenseInfo((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };
  const handleVehicleInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    setVehicleInfo((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    try {
      if (activeTab === "personal") {
        const formData = new FormData();
        Object.entries(personalInfo).forEach(([key, val]) => {
          if (val != null) {
            formData.append(key, val);
          }
        });

        // Debug log
        console.log("Personal Info FormData:");
        for (let [key, val] of formData.entries()) {
          console.log(key, val);
        }

        await dispatch(savePersonalInfo(formData)).unwrap();
        setActiveTab("license");
      } else if (activeTab === "license") {
        const formData = new FormData();
        Object.entries(licenseInfo).forEach(([key, val]) => {
          if (val != null) {
            formData.append(key, val);
          }
        });

        // Provide driverId as personalInfo.citizenshipNumber
        formData.append("driverId", personalInfo.citizenshipNumber);

        console.log("License Info FormData:");
        for (let [key, val] of formData.entries()) {
          console.log(key, val);
        }

        await dispatch(
          saveLicenseInfo({
            driverId: personalInfo.citizenshipNumber,
            formData,
          })
        ).unwrap();
        setActiveTab("vehicle");
      } else if (activeTab === "vehicle") {
        const formData = new FormData();
        Object.entries(vehicleInfo).forEach(([key, val]) => {
          if (val != null) {
            formData.append(key, val);
          }
        });
        formData.append("driverId", personalInfo.citizenshipNumber);

        console.log("Vehicle Info FormData:");
        for (let [key, val] of formData.entries()) {
          console.log(key, val);
        }

        await dispatch(
          saveVehicleInfo({
            driverId: personalInfo.citizenshipNumber,
            formData,
          })
        ).unwrap();

        showNotification(
          "KYC submission complete! Your application is under review.",
          "success"
        );
      }

      setFormSubmitted(false);
    } catch (err) {
      setFormSubmitted(false);
      showNotification("An error occurred. Please try again.", "error");
    }
  };

  // Simple notification
  const showNotification = (message, type) => {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white max-w-xs z-50 transform transition-all duration-500 translate-y-0 opacity-100`;
      setTimeout(() => {
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
          type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white max-w-xs z-50 transform transition-all duration-500 -translate-y-10 opacity-0`;
      }, 3000);
    }
  };

  const getProgress = () => {
    if (activeTab === "personal") return 33;
    if (activeTab === "license") return 66;
    return 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <div
        id="notification"
        className="fixed top-4 right-4 p-4 rounded-md shadow-lg bg-green-500 text-white max-w-xs z-50 transform transition-all duration-500 -translate-y-10 opacity-0"
      ></div>

      {/* Header & Progress */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Driver Verification
        </h1>
        <p className="text-gray-600 mt-2">
          Complete your KYC process to start driving with us
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm mt-2 text-gray-600">
          <span
            className={
              activeTab === "personal" ? "font-medium text-blue-600" : ""
            }
          >
            Personal
          </span>
          <span
            className={
              activeTab === "license" ? "font-medium text-blue-600" : ""
            }
          >
            License
          </span>
          <span
            className={
              activeTab === "vehicle" ? "font-medium text-blue-600" : ""
            }
          >
            Vehicle
          </span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("personal")}
          className={`flex items-center py-3 px-4 font-medium text-sm ${
            activeTab === "personal"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
            1
          </span>
          Personal Information
        </button>
        <button
          onClick={() => handleTabChange("license")}
          className={`flex items-center py-3 px-4 font-medium text-sm ${
            activeTab === "license"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
            2
          </span>
          License Information
        </button>
        <button
          onClick={() => handleTabChange("vehicle")}
          className={`flex items-center py-3 px-4 font-medium text-sm ${
            activeTab === "vehicle"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-600">
            3
          </span>
          Vehicle Information
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* PERSONAL TAB */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your full name"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="your.email@example.com"
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Your current address"
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={personalInfo.dob}
                  onChange={handlePersonalInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* Citizenship Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Citizenship Number
                </label>
                <input
                  type="text"
                  name="citizenshipNumber"
                  value={personalInfo.citizenshipNumber}
                  onChange={handlePersonalInfoChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Your citizenship number"
                />
              </div>
            </div>

            {/* Profile Photo */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 2MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    name="photo"
                    className="hidden"
                    onChange={handlePersonalInfoChange}
                    accept="image/*"
                  />
                </label>
              </div>
              {personalInfo.photo && (
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  File selected: {personalInfo.photo.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* LICENSE TAB */}
        {/* ...unchanged code for license */}
        {/* VEHICLE TAB */}
        {/* ...unchanged code for vehicle */}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {activeTab !== "personal" && (
            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === "license" ? "personal" : "license")
              }
              className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            disabled={formSubmitted || loading}
            className="px-6 py-3 border border-transparent text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            {formSubmitted || loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : activeTab === "vehicle" ? (
              "Submit Application"
            ) : (
              <>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
