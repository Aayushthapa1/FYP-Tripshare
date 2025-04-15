import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  createDriverKYCAction,
  updateDriverKYCAction,
  fetchDriverKYCByIdAction,
} from "../Slices/driverKYCSlice";


const DriverKYCModal = ({ isOpen, onClose, kycId = null }) => {
  const dispatch = useDispatch();

  // Get user data from auth state
  const { user } = useSelector((state) => state.auth);
  // Something might be setting isOpen to true unconditionally

  // Get KYC data from redux
  const { currentSubmission, loading, error, status, operation } = useSelector(
    (state) => state.driverKYC
  );

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    citizenshipNumber: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    vehicleType: "",
    numberPlate: "",
    productionYear: "",
    user: user?._id || "",
  });

  // File states
  const [files, setFiles] = useState({
    photo: null,
    frontPhoto: null,
    backPhoto: null,
    vehiclePhoto: null,
  });

  // Preview URLs for images
  const [previews, setPreviews] = useState({
    photo: "",
    frontPhoto: "",
    backPhoto: "",
    vehiclePhoto: "",
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch KYC data if in edit mode
  useEffect(() => {
    if (isOpen && kycId) {
      dispatch(fetchDriverKYCByIdAction(kycId));
    }
  }, [dispatch, isOpen, kycId]);

  // Populate form when data is loaded
  useEffect(() => {
    if (currentSubmission && isOpen) {
      const formFields = {
        fullName: currentSubmission.fullName || "",
        address: currentSubmission.address || "",
        email: currentSubmission.email || "",
        phone: currentSubmission.phone || "",
        gender: currentSubmission.gender || "",
        dob: currentSubmission.dob
          ? new Date(currentSubmission.dob).toISOString().split("T")[0]
          : "",
        citizenshipNumber: currentSubmission.citizenshipNumber || "",
        licenseNumber: currentSubmission.licenseNumber || "",
        licenseExpiryDate: currentSubmission.licenseExpiryDate
          ? new Date(currentSubmission.licenseExpiryDate)
              .toISOString()
              .split("T")[0]
          : "",
        vehicleType: currentSubmission.vehicleType || "",
        numberPlate: currentSubmission.numberPlate || "",
        productionYear: currentSubmission.productionYear || "",
        user: currentSubmission.user || user?._id || "",
      };

      setFormData(formFields);

      // Set image previews
      setPreviews({
        photo: currentSubmission.photo || "",
        frontPhoto: currentSubmission.frontPhoto || "",
        backPhoto: currentSubmission.backPhoto || "",
        vehiclePhoto: currentSubmission.vehiclePhoto || "",
      });
    }
  }, [currentSubmission, isOpen, user]);

  // Handle errors
  useEffect(() => {
    if (error && isSubmitting) {
      setIsSubmitting(false);
      toast.error(
        typeof error === "string" ? error : error.message || "An error occurred"
      );
    }
  }, [error, isSubmitting]);

  // Handle successful submission
  useEffect(() => {
    if (
      (operation === "create" || operation === "update") &&
      status === "succeeded" &&
      isSubmitting
    ) {
      setIsSubmitting(false);
      toast.success(
        operation === "create"
          ? "KYC submitted successfully!"
          : "KYC updated successfully!"
      );
      onClose();
    }
  }, [operation, status, isSubmitting, onClose]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;

    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Please upload a valid image file (jpg, jpeg, png)",
        }));
        return;
      }

      // Set file in state
      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [name]: previewUrl,
      }));

      // Clear error
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "fullName",
      "address",
      "email",
      "gender",
      "dob",
      "citizenshipNumber",
      "licenseNumber",
      "licenseExpiryDate",
    ];

    // Check required text fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = `${
          field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, " $1")
        } is required`;
      }
    });

    // Check required files for new submission
    if (!kycId) {
      const requiredFiles = ["photo", "frontPhoto", "backPhoto"];
      requiredFiles.forEach((field) => {
        if (!files[field] && !previews[field]) {
          errors[field] = `${
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
          } is required`;
        }
      });
    }

    // Validate email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate dates
    const today = new Date();

    // DOB - must be at least 18 years ago
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

      if (dobDate > eighteenYearsAgo) {
        errors.dob = "You must be at least 18 years old";
      }
    }

    // License expiry - must be in the future
    if (formData.licenseExpiryDate) {
      const expiryDate = new Date(formData.licenseExpiryDate);
      if (expiryDate <= today) {
        errors.licenseExpiryDate = "License must not be expired";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    // Create FormData for file uploads
    const data = new FormData();

    // Add all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value);
      }
    });

    // Add files
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        data.append(key, file);
      }
    });

    // Submit or update KYC
    if (kycId) {
      dispatch(updateDriverKYCAction({ id: kycId, data }));
    } else {
      dispatch(createDriverKYCAction(data));
    }
  };

  // Close modal handler
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form state
      setFormData({
        fullName: "",
        address: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        citizenshipNumber: "",
        licenseNumber: "",
        licenseExpiryDate: "",
        vehicleType: "",
        numberPlate: "",
        productionYear: "",
        user: user?._id || "",
      });
      setFiles({
        photo: null,
        frontPhoto: null,
        backPhoto: null,
        vehiclePhoto: null,
      });
      setPreviews({
        photo: "",
        frontPhoto: "",
        backPhoto: "",
        vehiclePhoto: "",
      });
      setFormErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative bg-white w-full max-w-4xl m-auto rounded-lg shadow-lg">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {kycId ? "Update Driver KYC" : "Submit Driver KYC"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.gender ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.gender}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.dob ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.dob && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.dob}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Citizenship Number *
                  </label>
                  <input
                    type="text"
                    name="citizenshipNumber"
                    value={formData.citizenshipNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.citizenshipNumber ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.citizenshipNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.citizenshipNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.address ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Photo *
                  </label>
                  <div className="flex items-start mt-1">
                    <div className="flex-grow">
                      <input
                        type="file"
                        name="photo"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png"
                        className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 file:rounded-md
                          file:border-0 file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {formErrors.photo && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.photo}
                        </p>
                      )}
                    </div>
                    {previews.photo && (
                      <div className="ml-4 w-24 h-24 relative">
                        <img
                          src={previews.photo}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* License Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">License Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.licenseNumber ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.licenseNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      formErrors.licenseExpiryDate ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.licenseExpiryDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.licenseExpiryDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Front Photo *
                  </label>
                  <div className="flex items-start mt-1">
                    <div className="flex-grow">
                      <input
                        type="file"
                        name="frontPhoto"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png"
                        className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 file:rounded-md
                          file:border-0 file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {formErrors.frontPhoto && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.frontPhoto}
                        </p>
                      )}
                    </div>
                    {previews.frontPhoto && (
                      <div className="ml-4 w-24 h-16 relative">
                        <img
                          src={previews.frontPhoto}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Back Photo *
                  </label>
                  <div className="flex items-start mt-1">
                    <div className="flex-grow">
                      <input
                        type="file"
                        name="backPhoto"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png"
                        className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 file:rounded-md
                          file:border-0 file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {formErrors.backPhoto && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.backPhoto}
                        </p>
                      )}
                    </div>
                    {previews.backPhoto && (
                      <div className="ml-4 w-24 h-16 relative">
                        <img
                          src={previews.backPhoto}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information (Optional) */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                Vehicle Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Electric">Electric</option>
                    <option value="Truck">Truck</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Plate Number
                  </label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Production Year
                  </label>
                  <input
                    type="number"
                    name="productionYear"
                    value={formData.productionYear}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Photo
                  </label>
                  <div className="flex items-start mt-1">
                    <div className="flex-grow">
                      <input
                        type="file"
                        name="vehiclePhoto"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png"
                        className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 file:rounded-md
                          file:border-0 file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                    {previews.vehiclePhoto && (
                      <div className="ml-4 w-24 h-16 relative">
                        <img
                          src={previews.vehiclePhoto}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md mr-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {isSubmitting && (
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
            )}
            {isSubmitting
              ? "Submitting..."
              : kycId
              ? "Update KYC"
              : "Submit KYC"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverKYCModal;
