import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserKYCStatus,
  submitUserKYC,
  getUserKYCDetails,
} from "../Slices/userKYCSlice";
import { toast } from "sonner";
import {
  X,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit,
} from "lucide-react";

function UserKycModal({ isOpen, onClose, userId }) {
  const dispatch = useDispatch();

  // Redux state
  const { loading, error, message, kycStatus, kycDetails } = useSelector(
    (state) => state.userKYC
  );

  // Local state
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [citizenshipNumber, setCitizenshipNumber] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [citizenshipFront, setCitizenshipFront] = useState(null);
  const [citizenshipBack, setCitizenshipBack] = useState(null);
  const [citizenshipFrontPreview, setCitizenshipFrontPreview] = useState(null);
  const [citizenshipBackPreview, setCitizenshipBackPreview] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);

  // Fetch KYC status and details when the modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(getUserKYCStatus(userId));
      dispatch(getUserKYCDetails(userId));
    }
  }, [dispatch, userId, isOpen]);

  // Populate form with existing details if available
  useEffect(() => {
    if (kycDetails) {
      setFullName(kycDetails.fullName || "");
      setGender(kycDetails.gender || "");
      setCitizenshipNumber(kycDetails.citizenshipNumber || "");
      setAddress(kycDetails.address || "");
      setDob(kycDetails.dob ? kycDetails.dob.split("T")[0] : "");

      // Set view mode if KYC is already submitted
      if (kycStatus === "verified" || kycStatus === "pending") {
        setViewMode(true);
      }
    }
  }, [kycDetails, kycStatus]);

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Only reset form previews, not the actual data
      setCitizenshipFrontPreview(null);
      setCitizenshipBackPreview(null);

      // Reset viewMode to default based on KYC status when reopening
      if (kycStatus === "not_submitted" || kycStatus === "rejected") {
        setViewMode(false);
      } else {
        setViewMode(true);
      }

      // Reset hide details flag
      setHideDetails(false);
    }
  }, [isOpen, kycStatus]);

  // Handle image preview
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === "front") {
        setCitizenshipFront(file);
        setCitizenshipFrontPreview(reader.result);
      } else {
        setCitizenshipBack(file);
        setCitizenshipBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("No user ID found. Please log in first.");
      return;
    }

    if (!citizenshipFront || !citizenshipBack) {
      toast.error("Please attach both front and back citizenship images");
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
    formData.append("citizenshipFront", citizenshipFront);
    formData.append("citizenshipBack", citizenshipBack);

    // Dispatch the Redux thunk
    dispatch(submitUserKYC(formData))
      .unwrap()
      .then(() => {
        toast.success("KYC submitted successfully!");
        setViewMode(true);
        // Refresh KYC status and details
        dispatch(getUserKYCStatus(userId));
        dispatch(getUserKYCDetails(userId));
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

  // Default images for view mode when actual images aren't available
  const defaultKycImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              KYC Verification
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode
                ? "View your submitted KYC details"
                : "Submit your personal information for verification"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {renderStatusBadge()}

            <button
              onClick={onClose}
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
                {/* Personal Information */}
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

                <div>
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

                {/* Document Upload */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Citizenship Front
                    </label>
                    {viewMode ? (
                      <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                        <img
                          src={
                            citizenshipFrontPreview ||
                            kycDetails?.citizenshipFrontUrl ||
                            defaultKycImage
                          }
                          alt="Citizenship Front"
                          className="w-full h-48 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        {citizenshipFrontPreview ? (
                          <div className="w-full text-center">
                            <img
                              src={citizenshipFrontPreview}
                              alt="Citizenship Front Preview"
                              className="mx-auto h-48 object-contain mb-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCitizenshipFront(null);
                                setCitizenshipFrontPreview(null);
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="citizenshipFront"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="citizenshipFront"
                                  name="citizenshipFront"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    handleImageChange(e, "front")
                                  }
                                  required
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Citizenship Back
                    </label>
                    {viewMode ? (
                      <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                        <img
                          src={
                            citizenshipBackPreview ||
                            kycDetails?.citizenshipBackUrl ||
                            defaultKycImage
                          }
                          alt="Citizenship Back"
                          className="w-full h-48 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        {citizenshipBackPreview ? (
                          <div className="w-full text-center">
                            <img
                              src={citizenshipBackPreview}
                              alt="Citizenship Back Preview"
                              className="mx-auto h-48 object-contain mb-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCitizenshipBack(null);
                                setCitizenshipBackPreview(null);
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="citizenshipBack"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="citizenshipBack"
                                  name="citizenshipBack"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleImageChange(e, "back")}
                                  required
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button / Status Info */}
                {(!viewMode || kycStatus === "rejected") && (
                  <div className="pt-4">
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
                          Submit KYC
                        </>
                      )}
                    </button>
                  </div>
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
                            Your KYC documents are being reviewed. This usually
                            takes 1-2 business days. You'll be notified once the
                            verification is complete.
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
                            Your identity has been successfully verified. You
                            now have full access to all features.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserKycModal;
