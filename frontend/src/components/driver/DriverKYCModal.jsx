import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDriverKYCStatus,
  submitDriverKYC,
  getDriverKYCDetails,
} from "../Slices/driverKYCSlice";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit,
  Home,
  Car,
  List,
  Upload,
} from "lucide-react";

function DriverKycModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the dedicated route page
  const isStandalonePage = location.pathname === "/driverkyc";

  // Get user from auth slice
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;

  // Redux state for KYC
  const { loading, error, message, kycStatus, kycDetails } = useSelector(
    (state) => state.driverKYC
  );

  // Local state for personal info
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [citizenshipNumber, setCitizenshipNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  // Document files
  const [citizenshipFront, setCitizenshipFront] = useState(null);
  const [citizenshipBack, setCitizenshipBack] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [vehiclePhoto, setVehiclePhoto] = useState(null);

  // License information
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");

  // Vehicle information
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  // UI state
  const [viewMode, setViewMode] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  // Fetch KYC status and details when component mounts or isOpen changes
  useEffect(() => {
    if ((isOpen || isStandalonePage) && userId) {
      dispatch(getDriverKYCStatus(userId));
      dispatch(getDriverKYCDetails(userId));
    }
  }, [dispatch, userId, isOpen, isStandalonePage]);

  // Populate form with existing details if available
  useEffect(() => {
    if (kycDetails) {
      setFullName(kycDetails.fullName || "");
      setGender(kycDetails.gender || "");
      setCitizenshipNumber(kycDetails.citizenshipNumber || "");
      setAddress(kycDetails.address || "");
      setDob(kycDetails.dob ? kycDetails.dob.split("T")[0] : "");

      // License info
      setLicenseNumber(kycDetails.licenseNumber || "");
      setLicenseExpiryDate(
        kycDetails.licenseExpiryDate
          ? kycDetails.licenseExpiryDate.split("T")[0]
          : ""
      );

      // Vehicle info
      setVehicleType(kycDetails.vehicleType || "");
      setVehicleModel(kycDetails.vehicleModel || "");
      setVehicleYear(kycDetails.vehicleYear || "");

      // Set view mode if KYC is already submitted
      if (kycStatus === "verified" || kycStatus === "pending") {
        setViewMode(true);
      }
    }
  }, [kycDetails, kycStatus]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen && !isStandalonePage) {
      // Reset viewMode to default based on KYC status when reopening
      if (kycStatus === "not_submitted" || kycStatus === "rejected") {
        setViewMode(false);
      } else {
        setViewMode(true);
      }

      // Reset hide details flag
      setHideDetails(false);
      setShowThankYouModal(false);
    }
  }, [isOpen, isStandalonePage, kycStatus]);

  // Handle image upload
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    switch (type) {
      case "citizenshipFront":
        setCitizenshipFront(file);
        break;
      case "citizenshipBack":
        setCitizenshipBack(file);
        break;
      case "licenseFront":
        setLicenseFront(file);
        break;
      case "licenseBack":
        setLicenseBack(file);
        break;
      case "vehicle":
        setVehiclePhoto(file);
        break;
      default:
        break;
    }
  };

  // Handle close action with appropriate navigation
  const handleClose = () => {
    if (isStandalonePage) {
      navigate(-1); // Go back in history
    } else if (onClose) {
      onClose(); // Use provided onClose function
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("No user ID found. Please log in first.");
      return;
    }

    // Validate required files
    if (!citizenshipFront || !citizenshipBack) {
      toast.error("Please upload both front and back citizenship images");
      return;
    }

    if (!licenseFront || !licenseBack) {
      toast.error("Please upload both front and back license images");
      return;
    }

    if (!vehiclePhoto) {
      toast.error("Please upload a photo of your vehicle");
      return;
    }

    // Construct FormData
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("fullName", fullName);
    formData.append("gender", gender);
    formData.append("citizenshipNumber", citizenshipNumber);
    formData.append("address", address);
    formData.append("dob", dob);

    // Add document files
    formData.append("citizenshipFront", citizenshipFront);
    formData.append("citizenshipBack", citizenshipBack);
    formData.append("licenseFront", licenseFront);
    formData.append("licenseBack", licenseBack);
    formData.append("vehiclePhoto", vehiclePhoto);

    // Add license information
    formData.append("licenseNumber", licenseNumber);
    formData.append("licenseExpiryDate", licenseExpiryDate);

    // Add vehicle information
    formData.append("vehicleType", vehicleType);
    formData.append("vehicleModel", vehicleModel);
    formData.append("vehicleYear", vehicleYear);

    // Dispatch the Redux thunk
    dispatch(submitDriverKYC(formData))
      .unwrap()
      .then(() => {
        // Show thank you modal
        setShowThankYouModal(true);
        setViewMode(true);

        // If it's standalone page, redirect after timeout
        if (isStandalonePage) {
          setTimeout(() => {
            navigate("/");
          }, 5000);
        }

        // Refresh KYC status and details
        dispatch(getDriverKYCStatus(userId));
        dispatch(getDriverKYCDetails(userId));
      })
      .catch((err) => {
        toast.error(err.message || "Failed to submit KYC");
      });
  };

  // Render status badge based on KYC status
  const renderStatusBadge = () => {
    switch (kycStatus) {
      case "verified":
        return (
          <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Pending Verification</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Not Submitted</span>
          </div>
        );
    }
  };

  // Render rejection message if applicable
  const renderRejectionMessage = () => {
    if (kycStatus === "rejected" && kycDetails?.rejectionReason) {
      return (
        <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Rejection Reason:
          </h3>
          <p className="text-sm text-red-700">{kycDetails.rejectionReason}</p>
        </div>
      );
    }
    return null;
  };

  // Toggle between edit and view mode
  const toggleViewMode = () => {
    if (kycStatus === "verified" || kycStatus === "pending") {
      toast.info("Cannot edit verified or pending KYC submissions");
      return;
    }
    setViewMode(!viewMode);
  };

  // Toggle visibility of sensitive information
  const toggleHideDetails = () => {
    setHideDetails(!hideDetails);
  };

  // Thank You Modal Component
  const ThankYouModal = () => {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
            Thank You for Submitting Your Driver KYC
          </h3>
          <p className="text-center text-gray-600 mb-5">
            Your driver verification information has been successfully
            submitted. Please wait for verification, which usually takes 1-2
            business days. We'll notify you once the process is complete.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-500 h-2 rounded-full animate-[progress_5s_linear]"></div>
          </div>
          <p className="text-center text-sm text-gray-500">
            {isStandalonePage
              ? "Redirecting to home page in 5 seconds..."
              : "You can close this modal now."}
          </p>
          {!isStandalonePage && (
            <button
              onClick={handleClose}
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  };

  // Redirect if not logged in
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // Don't render anything if modal is closed and not on the dedicated page
  if (!isOpen && !isStandalonePage) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Driver Verification
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode
                ? "View your submitted driver verification details"
                : "Submit your driver information for verification"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {renderStatusBadge()}

            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-green-500"
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
            </div>
          )}

          {!loading && (
            <>
              {/* Display rejection message if applicable */}
              {renderRejectionMessage()}

              {/* Toggle between view/edit modes */}
              {kycStatus !== "not_submitted" && (
                <div className="flex justify-end mb-4">
                  {kycStatus === "rejected" && (
                    <button
                      onClick={toggleViewMode}
                      className={`flex items-center text-sm font-medium ${
                        viewMode ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {viewMode ? (
                        <>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Submission
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          View Submission
                        </>
                      )}
                    </button>
                  )}

                  {viewMode && (
                    <button
                      onClick={toggleHideDetails}
                      className="ml-4 flex items-center text-sm font-medium text-gray-600"
                    >
                      {hideDetails ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Show Sensitive Info
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Hide Sensitive Info
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {fullName}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Gender
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800 capitalize">
                            {gender}
                          </span>
                        </div>
                      ) : (
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="dob"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Date of Birth
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {dob
                              ? new Date(dob).toLocaleDateString()
                              : "Not provided"}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="citizenshipNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Citizenship Number
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : citizenshipNumber}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="citizenshipNumber"
                          type="text"
                          value={citizenshipNumber}
                          onChange={(e) => setCitizenshipNumber(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    {viewMode ? (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                        <span className="text-sm text-gray-800">
                          {hideDetails ? "••••••••••" : address}
                        </span>
                      </div>
                    ) : (
                      <textarea
                        id="address"
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Citizenship Document Uploads */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Citizenship Documents
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="citizenshipFront"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Citizenship Front
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : "Document uploaded"}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id="citizenshipFront"
                            name="citizenshipFront"
                            type="file"
                            onChange={(e) =>
                              handleImageChange(e, "citizenshipFront")
                            }
                            className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {citizenshipFront
                              ? citizenshipFront.name
                              : "No file selected"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="citizenshipBack"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Citizenship Back
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : "Document uploaded"}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id="citizenshipBack"
                            name="citizenshipBack"
                            type="file"
                            onChange={(e) =>
                              handleImageChange(e, "citizenshipBack")
                            }
                            className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {citizenshipBack
                              ? citizenshipBack.name
                              : "No file selected"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* License Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Driver's License Information
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-4">
                    <div>
                      <label
                        htmlFor="licenseNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        License Number
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : licenseNumber}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="licenseNumber"
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="licenseExpiryDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        License Expiry Date
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {licenseExpiryDate
                              ? new Date(licenseExpiryDate).toLocaleDateString()
                              : "Not provided"}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="licenseExpiryDate"
                          type="date"
                          value={licenseExpiryDate}
                          onChange={(e) => setLicenseExpiryDate(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="licenseFront"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        License Front
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : "Document uploaded"}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id="licenseFront"
                            name="licenseFront"
                            type="file"
                            onChange={(e) =>
                              handleImageChange(e, "licenseFront")
                            }
                            className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {licenseFront
                              ? licenseFront.name
                              : "No file selected"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="licenseBack"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        License Back
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {hideDetails ? "••••••••••" : "Document uploaded"}
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            id="licenseBack"
                            name="licenseBack"
                            type="file"
                            onChange={(e) =>
                              handleImageChange(e, "licenseBack")
                            }
                            className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            required
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {licenseBack
                              ? licenseBack.name
                              : "No file selected"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Vehicle Information
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-4">
                    <div>
                      <label
                        htmlFor="vehicleType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Type
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800 capitalize">
                            {vehicleType}
                          </span>
                        </div>
                      ) : (
                        <select
                          id="vehicleType"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="bike">Bike</option>
                          <option value="car">Car</option>
                          <option value="van">Van</option>
                          <option value="truck">Truck</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleModel"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Model
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {vehicleModel}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="vehicleModel"
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vehicleYear"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Vehicle Year
                      </label>
                      {viewMode ? (
                        <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                          <span className="text-sm text-gray-800">
                            {vehicleYear}
                          </span>
                        </div>
                      ) : (
                        <input
                          id="vehicleYear"
                          type="number"
                          min="1990"
                          max={new Date().getFullYear()}
                          value={vehicleYear}
                          onChange={(e) => setVehicleYear(e.target.value)}
                          className="block w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="vehiclePhoto"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Vehicle Photo
                    </label>
                    {viewMode ? (
                      <div className="px-4 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                        <span className="text-sm text-gray-800">
                          {hideDetails ? "••••••••••" : "Photo uploaded"}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          id="vehiclePhoto"
                          name="vehiclePhoto"
                          type="file"
                          onChange={(e) => handleImageChange(e, "vehicle")}
                          className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          required
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {vehiclePhoto
                            ? vehiclePhoto.name
                            : "No file selected"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button / Status Info */}
                <div className="pt-4">
                  {(!viewMode || kycStatus === "rejected") && (
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        kycStatus === "pending" ||
                        kycStatus === "verified"
                      }
                      className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                        loading ||
                        kycStatus === "pending" ||
                        kycStatus === "verified"
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
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
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Driver Verification
                        </>
                      )}
                    </button>
                  )}

                  {viewMode && kycStatus === "pending" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Verification in progress
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Your driver documents are being reviewed. This
                              usually takes 1-2 business days. You'll be
                              notified once the verification is complete.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode && kycStatus === "verified" && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Verification complete
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              Your driver information has been successfully
                              verified. You now have full access to all driver
                              features.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

       
        
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && <ThankYouModal />}

      {/* Add custom CSS for the animation */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default DriverKycModal;
