

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllDrivers } from "../../Slices/driverKYCSlice"
import {
  Search,
  Filter,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Car,
  Calendar,
  MapPin,
} from "lucide-react"

const DriverList = () => {
  const dispatch = useDispatch()
  const { drivers, loading, error } = useSelector((state) => state.driver)

  // State for filtering and pagination
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [driversPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: "fullName", direction: "ascending" })
  const [expandedDriverId, setExpandedDriverId] = useState(null)

  // Fetch drivers on component mount
  useEffect(() => {
    dispatch(fetchAllDrivers())
  }, [dispatch])

  // Filter and sort drivers
  const getFilteredDrivers = () => {
    // First apply status filter
    let filtered = statusFilter === "all" ? drivers : drivers.filter((driver) => driver.status === statusFilter)

    // Then apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (driver) =>
          driver.fullName?.toLowerCase().includes(term) ||
          driver.email?.toLowerCase().includes(term) ||
          driver.vehicleType?.toLowerCase().includes(term) ||
          driver.numberPlate?.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0
        if (!a[sortConfig.key]) return 1
        if (!b[sortConfig.key]) return -1

        const aValue = a[sortConfig.key].toString().toLowerCase()
        const bValue = b[sortConfig.key].toString().toLowerCase()

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  // Get current drivers for pagination
  const filteredDrivers = getFilteredDrivers()
  const indexOfLastDriver = currentPage * driversPerPage
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver)
  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Request sort
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Toggle expanded driver details
  const toggleDriverDetails = (driverId) => {
    setExpandedDriverId(expandedDriverId === driverId ? null : driverId)
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex flex-col items-center justify-center my-4">
          <h3 className="text-lg font-medium mb-2">Error Loading Drivers</h3>
          <p className="text-center mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchAllDrivers())}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Check if the backend server is running</li>
            <li>Verify the API endpoint is correct (/api/drivers/all)</li>
            <li>Check your network connection</li>
            <li>Ensure you have the proper authentication</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with title and filters */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Driver Management</h1>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search drivers..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>

          {/* Status filter */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1) // Reset to first page on filter change
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Driver count summary */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
        Showing {currentDrivers.length} of {filteredDrivers.length} drivers
        {statusFilter !== "all" && ` with status "${statusFilter}"`}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Drivers list */}
      {currentDrivers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">No drivers found</h3>
          <p className="mt-2">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("fullName")}
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig.key === "fullName" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("email")}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === "email" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("vehicleType")}
                >
                  <div className="flex items-center">
                    Vehicle
                    {sortConfig.key === "vehicleType" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
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
              {currentDrivers.map((driver) => (
                <React.Fragment key={driver._id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {driver.photo ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={driver.photo || "/placeholder.svg"}
                              alt={driver.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.fullName}</div>
                          <div className="text-sm text-gray-500">{driver.gender || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.vehicleType || "N/A"}</div>
                      <div className="text-sm text-gray-500">{driver.numberPlate || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(driver.status)}`}
                      >
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => toggleDriverDetails(driver._id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        {expandedDriverId === driver._id ? (
                          <>
                            Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            View Details <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded details row */}
                  {expandedDriverId === driver._id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Personal Information */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{driver.fullName}</p>
                                  <p className="text-sm text-gray-500">{driver.gender || "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-900">{driver.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-900">{driver.user?.phoneNumber || "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-900">
                                    {driver.dob ? new Date(driver.dob).toLocaleDateString() : "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-900">{driver.address || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Vehicle Information */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-start">
                                <Car className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Type: {driver.vehicleType || "N/A"}
                                  </p>
                                  <p className="text-sm text-gray-500">Plate: {driver.numberPlate || "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm text-gray-900">
                                    Production Year: {driver.productionYear || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Vehicle Photo */}
                            {driver.vehiclePhoto && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-900 mb-2">Vehicle Photo</p>
                                <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden">
                                  <img
                                    src={driver.vehiclePhoto || "/placeholder.svg"}
                                    alt="Vehicle"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* License & Status Information */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">License & Status</h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">License Number</p>
                                <p className="text-sm text-gray-500">{driver.licenseNumber || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Citizenship Number</p>
                                <p className="text-sm text-gray-500">{driver.citizenshipNumber || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Status</p>
                                <span
                                  className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(driver.status)}`}
                                >
                                  {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                </span>
                              </div>

                              {driver.status === "rejected" && driver.rejectionReason && (
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Rejection Reason</p>
                                  <p className="text-sm text-red-600">{driver.rejectionReason}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-sm font-medium text-gray-900">Registration Date</p>
                                <p className="text-sm text-gray-500">
                                  {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstDriver + 1}</span> to{" "}
                <span className="font-medium">
                  {indexOfLastDriver > filteredDrivers.length ? filteredDrivers.length : indexOfLastDriver}
                </span>{" "}
                of <span className="font-medium">{filteredDrivers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                  // Show limited page numbers with ellipsis for better UX
                  if (
                    number === 1 ||
                    number === totalPages ||
                    (number >= currentPage - 1 && number <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {number}
                      </button>
                    )
                  } else if (
                    (number === currentPage - 2 && currentPage > 3) ||
                    (number === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={number}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>

          {/* Mobile pagination */}
          <div className="flex items-center justify-between w-full sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverList

