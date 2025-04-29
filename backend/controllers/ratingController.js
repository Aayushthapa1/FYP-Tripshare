import Rating from "../models/ratingModel.js";
import Trip from "../models/tripModel.js";
import Ride from "../models/handleRideModel.js";
import UserModel from "../models/userModel.js";
import mongoose from "mongoose";

// Submit a new rating and review
export const submitRating = async (req, res) => {
  const {
    referenceId,
    referenceType,
    rating,
    review,
    categoryRatings
  } = req.body;

  try {
    // Get the user ID from authenticated session
    const userId = req.user._id;

    // Validate referenceType
    if (!["Trip", "Ride"].includes(referenceType)) {
      return res.status(400).json({ message: "Invalid reference type. Must be 'Trip' or 'Ride'" });
    }

    // Validate ratings
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Validate if the reference exists and is completed
    let driverId;
    let isCompleted = false;

    if (referenceType === "Trip") {
      const trip = await Trip.findById(referenceId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      if (trip.status !== "completed") {
        return res.status(400).json({ message: "Cannot rate trips that are not completed" });
      }
      // Check if user has booked this trip
      if (!trip.bookedSeats.includes(userId)) {
        return res.status(403).json({ message: "You can only rate trips you've booked" });
      }
      driverId = trip.driver._id;
      isCompleted = trip.status === "completed";
    } else if (referenceType === "Ride") {
      const ride = await Ride.findById(referenceId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      if (ride.status !== "completed") {
        return res.status(400).json({ message: "Cannot rate rides that are not completed" });
      }
      // Check if user is the passenger of this ride
      if (ride.passengerId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "You can only rate rides you've taken" });
      }
      driverId = ride.driverId;
      isCompleted = ride.status === "completed";
    }

    if (!isCompleted) {
      return res.status(400).json({ message: "Cannot rate incomplete trips/rides" });
    }

    // Check if user has already rated this reference
    const existingRating = await Rating.findOne({
      referenceId,
      referenceType,
      userId
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this trip/ride" });
    }

    // Create the new rating
    const newRating = new Rating({
      userId,
      driverId,
      referenceId,
      referenceType,
      rating,
      review,
      categoryRatings
    });

    await newRating.save();

    // Update the rating in the relevant document
    if (referenceType === "Ride") {
      await Ride.findByIdAndUpdate(referenceId, {
        rating,
        feedback: review
      });
    }

    // Calculate driver's rating statistics
    const driverRatings = await Rating.find({
      driverId,
      status: "active"
    });

    const totalRatings = driverRatings.length;
    const ratingSum = driverRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 0;

    // Update driver's average rating in user model if needed
    if (referenceType === "Ride" || referenceType === "Trip") {
      await UserModel.findByIdAndUpdate(driverId, {
        "driverRating.average": averageRating,
        "driverRating.count": totalRatings,
        "driverRating.lastUpdated": new Date()
      });
    }

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
      driverStats: {
        averageRating: parseFloat(averageRating),
        totalRatings
      }
    });

  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Failed to submit rating", error: error.message });
  }
};

// Get all ratings for a driver
// Get all ratings for a driver (with reference type filter)
  export const getDriverRatings = async (req, res) => {
    const { driverId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const referenceType = req.query.referenceType; // New filter parameter

    try {
      // Validate driver ID
      if (!mongoose.Types.ObjectId.isValid(driverId)) {
        return res.status(400).json({ message: "Invalid driver ID" });
      }

      // Build query condition
      const queryCondition = {
        driverId,
        status: "active"
      };

      // Add reference type filter if provided
      if (referenceType && ["Trip", "Ride"].includes(referenceType)) {
        queryCondition.referenceType = referenceType;
      }

      // Get ratings count
      const total = await Rating.countDocuments(queryCondition);

      // Get driver details
      const driver = await UserModel.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Get paginated ratings
      const ratings = await Rating.find(queryCondition)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "fullName")
        .lean();

      // Add reference details to each rating
      const enhancedRatings = await Promise.all(ratings.map(async (rating) => {
        let referenceDetails = null;

        if (rating.referenceType === "Trip") {
          referenceDetails = await Trip.findById(rating.referenceId)
            .select("departureLocation destinationLocation departureDate departureTime")
            .lean();
        } else if (rating.referenceType === "Ride") {
          referenceDetails = await Ride.findById(rating.referenceId)
            .select("pickupLocationName dropoffLocationName distance fare createdAt")
            .lean();
        }

        return {
          ...rating,
          referenceDetails
        };
      }));

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        ratings: enhancedRatings,
        driverInfo: {
          name: driver.fullName,
          averageRating: driver.driverRating?.average || 0,
          totalRatings: driver.driverRating?.count || 0
        },
        pagination: {
          total,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      console.error("Error fetching driver ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings", error: error.message });
    }
  };

