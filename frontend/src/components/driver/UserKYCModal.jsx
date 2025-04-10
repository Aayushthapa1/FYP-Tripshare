import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, Upload, Check, AlertCircle } from "lucide-react";
import { submitUserKYC } from "../Slices/userKYCSlice";

const UserKycModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.userKYC) || {};
  const { user: authUser } = useSelector((state) => state.auth) || {};

  const effectiveUserId = userId || authUser?._id;

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    email: "",
    gender: "male",
    dob: "",
    citizenshipNumber: "",
  });

  const [citizenshipFront, setCitizenshipFront] = useState(null);
  const [citizenshipBack, setCitizenshipBack] = useState(null);
  const [photo, setPhoto] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [citizenshipFrontPreview, setCitizenshipFrontPreview] = useState(null);
  const [citizenshipBackPreview, setCitizenshipBackPreview] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log("UserKycModal mounted with userId:", effectiveUserId);
    if (!effectiveUserId) {
      console.error("WARNING: UserKycModal initialized without a userId");
    }
  }, [effectiveUserId]);

  // If modal should not be shown, return null.
  if (!isOpen) return null;

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle file inputs
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
      if (name === "photo") {
        setPhoto(file);
        setPhotoPreview(reader.result);
      } else if (name === "citizenshipFront") {
        setCitizenshipFront(file);
        setCitizenshipFrontPreview(reader.result);
      } else if (name === "citizenshipBack") {
        setCitizenshipBack(file);
        setCitizenshipBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Basic validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.citizenshipNumber.trim()) {
      newErrors.citizenshipNumber = "Citizenship number is required";
    }
    if (!citizenshipFront)
      newErrors.citizenshipFront = "Citizenship front image is required";
    if (!citizenshipBack)
      newErrors.citizenshipBack = "Citizenship back image is required";
    if (!effectiveUserId) newErrors.userId = "User ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manual submit handler
  const handleSubmitKyc = async (e) => {
    e.preventDefault(); // Add event prevention
    e.stopPropagation();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!effectiveUserId) {
      toast.error("User ID is missing or invalid. Please try again.");
      return;
    }

    // Prepare the multipart/form-data
    const kycFormData = new FormData();
    kycFormData.append("userId", effectiveUserId);
    kycFormData.append("fullName", formData.fullName);
    kycFormData.append("address", formData.address);
    kycFormData.append("email", formData.email);
    kycFormData.append("gender", formData.gender);
    kycFormData.append("dob", formData.dob);
    kycFormData.append("citizenshipNumber", formData.citizenshipNumber);

    if (citizenshipFront) {
      kycFormData.append("citizenshipFront", citizenshipFront);
      console.log("Added citizenshipFront file:", citizenshipFront.name);
    }
    if (citizenshipBack) {
      kycFormData.append("citizenshipBack", citizenshipBack);
      console.log("Added citizenshipBack file:", citizenshipBack.name);
    }
    if (photo) {
      kycFormData.append("photo", photo);
      console.log("Added photo file:", photo.name);
    }

    console.log("Submitting User KYC with userId:", effectiveUserId);

    try {
      await dispatch(submitUserKYC(kycFormData)).unwrap();
      toast.success("KYC information submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to submit KYC: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Complete Your KYC
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-blue-700">
                Please provide your personal information for KYC verification.
                This is required to use our services.
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
                } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
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
                } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
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
                } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
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
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
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
                  className={`w-full px-3 py-2 border ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
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
                } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.citizenshipNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.citizenshipNumber}
                </p>
              )}
            </div>

            {/* Citizenship Front */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citizenship Front *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  errors.citizenshipFront ? "border-red-500" : "border-gray-300"
                } hover:border-green-500 transition-colors`}
              >
                <div className="flex flex-col items-center justify-center">
                  {citizenshipFrontPreview ? (
                    <div className="relative">
                      <img
                        src={citizenshipFrontPreview || "/placeholder.svg"}
                        alt="Citizenship Front"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenshipFrontPreview(null);
                          setCitizenshipFront(null);
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
                      htmlFor="citizenship-front-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
                    >
                      <span>Upload front image</span>
                      <input
                        id="citizenship-front-upload"
                        name="citizenshipFront"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              {errors.citizenshipFront && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.citizenshipFront}
                </p>
              )}
            </div>

            {/* Citizenship Back */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Citizenship Back *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  errors.citizenshipBack ? "border-red-500" : "border-gray-300"
                } hover:border-green-500 transition-colors`}
              >
                <div className="flex flex-col items-center justify-center">
                  {citizenshipBackPreview ? (
                    <div className="relative">
                      <img
                        src={citizenshipBackPreview || "/placeholder.svg"}
                        alt="Citizenship Back"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenshipBackPreview(null);
                          setCitizenshipBack(null);
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
                      htmlFor="citizenship-back-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
                    >
                      <span>Upload back image</span>
                      <input
                        id="citizenship-back-upload"
                        name="citizenshipBack"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              {errors.citizenshipBack && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.citizenshipBack}
                </p>
              )}
            </div>

            {/* Profile Photo (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Photo (Optional)
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
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500"
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
                  <p className="text-xs text-gray-500">PNG, JPG, up to 10MB</p>
                </div>
              </div>
              {errors.photo && (
                <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
              )}
            </div>

          </div>

          {/* Submit Button (type="button" so it won't auto-submit) */}
          <div className="pt-4 border-t">
            <button
              type="button"
              onClick={handleSubmitKyc}
              disabled={loading}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  {/* <svg
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
                  </svg> */}
                  
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit KYC Information
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserKycModal;
