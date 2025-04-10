import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Upload, Check, AlertCircle } from "lucide-react";
import {
  createDriverKYCAction,
  updateDriverKYCAction,
  clearKYCError,
} from "../Slices/driverKYCSlice";

const DriverKYCModal = ({ isOpen, onClose, userId, existingData = null }) => {
  const dispatch = useDispatch();
  const { loading, error, status } = useSelector((state) => state.driverKYC);
  const { user: authUser } = useSelector((state) => state.auth) || {};

  const effectiveUserId = userId || authUser?._id;

  // Form steps
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    email: "",
    gender: "Male",
    dob: "",
    citizenshipNumber: "",
    licenseNumber: "",
    vehicleType: "",
    numberPlate: "",
    productionYear: "",
    vehicleDetail: "",
  });

  // File states
  const [photo, setPhoto] = useState(null);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [vehicleDetailPhoto, setVehicleDetailPhoto] = useState(null);
  const [ownerDetailPhoto, setOwnerDetailPhoto] = useState(null);
  const [renewalDetailPhoto, setRenewalDetailPhoto] = useState(null);

  // Preview states
  const [photoPreview, setPhotoPreview] = useState(null);
  const [frontPhotoPreview, setFrontPhotoPreview] = useState(null);
  const [backPhotoPreview, setBackPhotoPreview] = useState(null);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState(null);
  const [vehicleDetailPhotoPreview, setVehicleDetailPhotoPreview] =
    useState(null);
  const [ownerDetailPhotoPreview, setOwnerDetailPhotoPreview] = useState(null);
  const [renewalDetailPhotoPreview, setRenewalDetailPhotoPreview] =
    useState(null);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Populate form with existing data if available
  useEffect(() => {
    if (existingData) {
      const formattedData = { ...existingData };

      // Format date for input
      if (formattedData.dob) {
        const date = new Date(formattedData.dob);
        formattedData.dob = date.toISOString().split("T")[0];
      }

      setFormData({
        fullName: formattedData.fullName || "",
        address: formattedData.address || "",
        email: formattedData.email || "",
        gender: formattedData.gender || "Male",
        dob: formattedData.dob || "",
        citizenshipNumber: formattedData.citizenshipNumber || "",
        licenseNumber: formattedData.licenseNumber || "",
        vehicleType: formattedData.vehicleType || "",
        numberPlate: formattedData.numberPlate || "",
        productionYear: formattedData.productionYear?.toString() || "",
      });

      // Set image previews if available
      if (formattedData.photo) setPhotoPreview(formattedData.photo);
      if (formattedData.frontPhoto)
        setFrontPhotoPreview(formattedData.frontPhoto);
      if (formattedData.backPhoto) setBackPhotoPreview(formattedData.backPhoto);
      if (formattedData.vehiclePhoto)
        setVehiclePhotoPreview(formattedData.vehiclePhoto);
      if (formattedData.vehicleDetailPhoto)
        setVehicleDetailPhotoPreview(formattedData.vehicleDetailPhoto);
      if (formattedData.ownerDetailPhoto)
        setOwnerDetailPhotoPreview(formattedData.ownerDetailPhoto);
      if (formattedData.renewalDetailPhoto)
        setRenewalDetailPhotoPreview(formattedData.renewalDetailPhoto);
    }
  }, [existingData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      if (!existingData) {
        setFormData({
          fullName: "",
          address: "",
          email: "",
          gender: "Male",
          dob: "",
          citizenshipNumber: "",
          licenseNumber: "",
          vehicleType: "",
          numberPlate: "",
          productionYear: "",
        });

        // Reset file states
        setPhoto(null);
        setFrontPhoto(null);
        setBackPhoto(null);
        setVehiclePhoto(null);
        setVehicleDetailPhoto(null);
        setOwnerDetailPhoto(null);
        setRenewalDetailPhoto(null);

        // Reset preview states
        setPhotoPreview(null);
        setFrontPhotoPreview(null);
        setBackPhotoPreview(null);
        setVehiclePhotoPreview(null);
        setVehicleDetailPhotoPreview(null);
        setOwnerDetailPhotoPreview(null);
        setRenewalDetailPhotoPreview(null);
      }
      setErrors({});
      dispatch(clearKYCError());
    }
  }, [isOpen, dispatch, existingData]);

  // Close modal on successful submission
  useEffect(() => {
    if (status === "succeeded" && !loading) {
      toast.success(
        existingData
          ? "KYC updated successfully!"
          : "KYC submitted successfully!"
      );
      onClose();
    }
  }, [status, loading, onClose, existingData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      switch (name) {
        case "photo":
          setPhoto(file);
          setPhotoPreview(reader.result);
          break;
        case "frontPhoto":
          setFrontPhoto(file);
          setFrontPhotoPreview(reader.result);
          break;
        case "backPhoto":
          setBackPhoto(file);
          setBackPhotoPreview(reader.result);
          break;
        case "vehiclePhoto":
          setVehiclePhoto(file);
          setVehiclePhotoPreview(reader.result);
          break;
        case "vehicleDetailPhoto":
          setVehicleDetailPhoto(file);
          setVehicleDetailPhotoPreview(reader.result);
          break;
        case "ownerDetailPhoto":
          setOwnerDetailPhoto(file);
          setOwnerDetailPhotoPreview(reader.result);
          break;
        case "renewalDetailPhoto":
          setRenewalDetailPhoto(file);
          setRenewalDetailPhotoPreview(reader.result);
          break;
        default:
          break;
      }
    };
    reader.readAsDataURL(file);

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      // Personal Information validation
      if (!formData.fullName.trim())
        newErrors.fullName = "Full name is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        if (dobDate >= today) {
          newErrors.dob = "Date of birth cannot be in the future";
        }
      }
      if (!formData.citizenshipNumber.trim())
        newErrors.citizenshipNumber = "Citizenship number is required";
      if (!photo && !photoPreview) newErrors.photo = "Photo is required";
    } else if (step === 2) {
      // License Information validation
      if (!formData.licenseNumber.trim())
        newErrors.licenseNumber = "License number is required";
      if (!frontPhoto && !frontPhotoPreview)
        newErrors.frontPhoto = "Front photo of license is required";
      if (!backPhoto && !backPhotoPreview)
        newErrors.backPhoto = "Back photo of license is required";
    } else if (step === 3) {
      // Vehicle Information validation (optional fields, but validate if provided)
      if (
        formData.vehicleType &&
        !["Car", "Bike", "Electric"].includes(formData.vehicleType)
      ) {
        newErrors.vehicleType = "Invalid vehicle type";
      }

      if (formData.productionYear) {
        const year = parseInt(formData.productionYear);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
          newErrors.productionYear = `Year must be between 1900 and ${
            new Date().getFullYear() + 1
          }`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateStep()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!effectiveUserId) {
      toast.error("User ID is missing or invalid. Please try again.");
      return;
    }

    // Prepare form data for API
    const apiFormData = new FormData();

    // Append all text fields
    apiFormData.append("user", effectiveUserId);
    apiFormData.append("fullName", formData.fullName);
    apiFormData.append("address", formData.address);
    apiFormData.append("email", formData.email);
    apiFormData.append("gender", formData.gender);
    apiFormData.append("dob", formData.dob);
    apiFormData.append("citizenshipNumber", formData.citizenshipNumber);
    apiFormData.append("licenseNumber", formData.licenseNumber);

    if (formData.vehicleType)
      apiFormData.append("vehicleType", formData.vehicleType);
    if (formData.numberPlate)
      apiFormData.append("numberPlate", formData.numberPlate);
    if (formData.productionYear)
      apiFormData.append("productionYear", formData.productionYear);

    // Append file fields
    if (photo) {
      apiFormData.append("photo", photo);
      console.log("Added photo file:", photo.name);
    }
    if (frontPhoto) {
      apiFormData.append("frontPhoto", frontPhoto);
      console.log("Added frontPhoto file:", frontPhoto.name);
    }
    if (backPhoto) {
      apiFormData.append("backPhoto", backPhoto);
      console.log("Added backPhoto file:", backPhoto.name);
    }
    if (vehiclePhoto) {
      apiFormData.append("vehiclePhoto", vehiclePhoto);
      console.log("Added vehiclePhoto file:", vehiclePhoto.name);
    }
    if (vehicleDetailPhoto) {
      apiFormData.append("vehicleDetailPhoto", vehicleDetailPhoto);
      console.log("Added vehicleDetailPhoto file:", vehicleDetailPhoto.name);
    }
    if (ownerDetailPhoto) {
      apiFormData.append("ownerDetailPhoto", ownerDetailPhoto);
      console.log("Added ownerDetailPhoto file:", ownerDetailPhoto.name);
    }
    if (renewalDetailPhoto) {
      apiFormData.append("renewalDetailPhoto", renewalDetailPhoto);
      console.log("Added renewalDetailPhoto file:", renewalDetailPhoto.name);
    }

    console.log("Submitting Driver KYC with userId:", effectiveUserId);

    try {
      // Dispatch create or update action
      if (existingData && existingData._id) {
        await dispatch(
          updateDriverKYCAction({
            id: existingData._id,
            data: apiFormData,
          })
        ).unwrap();
      } else {
        await dispatch(createDriverKYCAction(apiFormData)).unwrap();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to submit KYC: ${error.message || "Unknown error"}`);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {existingData ? "Update Driver KYC" : "Driver KYC Submission"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between p-4 border-b border-gray-200">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center relative flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  step > index
                    ? "bg-green-500 text-white"
                    : step === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <div className="text-xs mt-2 text-center">
                {index === 0
                  ? "Personal Info"
                  : index === 1
                  ? "License Info"
                  : "Vehicle Info"}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    step > index + 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex justify-between items-center">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span>{error}</span>
            </div>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => dispatch(clearKYCError())}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Personal Information
              </h3>

              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-sm text-blue-700">
                    Please provide your personal information for KYC
                    verification. This is required to use our services.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Gender & DOB */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border ${
                        errors.dob ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.dob && (
                      <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                    )}
                  </div>
                </div>

                {/* Citizenship Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Citizenship Number *
                  </label>
                  <input
                    type="text"
                    name="citizenshipNumber"
                    value={formData.citizenshipNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.citizenshipNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.citizenshipNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.citizenshipNumber}
                    </p>
                  )}
                </div>

                {/* Your Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Photo *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 ${
                      errors.photo ? "border-red-500" : "border-gray-300"
                    } hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Profile Preview"
                            className="w-32 h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setPhoto(null);
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
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="photo-upload"
                            name="photo"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, up to 5MB
                      </p>
                    </div>
                  </div>
                  {errors.photo && (
                    <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: License Information */}
          {step === 2 && (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                License Information
              </h3>

              <div className="space-y-4">
                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.licenseNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>

                {/* Front Photo of License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Front Photo of License *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 ${
                      errors.frontPhoto ? "border-red-500" : "border-gray-300"
                    } hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {frontPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={frontPhotoPreview || "/placeholder.svg"}
                            alt="License Front Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFrontPhotoPreview(null);
                              setFrontPhoto(null);
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
                          htmlFor="frontPhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload front image</span>
                          <input
                            id="frontPhoto-upload"
                            name="frontPhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {errors.frontPhoto && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.frontPhoto}
                    </p>
                  )}
                </div>

                {/* Back Photo of License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Back Photo of License *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 ${
                      errors.backPhoto ? "border-red-500" : "border-gray-300"
                    } hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {backPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={backPhotoPreview || "/placeholder.svg"}
                            alt="License Back Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setBackPhotoPreview(null);
                              setBackPhoto(null);
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
                          htmlFor="backPhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload back image</span>
                          <input
                            id="backPhoto-upload"
                            name="backPhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {errors.backPhoto && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.backPhoto}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Information */}
          {step === 3 && (
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Vehicle Information (Optional)
              </h3>

              <div className="space-y-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.vehicleType ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Electric">Electric</option>
                  </select>
                  {errors.vehicleType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vehicleType}
                    </p>
                  )}
                </div>

                {/* Number Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number Plate
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.numberPlate ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.numberPlate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.numberPlate}
                    </p>
                  )}
                </div>

                {/* Production Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Year
                  </label>
                  <input
                    type="number"
                    name="productionYear"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.productionYear}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.productionYear
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.productionYear && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productionYear}
                    </p>
                  )}
                </div>

                {/* Vehicle Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Photo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 border-gray-300 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      {vehiclePhotoPreview ? (
                        <div className="relative">
                          <img
                            src={vehiclePhotoPreview || "/placeholder.svg"}
                            alt="Vehicle Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVehiclePhotoPreview(null);
                              setVehiclePhoto(null);
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
                          htmlFor="vehiclePhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload vehicle photo</span>
                          <input
                            id="vehiclePhoto-upload"
                            name="vehiclePhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Detail Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Detail Photo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 border-gray-300 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      {vehicleDetailPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={
                              vehicleDetailPhotoPreview || "/placeholder.svg"
                            }
                            alt="Vehicle Detail Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVehicleDetailPhotoPreview(null);
                              setVehicleDetailPhoto(null);
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
                          htmlFor="vehicleDetailPhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload vehicle detail photo</span>
                          <input
                            id="vehicleDetailPhoto-upload"
                            name="vehicleDetailPhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Detail Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Detail Photo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 border-gray-300 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      {ownerDetailPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={ownerDetailPhotoPreview || "/placeholder.svg"}
                            alt="Owner Detail Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOwnerDetailPhotoPreview(null);
                              setOwnerDetailPhoto(null);
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
                          htmlFor="ownerDetailPhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload owner detail photo</span>
                          <input
                            id="ownerDetailPhoto-upload"
                            name="ownerDetailPhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renewal Detail Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renewal Detail Photo
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 border-gray-300 hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      {renewalDetailPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={
                              renewalDetailPhotoPreview || "/placeholder.svg"
                            }
                            alt="Renewal Detail Preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setRenewalDetailPhotoPreview(null);
                              setRenewalDetailPhoto(null);
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
                          htmlFor="renewalDetailPhoto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload renewal detail photo</span>
                          <input
                            id="renewalDetailPhoto-upload"
                            name="renewalDetailPhoto"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with Navigation Buttons */}
          <div className="flex justify-between p-4 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
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
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {existingData
                      ? "Update KYC Information"
                      : "Submit KYC Information"}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverKYCModal;
