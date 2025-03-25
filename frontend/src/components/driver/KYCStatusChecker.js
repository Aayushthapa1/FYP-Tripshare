"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchDriverById } from "../Slices/KYCSlice"

/**
 * Custom hook to check KYC status for users and drivers
 * @returns {Object} KYC status information
 */
export const useKycStatus = () => {
  const [kycStatus, setKycStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth) || {}
  const { currentDriver } = useSelector((state) => state.driver) || {}

  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user?._id) {
        setKycStatus(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        if (user.role === "driver") {
          // For drivers, fetch their KYC status from the driver API
          const response = await dispatch(fetchDriverById(user._id)).unwrap()

          if (response && response.data) {
            // Check if driver has completed all required KYC steps
            const driver = response.data

            if (driver.status === "verified") {
              setKycStatus("verified")
            } else if (driver.status === "rejected") {
              setKycStatus("rejected")
            } else if (driver.personalInfo && driver.licenseInfo && driver.vehicleInfo) {
              setKycStatus("pending")
            } else {
              setKycStatus("incomplete")
            }
          } else {
            setKycStatus("incomplete")
          }
        } else {
          // For regular users, check if they have completed basic KYC
          // This would depend on your backend implementation
          // For now, we'll check if user has completed profile
          if (user.kycCompleted) {
            setKycStatus("verified")
          } else {
            setKycStatus("incomplete")
          }
        }
      } catch (err) {
        console.error("Error checking KYC status:", err)
        setError(err.message || "Failed to check KYC status")
        setKycStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    checkKycStatus()
  }, [user, dispatch])

  // Get notification message based on user role and KYC status
  const getNotificationMessage = () => {
    if (!user || kycStatus === "verified") {
      return null
    }

    if (user.role === "driver") {
      if (kycStatus === "incomplete") {
        return "Complete your KYC to start earning with us!"
      } else if (kycStatus === "pending") {
        return "Your driver verification is pending approval."
      } else if (kycStatus === "rejected") {
        return "Your driver verification was rejected. Please update your information."
      }
    } else {
      // Regular user
      return "Please complete your personal information for KYC verification."
    }

    return null
  }

  // Get notification action based on user role
  const getNotificationAction = () => {
    if (user?.role === "driver") {
      return {
        text: "Complete Driver KYC",
        path: "/driver/kyc",
      }
    } else {
      return {
        text: "Complete KYC",
        path: "/Kycform",
      }
    }
  }

  return {
    kycStatus,
    isLoading,
    error,
    notificationMessage: getNotificationMessage(),
    notificationAction: getNotificationAction(),
    needsKyc: kycStatus === "incomplete" || kycStatus === "rejected",
  }
}

