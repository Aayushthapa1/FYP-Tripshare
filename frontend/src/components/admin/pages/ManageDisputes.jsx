// AdminDriverKYCList.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDriverKYCsAction,
  updateDriverKYCStatusAction,
  deleteDriverKYCAction,
} from "../../Slices/driverKYCSlice"; // Adjust path if needed
import {
  FileCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

function ManageDisputes() {
  const dispatch = useDispatch();

  // Data from the store
  const { submissions, loading, error, pagination } = useSelector(
    (state) => state.driverKYC
  );

  // Local state for pagination or filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    // On mount or when page/statusFilter changes, fetch KYC submissions
    dispatch(fetchAllDriverKYCsAction({ page, limit, status: statusFilter }));
  }, [dispatch, page, limit, statusFilter]);

  const openUpdateModal = (kyc) => {
    setSelectedKYC(kyc);
    setNewStatus(kyc.status);
    setRejectionReason(kyc.rejectionReason || "");
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedKYC(null);
    setNewStatus("");
    setRejectionReason("");
    setIsUpdateModalOpen(false);
  };

  const handleStatusUpdate = () => {
    if (!newStatus) return;

    if (
      ["rejected", "needs_resubmission"].includes(newStatus) &&
      !rejectionReason
    ) {
      alert("Rejection reason is required for that status");
      return;
    }

    // Dispatch the Redux thunk to update
    dispatch(
      updateDriverKYCStatusAction({
        id: selectedKYC._id,
        statusData: { status: newStatus, rejectionReason },
      })
    );

    closeUpdateModal();
  };

  const handleDelete = (kycId) => {
    if (window.confirm("Are you sure you want to delete this KYC?")) {
      dispatch(deleteDriverKYCAction(kycId));
    }
  };

  // Helper function to render the error safely
  const renderError = (err) => {
    // If it's an object, show err.message or JSON
    if (typeof err === "object") {
      return err.message || JSON.stringify(err);
    }
    // Otherwise, it's a string
    return err;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <CheckCircle size={14} className="mr-1" />,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: <XCircle size={14} className="mr-1" />,
        };
      case "needs_resubmission":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          icon: <RefreshCw size={14} className="mr-1" />,
        };
      case "pending":
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: <Clock size={14} className="mr-1" />,
        };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-green-50 p-2 rounded-lg mr-3">
              <FileCheck className="text-green-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Driver KYC Management
            </h1>
          </div>

          {/* Filter by status */}
          <div className="bg-white flex items-center px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="text-gray-700 bg-transparent border-none focus:ring-0 focus:outline-none py-1 pr-8 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="needs_resubmission">Needs Resubmission</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-gray-600 font-medium">Loading submissions...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Error loading KYC submissions</p>
              <p className="text-sm">{renderError(error)}</p>
            </div>
          </div>
        )}

        {/* Table of results */}
        {!loading && !error && submissions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Full Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item._id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.icon}
                            {item.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openUpdateModal(item)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Edit size={14} className="mr-1" />
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page <= 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.totalPages || 1)}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page >= (pagination.totalPages || 1)
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * limit, pagination.totalItems || 0)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalItems || 0}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page <= 1
                          ? "text-gray-300"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Page numbers - simplified for this example */}
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {page} of {pagination.totalPages || 1}
                    </span>

                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= (pagination.totalPages || 1)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page >= (pagination.totalPages || 1)
                          ? "text-gray-300"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        ) : !loading && !error ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No KYC Submissions Found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {statusFilter
                ? `No ${statusFilter} submissions available.`
                : "There are no KYC submissions at the moment."}
            </p>
          </div>
        ) : null}
      </div>

      {/* Update Status Modal */}
      {isUpdateModalOpen && selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-medium text-gray-800">Update KYC Status</h3>
              <button
                onClick={closeUpdateModal}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <div className="text-gray-900 font-medium">
                  {selectedKYC.fullName}
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="needs_resubmission">Needs Resubmission</option>
                </select>
              </div>

              {["rejected", "needs_resubmission"].includes(newStatus) && (
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    rows={3}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Please specify the reason for rejection..."
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="button"
                onClick={handleStatusUpdate}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={closeUpdateModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDisputes;
