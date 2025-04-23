import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { acceptBooking, completeBooking, rejectBooking } from "../../Slices/bookingSlice.js"

export default function useBookingActions() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Handle view booking details
  const viewBookingDetails = (bookingId) => {
    navigate(`/booking?bookingId=${bookingId}`)
  }

  // Handle accept booking
  const handleAcceptBooking = async (bookingId, e) => {
    e.stopPropagation()
    try {
      await dispatch(acceptBooking(bookingId)).unwrap()
      toast.success("Booking accepted successfully!")
    } catch (error) {
      console.error("Accept booking error:", error)
      toast.error("Failed to accept booking", {
        description: error?.message || "An error occurred",
      })
    }
  }

  // Handle complete booking
  const handleCompleteBooking = async (bookingId, e) => {
    e.stopPropagation()
    try {
      await dispatch(completeBooking(bookingId)).unwrap()
      toast.success("Booking marked as completed!")
    } catch (error) {
      console.error("Complete booking error:", error)
      toast.error("Failed to complete booking", {
        description: error?.message || "An error occurred",
      })
    }
  }

  // Handle reject booking
  const handleRejectBooking = async (bookingId, e) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to reject this booking?")) {
      try {
        await dispatch(rejectBooking({ bookingId, reason: "Driver rejected the booking" })).unwrap()
        toast.success("Booking rejected successfully!")
      } catch (error) {
        console.error("Reject booking error:", error)
        toast.error("Failed to reject booking", {
          description: error?.message || "An error occurred",
        })
      }
    }
  }

  return {
    viewBookingDetails,
    handleAcceptBooking,
    handleCompleteBooking,
    handleRejectBooking,
  }
}