// Get all ratings by the current user
export const getUserRatings = async (req, res) => {
  try {
    // Get user ID from authenticated session
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get ratings count
    const total = await Rating.countDocuments({ userId });

    // Get paginated ratings
    const ratings = await Rating.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("driverId", "fullName")
      .lean();

    // Add trip/ride details to each rating
    const enhancedRatings = await Promise.all(ratings.map(async (rating) => {
      let referenceDetails = null;

      if (rating.referenceType === "Trip") {
        referenceDetails = await Trip.findById(rating.referenceId)
          .select("departureLocation destinationLocation departureDate departureTime")
          .lean();
      } else if (rating.referenceType === "Ride") {
        referenceDetails = await Ride.findById(rating.referenceId)
          .select("pickupLocationName dropoffLocationName createdAt fare")
          .lean();
      }

      return {
        ...rating,
        referenceDetails
      };
    }));

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      ratings: enhancedRatings,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings", error: error.message });
  }
};

// Get a specific rating by ID
export const getRatingById = async (req, res) => {
  const { ratingId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.status(400).json({ message: "Invalid rating ID" });
    }

    const rating = await Rating.findById(ratingId)
      .populate("userId", "fullName")
      .populate("driverId", "fullName")
      .lean();

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Add trip/ride details
    let referenceDetails = null;

    if (rating.referenceType === "Trip") {
      referenceDetails = await Trip.findById(rating.referenceId)
        .select("departureLocation destinationLocation departureDate departureTime price vehicleDetails")
        .lean();
    } else if (rating.referenceType === "Ride") {
      referenceDetails = await Ride.findById(rating.referenceId)
        .select("pickupLocationName dropoffLocationName distance fare vehicleType createdAt")
        .lean();
    }

    res.status(200).json({
      ...rating,
      referenceDetails
    });

  } catch (error) {
    console.error("Error fetching rating details:", error);
    res.status(500).json({ message: "Failed to fetch rating", error: error.message });
  }
};

// Admin: Flag or remove inappropriate ratings

export const moderateRating = async (req, res) => {
  const { ratingId } = req.params;
  const { action, reason } = req.body;

  // Verify admin privileges
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Unauthorized: Admin privileges required" });
  }

  try {
    // Find the rating
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (action === "flag") {
      rating.status = "flagged";
      rating.flagReason = reason || "Inappropriate content";
    } else if (action === "delete") {
      rating.status = "deleted";
      rating.flagReason = reason || "Removed by admin";
    } else {
      return res.status(400).json({ message: "Invalid action. Must be 'flag' or 'delete'" });
    }

    await rating.save();

    res.status(200).json({ message: `Rating ${action}ged successfully`, rating });

  } catch (error) {
    console.error("Error moderating rating:", error);
    res.status(500).json({ message: "Failed to moderate rating", error: error.message });
  }
};


// Get a driver's rating summary
export const getDriverRatingSummary = async (req, res) => {
  const { driverId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    // Get driver details
    const driver = await UserModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Get category-specific averages
    const categoryAverages = await Rating.aggregate([
      { $match: { driverId: new mongoose.Types.ObjectId(driverId), status: "active" } },
      {
        $group: {
          _id: null,
          punctuality: { $avg: "$categoryRatings.punctuality" },
          cleanliness: { $avg: "$categoryRatings.cleanliness" },
          comfort: { $avg: "$categoryRatings.comfort" },
          drivingSkill: { $avg: "$categoryRatings.drivingSkill" },
          communication: { $avg: "$categoryRatings.communication" }
        }
      },
      {
        $project: {
          _id: 0,
          punctuality: { $round: ["$punctuality", 1] },
          cleanliness: { $round: ["$cleanliness", 1] },
          comfort: { $round: ["$comfort", 1] },
          drivingSkill: { $round: ["$drivingSkill", 1] },
          communication: { $round: ["$communication", 1] }
        }
      }
    ]);

    // Get rating distribution (1-5 stars)
    const ratingDistribution = await Rating.aggregate([
      { $match: { driverId: new mongoose.Types.ObjectId(driverId), status: "active" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format distribution as an object
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      const found = ratingDistribution.find(item => item._id === i);
      distribution[i] = found ? found.count : 0;
    }

    // Get recent reviews (limit to 3)
    const recentReviews = await Rating.find({
      driverId: driverId,
      status: "active",
      review: { $exists: true, $ne: "" }
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("userId", "fullName")
      .lean();

    res.status(200).json({
      driverInfo: {
        name: driver.fullName,
        averageRating: driver.driverRating?.average || 0,
        totalRatings: driver.driverRating?.count || 0
      },
      categoryAverages: categoryAverages.length > 0 ? categoryAverages[0] : {},
      distribution,
      recentReviews
    });

  } catch (error) {
    console.error("Error fetching driver rating summary:", error);
    res.status(500).json({ message: "Failed to fetch rating summary", error: error.message });
  }
};



