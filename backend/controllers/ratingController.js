import Rating from "../models/ratingModel.js"
import Booking from "../models/bookingModel.js"
import User from "../models/userModel.js" // Import User model
import mongoose from "mongoose"
import { createResponse } from "../utils/responseHelper.js"

// Submit a new rating
export const submitRating = async (req, res) => {
    const { bookingId, rating, feedback } = req.body
    const userId = req.user._id // From protectRoute middleware

    try {
        // Validate the rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json(createResponse(400, false, ["Rating must be between 1 and 5"]))
        }

        // Find the booking to ensure it exists and is completed
        const booking = await Booking.findById(bookingId).populate("trip")

        if (!booking) {
            return res.status(404).json(createResponse(404, false, ["Booking not found"]))
        }

        // Verify the booking belongs to the user
        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json(createResponse(403, false, ["You are not authorized to rate this booking"]))
        }

        // Check if booking is completed
        if (booking.status !== "completed") {
            return res.status(400).json(createResponse(400, false, ["You can only rate completed bookings"]))
        }

        // Check if user has already rated this booking
        const existingRating = await Rating.findOne({
            booking: bookingId,
            user: userId,
        })

        if (existingRating) {
            return res.status(400).json(createResponse(400, false, ["You have already rated this booking"]))
        }

        // Get driver ID from the trip
        const driverId = booking.trip.driver

        // Create the rating
        const newRating = new Rating({
            booking: bookingId,
            user: userId,
            driver: driverId,
            trip: booking.trip._id,
            rating,
            feedback: feedback || "",
        })

        await newRating.save()

        // Update driver's average rating
        await updateDriverAverageRating(driverId)

        return res.status(201).json(createResponse(201, true, ["Rating submitted successfully"], { rating: newRating }))
    } catch (error) {
        console.error("Error submitting rating:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to submit rating"]))
    }
}

// Get ratings for a driver
export const getDriverRatings = async (req, res) => {
    const { driverId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    try {
        const ratings = await Rating.find({
            driver: driverId,
            status: "active",
        })
            .populate("user", "fullName profileImage")
            .populate("trip", "departureLocation destinationLocation departureDate")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalRatings = await Rating.countDocuments({
            driver: driverId,
            status: "active",
        })

        return res.status(200).json(
            createResponse(200, true, [], {
                ratings,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalRatings / limit),
                    totalItems: totalRatings,
                    itemsPerPage: limit,
                },
            }),
        )
    } catch (error) {
        console.error("Error fetching driver ratings:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to fetch ratings"]))
    }
}

// Get ratings for a user
export const getUserRatings = async (req, res) => {
    const userId = req.user._id // From protectRoute middleware
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    try {
        const ratings = await Rating.find({
            user: userId,
            status: "active",
        })
            .populate("driver", "fullName profileImage")
            .populate("trip", "departureLocation destinationLocation departureDate")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalRatings = await Rating.countDocuments({
            user: userId,
            status: "active",
        })

        return res.status(200).json(
            createResponse(200, true, [], {
                ratings,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalRatings / limit),
                    totalItems: totalRatings,
                    itemsPerPage: limit,
                },
            }),
        )
    } catch (error) {
        console.error("Error fetching user ratings:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to fetch ratings"]))
    }
}

// Get rating statistics for a driver
export const getRatingStats = async (req, res) => {
    const { driverId } = req.params

    try {
        // Calculate average rating
        const averageRating = await Rating.aggregate([
            { $match: { driver: new mongoose.Types.ObjectId(driverId), status: "active" } },
            { $group: { _id: null, average: { $avg: "$rating" } } },
        ])

        // Get rating distribution
        const ratingDistribution = await Rating.aggregate([
            { $match: { driver: new mongoose.Types.ObjectId(driverId), status: "active" } },
            { $group: { _id: "$rating", count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ])

        // Format distribution for frontend
        const distribution = Array.from({ length: 5 }, (_, i) => {
            const found = ratingDistribution.find((item) => item._id === i + 1)
            return {
                rating: i + 1,
                count: found ? found.count : 0,
            }
        })

        // Get total ratings count
        const totalRatings = await Rating.countDocuments({
            driver: new mongoose.Types.ObjectId(driverId),
            status: "active",
        })

        // Get recent ratings
        const recentRatings = await Rating.find({
            driver: new mongoose.Types.ObjectId(driverId),
            status: "active",
        })
            .populate("user", "fullName profileImage")
            .sort({ createdAt: -1 })
            .limit(5)

        return res.status(200).json(
            createResponse(200, true, [], {
                averageRating: averageRating.length > 0 ? averageRating[0].average.toFixed(1) : "0.0",
                totalRatings,
                ratingDistribution: distribution,
                recentRatings,
            }),
        )
    } catch (error) {
        console.error("Error getting driver rating stats:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to fetch rating statistics"]))
    }
}

// Delete a rating (soft delete)
export const deleteRating = async (req, res) => {
    const { ratingId } = req.params
    const userId = req.user._id // From protectRoute middleware

    try {
        const rating = await Rating.findById(ratingId)

        if (!rating) {
            return res.status(404).json(createResponse(404, false, ["Rating not found"]))
        }

        // Check if the user owns this rating
        if (rating.user.toString() !== userId.toString()) {
            return res.status(403).json(createResponse(403, false, ["You are not authorized to delete this rating"]))
        }

        // Soft delete by updating status
        rating.status = "deleted"
        await rating.save()

        // Update driver's average rating
        await updateDriverAverageRating(rating.driver)

        return res.status(200).json(createResponse(200, true, ["Rating deleted successfully"]))
    } catch (error) {
        console.error("Error deleting rating:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to delete rating"]))
    }
}

// Update a rating
export const updateRating = async (req, res) => {
    const { ratingId } = req.params
    const { rating, feedback } = req.body
    const userId = req.user._id // From protectRoute middleware

    try {
        // Validate the rating value
        if (rating < 1 || rating > 5) {
            return res.status(400).json(createResponse(400, false, ["Rating must be between 1 and 5"]))
        }

        const existingRating = await Rating.findById(ratingId)

        if (!existingRating) {
            return res.status(404).json(createResponse(404, false, ["Rating not found"]))
        }

        // Check if the user owns this rating
        if (existingRating.user.toString() !== userId.toString()) {
            return res.status(403).json(createResponse(403, false, ["You are not authorized to update this rating"]))
        }

        // Update the rating
        existingRating.rating = rating
        if (feedback !== undefined) {
            existingRating.feedback = feedback
        }

        await existingRating.save()

        // Update driver's average rating
        await updateDriverAverageRating(existingRating.driver)

        return res.status(200).json(createResponse(200, true, ["Rating updated successfully"], { rating: existingRating }))
    } catch (error) {
        console.error("Error updating rating:", error)
        return res.status(500).json(createResponse(500, false, ["Failed to update rating"]))
    }
}

// Helper function to update driver's average rating
async function updateDriverAverageRating(driverId) {
    try {
        // Calculate new average rating
        const result = await Rating.aggregate([
            { $match: { driver: new mongoose.Types.ObjectId(driverId), status: "active" } },
            { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        ])

        let averageRating = 0
        let ratingCount = 0

        if (result.length > 0) {
            averageRating = result[0].averageRating
            ratingCount = result[0].count
        }

        // Update the driver's profile with the new average rating
        const driver = await User.findById(driverId)
        if (driver) {
            driver.rating = averageRating.toFixed(1)
            driver.ratingCount = ratingCount
            await driver.save()
        }

        return averageRating
    } catch (error) {
        console.error("Error updating driver average rating:", error)
        throw error
    }
}

