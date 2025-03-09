
import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { forgotPassword, resetPassword } from "../Slices/authSlice" // Ensure these are Redux actions
import { toast } from "sonner"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state?.auth)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate])

  // State variables
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value)
    }
  }

  // Handle Forgot Password (Step 1)
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!email) {
      toast.error("Please enter your email")
      setLoading(false)
      return
    }

    try {
      const response = await dispatch(forgotPassword({ email })) // Dispatch Redux action

      if (response.payload?.status === 200) {
        toast.success("OTP sent to your email.")
        setStep(2) // Move to OTP verification step
      } else {
        const errorMessage =
          response.payload?.details?.ErrorMessage?.[0]?.message ||
          "Failed to send OTP. Please try again."
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Forgot Password error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Reset Password (Step 3)
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please enter OTP and new password")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await dispatch(
        resetPassword({ otp, newPassword, confirmPassword }) // Dispatch Redux action
      )

      if (response.payload?.status === 200) {
        toast.success("Password reset successfully!")
        navigate("/login") // Redirect to login page
      } else {
        const errorMessage =
          response.payload?.details?.ErrorMessage?.[0]?.message ||
          "Failed to reset password. Please try again."
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Reset Password error:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1000px] flex bg-white rounded-3xl overflow-hidden shadow-xl">
        <div className="flex-1 p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            {step === 1 && (
              <>
                <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
                <p className="text-gray-600 mb-8">Enter your email to reset your password</p>
                <form onSubmit={handleForgotPassword}>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-blue-50 border border-blue-100 text-gray-900 text-base rounded-lg block w-full pl-10 p-4"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 flex justify-center items-center gap-2 text-green-600 bg-white border border-green-600 font-medium rounded-lg text-base px-5 py-4 hover:bg-green-50"
                      disabled={loading}
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white font-medium rounded-lg text-base px-5 py-4 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
                <p className="text-gray-600 mb-8">Enter the 6-digit code sent to your email</p>
                <form onSubmit={() => setStep(3)}>
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      className="bg-blue-50 border border-blue-100 text-gray-900 text-base rounded-lg block w-full p-4"
                      placeholder="Enter OTP"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 flex justify-center items-center gap-2 text-green-600 bg-white border border-green-600 font-medium rounded-lg text-base px-5 py-4 hover:bg-green-50"
                      disabled={loading}
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white font-medium rounded-lg text-base px-5 py-4 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                <p className="text-gray-600 mb-8">Create your new password</p>
                <form onSubmit={handleResetPassword}>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-blue-50 border border-blue-100 text-gray-900 text-base rounded-lg block w-full pl-10 pr-10 p-4"
                      placeholder="New password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="text-gray-400" size={20} />
                      ) : (
                        <Eye className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-blue-50 border border-blue-100 text-gray-900 text-base rounded-lg block w-full pl-10 pr-10 p-4"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="text-gray-400" size={20} />
                      ) : (
                        <Eye className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 flex justify-center items-center gap-2 text-green-600 bg-white border border-green-600 font-medium rounded-lg text-base px-5 py-4 hover:bg-green-50"
                      disabled={loading}
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white font-medium rounded-lg text-base px-5 py-4 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="hidden md:flex md:flex-1 bg-gradient-to-b from-green-500 to-green-700 justify-center items-center p-8">
          <div className="text-white max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to TripShare!</h1>
            <p className="text-xl">Enter your personal details and start your journey with us</p>
          </div>
        </div>
      </div>
    </div>
  )
}