import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, X } from "lucide-react"
import { useKycStatus } from "./KYCStatusChecker.js"


const KycBanner = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isBlinking, setIsBlinking] = useState(true)
  const navigate = useNavigate()

  const { kycStatus, isLoading, notificationMessage, notificationAction, needsKyc } = useKycStatus()

  // Blinking effect
  useEffect(() => {
    if (needsKyc) {
      const blinkInterval = setInterval(() => {
        setIsBlinking((prev) => !prev)
      }, 800)

      return () => clearInterval(blinkInterval)
    }
  }, [needsKyc])

  // Don't show if loading, no message, or user dismissed
  if (isLoading || !notificationMessage || !isVisible || !needsKyc) {
    return null
  }

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border ${
        isBlinking ? "border-amber-300" : "border-gray-200"
      } transition-colors z-50`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${isBlinking ? "animate-pulse" : ""}`}>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">Action Required</p>
            <p className="mt-1 text-sm text-gray-500">{notificationMessage}</p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => navigate(notificationAction.path)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {notificationAction.text}
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => setIsVisible(false)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KycBanner