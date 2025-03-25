"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Upload, AlertCircle, ChevronRight } from "lucide-react";
import {
  savePersonalInfo,
  saveLicenseInfo,
  saveVehicleInfo,
} from "../Slices/driverKYCSlice";

const DriverKycModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();
  const { loading, currentDriver } = useSelector((state) => state.driver) || {};

  const [step, setStep] = useState(1);
  const [driverId, setDriverId] = useState(null);
  const [errors, setErrors] = useState({});

  // Form data state
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

  // Image previews
  const [photoPreview, setPhotoPreview] = useState(null);
  const [frontPhotoPreview, setFrontPhotoPreview] = useState(null);
  const [backPhotoPreview, setBackPhotoPreview] = useState(null);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState(null);
  const [vehicleDetailPhotoPreview, setVehicleDetailPhotoPreview] =
    useState(null);
  const [ownerDetailPhotoPreview, setOwnerDetailPhotoPreview] = useState(null);
  const [renewalDetailPhotoPreview, setRenewalDetailPhotoPreview] =
    useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  // Set driverId if currentDriver is available
  useEffect(() => {
    console.log("DriverKycModal - Current driver updated:", currentDriver);
    if (currentDriver && currentDriver._id) {
      console.log("Setting driverId from currentDriver:", currentDriver._id);
      setDriverId(currentDriver._id);
    }
  }, [currentDriver]);

  // Add a new useEffect to validate userId on mount
  useEffect(() => {
    console.log("DriverKycModal mounted with userId:", userId);
    if (!userId) {
      console.error("WARNING: DriverKycModal initialized without a userId");
    }
  }, [userId]);

  // Conditionally render the modal content
  if (!modalOpen) return null;

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleLicenseInfoChange = (e) => {
    const { name, value } = e.target;
    setLicenseInfo({
      ...licenseInfo,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleVehicleInfoChange = (e) => {
    const { name, value } = e.target;
    setVehicleInfo({
      ...vehicleInfo,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handlePersonalPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPersonalInfo({
        ...personalInfo,
        photo: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.photo) {
        setErrors({
          ...errors,
          photo: null,
        });
      }
    }
  };

  const handleLicensePhotoChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (file) {
      setLicenseInfo({
        ...licenseInfo,
        [name]: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "frontPhoto") {
          setFrontPhotoPreview(reader.result);
        } else if (name === "backPhoto") {
          setBackPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null,
        });
      }
    }
  };

  const handleVehiclePhotoChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (file) {
      setVehicleInfo({
        ...vehicleInfo,
        [name]: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === "vehiclePhoto") {
          setVehiclePhotoPreview(reader.result);
        } else if (name === "vehicleDetailPhoto") {
          setVehicleDetailPhotoPreview(reader.result);
        } else if (name === "ownerDetailPhoto") {
          setOwnerDetailPhotoPreview(reader.result);
        } else if (name === "renewalDetailPhoto") {
          setRenewalDetailPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null,
        });
      }
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!personalInfo.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!personalInfo.address.trim()) newErrors.address = "Address is required";
    if (!personalInfo.email.trim()) newErrors.email = "Email is required";
    if (!personalInfo.gender) newErrors.gender = "Gender is required";
    if (!personalInfo.dob) newErrors.dob = "Date of birth is required";
    if (!personalInfo.citizenshipNumber.trim())
      newErrors.citizenshipNumber = "Citizenship number is required";
    if (!personalInfo.photo) newErrors.photo = "Photo is required";
    if (!userId) newErrors.userId = "User ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLicenseInfo = () => {
    const newErrors = {};

    if (!licenseInfo.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!licenseInfo.frontPhoto)
      newErrors.frontPhoto = "Front photo of license is required";
    if (!userId) newErrors.userId = "User ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the validateVehicleInfo function to match the required fields in the controller
  const validateVehicleInfo = () => {
    const newErrors = {};

    if (!vehicleInfo.numberPlate.trim())
      newErrors.numberPlate = "Number plate is required";
    if (!vehicleInfo.productionYear)
      newErrors.productionYear = "Production year is required";
    if (!vehicleInfo.vehiclePhoto)
      newErrors.vehiclePhoto = "Vehicle photo is required";
    if (!vehicleInfo.vehicleDetailPhoto)
      newErrors.vehicleDetailPhoto = "Vehicle detail photo is required";
    if (!vehicleInfo.ownerDetailPhoto)
      newErrors.ownerDetailPhoto = "Owner detail photo is required";
    if (!vehicleInfo.renewalDetailPhoto)
      newErrors.renewalDetailPhoto = "Renewal detail photo is required";
    if (!userId) newErrors.userId = "User ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPersonalInfo = async () => {
    if (!validatePersonalInfo()) {
      toast.error("Please fill in all required personal information fields");
      return;
    }

    if (!userId || userId === "undefined" || userId === "null") {
      console.error(
        "Invalid userId detected in personal info submission:",
        userId
      );
      toast.error(
        "User ID is missing or invalid. Please try again or contact support."
      );
      return;
    }

    const formData = new FormData();
    formData.append("fullName", personalInfo.fullName);
    formData.append("address", personalInfo.address);
    formData.append("email", personalInfo.email);
    formData.append("gender", personalInfo.gender);
    formData.append("dob", personalInfo.dob);
    formData.append("citizenshipNumber", personalInfo.citizenshipNumber);
    formData.append("photo", personalInfo.photo);
    formData.append("userId", userId);

    console.log(formData);
    try {
      const response = await dispatch(savePersonalInfo(formData)).unwrap();
      console.log("Personal info response:", response);

      // Handle both response formats
      const driver = response.driver || response;
      if (driver && driver._id) {
        setDriverId(driver._id);
        toast.success("Personal information saved successfully");
        setStep(2);
      } else {
        toast.error("Failed to save personal information. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmitPersonalInfo:", error);
      toast.error(
        `Failed to save personal information: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const handleSubmitLicenseInfo = async () => {
    if (!validateLicenseInfo()) {
      toast.error("Please fill in all required license information fields");
      return;
    }

    if (!userId || userId === "undefined" || userId === "null") {
      console.error(
        "Invalid userId detected in license info submission:",
        userId
      );
      toast.error(
        "User ID is missing or invalid. Please try again or contact support."
      );
      return;
    }

    console.log(
      "License info submission - userId:",
      userId,
      "driverId:",
      driverId
    );

    const formData = new FormData();
    formData.append("licenseNumber", licenseInfo.licenseNumber);
    formData.append("frontPhoto", licenseInfo.frontPhoto);
    if (licenseInfo.backPhoto) {
      formData.append("backPhoto", licenseInfo.backPhoto);
    }
    formData.append("userId", userId); // Use userId instead of driverId

    console.log("Submitting license info with userId:", userId);

    try {
      await dispatch(saveLicenseInfo({ driverId, formData })).unwrap();
      toast.success("License information saved successfully");
      setStep(3);
    } catch (error) {
      console.error("Error in handleSubmitLicenseInfo:", error);
      toast.error(
        `Failed to save license information: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const handleSubmitVehicleInfo = async () => {
    if (!validateVehicleInfo()) {
      toast.error("Please fill in all required vehicle information fields");
      return;
    }

    if (!userId || userId === "undefined" || userId === "null") {
      console.error(
        "Invalid userId detected in vehicle info submission:",
        userId
      );
      toast.error(
        "User ID is missing or invalid. Please try again or contact support."
      );
      return;
    }

    console.log(
      "Vehicle info submission - userId:",
      userId,
      "driverId:",
      driverId
    );

    const formData = new FormData();
    formData.append("vehicleType", vehicleInfo.vehicleType);
    formData.append("numberPlate", vehicleInfo.numberPlate);
    formData.append("productionYear", vehicleInfo.productionYear);
    formData.append("vehiclePhoto", vehicleInfo.vehiclePhoto);

    if (vehicleInfo.vehicleDetailPhoto) {
      formData.append("vehicleDetailPhoto", vehicleInfo.vehicleDetailPhoto);
    }
    if (vehicleInfo.ownerDetailPhoto) {
      formData.append("ownerDetailPhoto", vehicleInfo.ownerDetailPhoto);
    }
    if (vehicleInfo.renewalDetailPhoto) {
      formData.append("renewalDetailPhoto", vehicleInfo.renewalDetailPhoto);
    }
    formData.append("userId", userId); // Use userId instead of driverId

    console.log("Submitting vehicle info with userId:", userId);

    try {
      await dispatch(saveVehicleInfo({ driverId, formData })).unwrap();
      toast.success("Vehicle information saved successfully");
      toast.success(
        "KYC information submitted successfully! Your application is under review."
      );
      onClose();
    } catch (error) {
      console.error("Error in handleSubmitVehicleInfo:", error);
      toast.error(
        `Failed to save vehicle information: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const renderPersonalInfoForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-blue-700">
            Please provide your personal information for driver verification.
            This is required to start earning with us.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="fullName"
          value={personalInfo.fullName}
          onChange={handlePersonalInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.fullName ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={personalInfo.email}
          onChange={handlePersonalInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          name="address"
          value={personalInfo.address}
          onChange={handlePersonalInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            name="gender"
            value={personalInfo.gender}
            onChange={handlePersonalInfoChange}
            className={`w-full px-3 py-2 border ${
              errors.gender ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dob"
            value={personalInfo.dob}
            onChange={handlePersonalInfoChange}
            className={`w-full px-3 py-2 border ${
              errors.dob ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {errors.dob && (
            <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Citizenship Number *
        </label>
        <input
          type="text"
          name="citizenshipNumber"
          value={personalInfo.citizenshipNumber}
          onChange={handlePersonalInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.citizenshipNumber ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.citizenshipNumber && (
          <p className="text-red-500 text-xs mt-1">
            {errors.citizenshipNumber}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.photo ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPersonalInfo({ ...personalInfo, photo: null });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="personal-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload a photo</span>
                <input
                  id="personal-photo-upload"
                  name="photo"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handlePersonalPhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.photo && (
          <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
        )}
      </div>

      {/* Display userId for debugging */}
      <div className="text-xs text-gray-500">
        User ID: {userId || "Not available"}
        {errors.userId && (
          <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSubmitPersonalInfo}
          disabled={loading}
          className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderLicenseInfoForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-blue-700">
            Please provide your license information. This is required for
            verification.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Number *
        </label>
        <input
          type="text"
          name="licenseNumber"
          value={licenseInfo.licenseNumber}
          onChange={handleLicenseInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.licenseNumber ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.licenseNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Front Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.frontPhoto ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {frontPhotoPreview ? (
              <div className="relative">
                <img
                  src={frontPhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFrontPhotoPreview(null);
                    setLicenseInfo({ ...licenseInfo, frontPhoto: null });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="front-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload front photo</span>
                <input
                  id="front-photo-upload"
                  name="frontPhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleLicensePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.frontPhoto && (
          <p className="text-red-500 text-xs mt-1">{errors.frontPhoto}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Back Photo (Optional)
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 border-gray-300 hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {backPhotoPreview ? (
              <div className="relative">
                <img
                  src={backPhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBackPhotoPreview(null);
                    setLicenseInfo({ ...licenseInfo, backPhoto: null });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="back-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload back photo</span>
                <input
                  id="back-photo-upload"
                  name="backPhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleLicensePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Display userId for debugging */}
      <div className="text-xs text-gray-500">
        User ID: {userId || "Not available"}
        {errors.userId && (
          <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
        )}
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitLicenseInfo}
          disabled={loading}
          className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderVehicleInfoForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-blue-700">
            Please provide your vehicle information. This is required for
            verification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type *
          </label>
          <select
            name="vehicleType"
            value={vehicleInfo.vehicleType}
            onChange={handleVehicleInfoChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Production Year *
          </label>
          <input
            type="number"
            name="productionYear"
            value={vehicleInfo.productionYear}
            onChange={handleVehicleInfoChange}
            className={`w-full px-3 py-2 border ${
              errors.productionYear ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
          {errors.productionYear && (
            <p className="text-red-500 text-xs mt-1">{errors.productionYear}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number Plate *
        </label>
        <input
          type="text"
          name="numberPlate"
          value={vehicleInfo.numberPlate}
          onChange={handleVehicleInfoChange}
          className={`w-full px-3 py-2 border ${
            errors.numberPlate ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
        />
        {errors.numberPlate && (
          <p className="text-red-500 text-xs mt-1">{errors.numberPlate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.vehiclePhoto ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {vehiclePhotoPreview ? (
              <div className="relative">
                <img
                  src={vehiclePhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVehiclePhotoPreview(null);
                    setVehicleInfo({ ...vehicleInfo, vehiclePhoto: null });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="vehicle-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload vehicle photo</span>
                <input
                  id="vehicle-photo-upload"
                  name="vehiclePhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleVehiclePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.vehiclePhoto && (
          <p className="text-red-500 text-xs mt-1">{errors.vehiclePhoto}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vehicle Detail Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.vehicleDetailPhoto ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {vehicleDetailPhotoPreview ? (
              <div className="relative">
                <img
                  src={vehicleDetailPhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVehicleDetailPhotoPreview(null);
                    setVehicleInfo({
                      ...vehicleInfo,
                      vehicleDetailPhoto: null,
                    });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="vehicle-detail-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload vehicle detail photo</span>
                <input
                  id="vehicle-detail-photo-upload"
                  name="vehicleDetailPhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleVehiclePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.vehicleDetailPhoto && (
          <p className="text-red-500 text-xs mt-1">
            {errors.vehicleDetailPhoto}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Owner Detail Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.ownerDetailPhoto ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {ownerDetailPhotoPreview ? (
              <div className="relative">
                <img
                  src={ownerDetailPhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOwnerDetailPhotoPreview(null);
                    setVehicleInfo({ ...vehicleInfo, ownerDetailPhoto: null });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="owner-detail-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload owner detail photo</span>
                <input
                  id="owner-detail-photo-upload"
                  name="ownerDetailPhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleVehiclePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.ownerDetailPhoto && (
          <p className="text-red-500 text-xs mt-1">{errors.ownerDetailPhoto}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Renewal Detail Photo *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 ${
            errors.renewalDetailPhoto ? "border-red-500" : "border-gray-300"
          } hover:border-green-500 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center">
            {renewalDetailPhotoPreview ? (
              <div className="relative">
                <img
                  src={renewalDetailPhotoPreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setRenewalDetailPhotoPreview(null);
                    setVehicleInfo({
                      ...vehicleInfo,
                      renewalDetailPhoto: null,
                    });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}

            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="renewal-detail-photo-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
              >
                <span>Upload renewal detail photo</span>
                <input
                  id="renewal-detail-photo-upload"
                  name="renewalDetailPhoto"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleVehiclePhotoChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.renewalDetailPhoto && (
          <p className="text-red-500 text-xs mt-1">
            {errors.renewalDetailPhoto}
          </p>
        )}
      </div>

      {/* Display userId for debugging */}
      <div className="text-xs text-gray-500">
        User ID: {userId || "Not available"}
        {errors.userId && (
          <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
        )}
      </div>

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmitVehicleInfo}
          disabled={loading}
          className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>Submit</>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Driver KYC Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="text-xs mt-1">Personal</span>
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 2 ? "bg-green-500" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="text-xs mt-1">License</span>
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step >= 3 ? "bg-green-500" : "bg-gray-200"
              }`}
            ></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="text-xs mt-1">Vehicle</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {step === 1 && renderPersonalInfoForm()}
          {step === 2 && renderLicenseInfoForm()}
          {step === 3 && renderVehicleInfoForm()}
        </div>
      </div>
    </div>
  );
};

export default DriverKycModal;
