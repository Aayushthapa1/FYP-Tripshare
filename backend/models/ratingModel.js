// models/Rating.js

import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride reference is required'],
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Passenger reference is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver reference is required'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be no greater than 5'],
      required: [true, 'Rating value is required'],
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure a passenger can only rate a ride once
ratingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
