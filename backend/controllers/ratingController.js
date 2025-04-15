// controllers/ratingController.js

import Rating from '../models/Rating.js';
import Ride from '../models/Ride.js';

/**
 * POST /ratings/:rideId
 * Create a rating for a completed ride (we had this in the previous example).
 */
export const createRating = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, feedback } = req.body;

    // Basic validation for rating presence
    if (!rating) {
      return res.status(400).json({ message: 'Rating value is required.' });
    }

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found.' });
    }

    // Ensure the ride is completed before rating
    if (ride.status !== 'completed') {
      return res.status(400).json({
        message: 'You cannot rate a ride that is not completed.',
      });
    }

    // Ensure the user is the passenger who took the ride
    if (ride.passengerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You are not authorized to rate this ride.',
      });
    }

    // Check if there's already a rating from this passenger for the ride
    const existingRating = await Rating.findOne({
      ride: rideId,
      passenger: req.user._id,
    });
    if (existingRating) {
      return res
        .status(400)
        .json({ message: 'You have already rated this ride.' });
    }

    // Create the rating document
    const newRating = new Rating({
      ride: ride._id,
      passenger: req.user._id,
      driver: ride.driverId,
      rating,
      feedback,
    });

    await newRating.save();

    return res.status(201).json({
      message: 'Rating submitted successfully.',
      rating: newRating,
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /ratings/driver/:driverId
 * Retrieve all ratings for a particular driver, plus an average rating if desired.
 */
export const getDriverRatings = async (req, res) => {
  try {
    const { driverId } = req.params;

    // Fetch all ratings for this driver
    const ratings = await Rating.find({ driver: driverId })
      .populate('ride', 'pickupLocationName dropoffLocationName')
      .populate('passenger', 'name email'); // Example fields

    if (ratings.length === 0) {
      return res
        .status(200)
        .json({ message: 'No ratings for this driver yet.', ratings: [] });
    }

    // Calculate average rating
    const total = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = (total / ratings.length).toFixed(2); // e.g. "4.33"

    return res.status(200).json({
      message: 'Driver ratings fetched successfully.',
      averageRating,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error('Error fetching driver ratings:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET /ratings/ride/:rideId
 * Retrieve rating(s) for a specific ride.
 * (If the model allows multiple passengers to rate, this could return an array.)
 */
export const getRideRatings = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ratings = await Rating.find({ ride: rideId })
      .populate('driver', 'name email')
      .populate('passenger', 'name email'); // Example fields

    if (ratings.length === 0) {
      return res
        .status(200)
        .json({ message: 'No ratings for this ride yet.', ratings: [] });
    }

    return res.status(200).json({
      message: 'Ride ratings fetched successfully.',
      ratings,
    });
  } catch (error) {
    console.error('Error fetching ride ratings:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
