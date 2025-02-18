"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { AlertCircle } from "lucide-react"

const PaymentForm = () => {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("esewa")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState({
    amount: "",
  })

  // Clear error when amount or method changes
  useEffect(() => {
    setError("")
    validateAmount(amount)
  }, [amount, method])

  const validateAmount = (value) => {
    let errors = {}
    
    if (!value) {
      errors.amount = "Amount is required"
    } else if (isNaN(value) || value <= 0) {
      errors.amount = "Please enter a valid amount"
    } else if (value > 100000) {
      errors.amount = "Amount cannot exceed NPR 100,000"
    } else if (value < 10) {
      errors.amount = "Minimum amount is NPR 10"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePayment = async () => {
    try {
      // Validate before processing
      if (!validateAmount(amount)) {
        return
      }

      setIsLoading(true)
      setError("")

      const response = await axios.post("http://localhost:5173/api/payment/", {
        amount: parseFloat(amount),
        method,
      })

      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl
      } else {
        throw new Error("Invalid payment URL received")
      }
    } catch (error) {
      console.error("Payment Error:", error)
      setError(
        error.response?.data?.message || 
        "Payment initialization failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95%] sm:max-w-[440px] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Payment Gateway
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Fast and secure payment processing
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Amount Input Section */}
          <div>
            <label 
              htmlFor="amount" 
              className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">
                Rs.
              </span>
              <input
                type="number"
                id="amount"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg outline-none transition-all
                  ${validationErrors.amount 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-500'} 
                  focus:ring-2`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {validationErrors.amount && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* eSewa Button */}
              <button
                type="button"
                onClick={() => setMethod("esewa")}
                className={`group p-3 sm:p-4 border-2 rounded-lg flex items-center sm:flex-col justify-center gap-2 transition-all
                  ${method === "esewa"
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-gray-200 hover:border-green-200 hover:bg-green-50 text-gray-600"
                  }`}
              >
                <svg 
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors
                    ${method === "esewa" 
                      ? "text-green-600" 
                      : "text-gray-400 group-hover:text-green-500"
                    }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-sm sm:text-base font-medium">eSewa</span>
              </button>

              {/* Khalti Button */}
              <button
                type="button"
                onClick={() => setMethod("khalti")}
                className={`group p-3 sm:p-4 border-2 rounded-lg flex items-center sm:flex-col justify-center gap-2 transition-all
                  ${method === "khalti"
                    ? "border-purple-500 bg-purple-50 text-purple-600"
                    : "border-gray-200 hover:border-purple-200 hover:bg-purple-50 text-gray-600"
                  }`}
              >
                <svg 
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors
                    ${method === "khalti" 
                      ? "text-purple-600" 
                      : "text-gray-400 group-hover:text-purple-500"
                    }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm sm:text-base font-medium">Khalti</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-500 text-sm rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={isLoading || !amount || Object.keys(validationErrors).length > 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base 
              py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
              flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isLoading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentForm