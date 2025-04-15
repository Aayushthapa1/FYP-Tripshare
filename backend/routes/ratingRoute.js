// routes/ratingRoute.js

import express from 'express';
import { createRating, getDriverRatings, getRideRatings } from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /ratings/:rideId
 * @desc Create a rating for a completed ride
 */
router.post('/:rideId', verifyToken, createRating);

/**
 * @route GET /ratings/driver/:driverId
 * @desc Get all ratings for a specific driver + average rating
 */
router.get('/driver/:driverId', verifyToken, getDriverRatings);

/**
 * @route GET /ratings/ride/:rideId
 * @desc Get rating(s) for a specific ride
 */
router.get('/ride/:rideId', verifyToken, getRideRatings);

export default router;
