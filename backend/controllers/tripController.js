import Trip from "../models/tripModel.js";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js"; // Added import for Booking model
import mongoose from "mongoose"; // Added import for transactions
import { createResponse } from "../utils/responseHelper.js";

/**
 * CREATE a new trip (driver only)
 */
export const createTrip = async (req, res, next) => {
  try {
    // The driver is the logged-in user
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Driver (User) not found" });
    }

    const {
      departureLocation,
      destinationLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
      vehicleDetails,
      preferences
    } = req.body;

    const newTrip = await Trip.create({
      driver: {
        _id: user._id,
        name: user.fullName || user.name || "Unnamed Driver",
        phoneNumber: user.phoneNumber || "N/A"
      },
      departureLocation,
      destinationLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
      vehicleDetails,
      preferences
    });
    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip: newTrip
    });
  } catch (error) {
    console.error("Error in createTrip:", error);
    next(error);
  }
};

/**
 * GET all trips
 */
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().sort({ departureDate: 1 });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in getAllTrips:", error);
    next(error);
  }
};

/**
 * GET single trip by ID
 */
export const getTripById = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    return res.status(200).json(createResponse(200, true, [], { trip }));
  } catch (error) {
    console.error("Error in getTripById:", error);
    next(error);
  }
};

/**
 * UPDATE a trip (driver only)
 */
export const updateTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    if (trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "Not authorized to update.Not associated with this trip" }]));
    }

    // optionally block direct driver overrides
    delete req.body.driver;

    if (req.body.departureDate) {
      const newDate = new Date(req.body.departureDate);
      if (newDate <= new Date()) {
        return res.status(400).json(
          createResponse(400, false, [
            { message: "Departure date must be in the future" }
          ])
        );
      }
    }

    Object.assign(trip, req.body);
    await trip.save();


    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Trip updated",
        trip
      })
    );
  } catch (error) {
    console.error("Error in updateTrip:", error);
    next(error);
  }
};

/**
 * DELETE a trip (driver only)
 */
export const deleteTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    if (trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "Not authorized" }]));
    }

    if (trip.bookedSeats && trip.bookedSeats.length > 0) {
      return res.status(400).json(
        createResponse(400, false, [
          { message: "Cannot delete trip with bookings" }
        ])
      );
    }

    await Trip.findByIdAndDelete(tripId);

    // Broadcast a "trip_deleted" event
    if (io) {
      io.emit("trip_deleted", {
        tripId,
        driverId
      });
    }

    return res
      .status(200)
      .json(createResponse(200, true, [], { message: "Trip deleted " }));
  } catch (error) {
    console.error("Error in deleteTrip:", error);
    next(error);
  }
};

/**
 * GET trips for the driver
 */
export const getDriverTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({ "driver._id": userId });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in getDriverTrips:", error);
    next(error);
  }
};

/**
 * SEARCH trips
 */
export const searchTrips = async (req, res, next) => {
  try {
    const {
      departureLocation,
      destinationLocation,
      departureDate,
      availableSeats
    } = req.query;

    const query = {};

    if (departureLocation) {
      query.departureLocation = { $regex: departureLocation, $options: "i" };
    }

    if (destinationLocation) {
      query.destinationLocation = { $regex: destinationLocation, $options: "i" };
    }

    if (departureDate) {
      const date = new Date(departureDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.departureDate = { $gte: date, $lt: nextDay };
    }

    if (availableSeats) {
      query.availableSeats = { $gte: parseInt(availableSeats) };
    }

    const trips = await Trip.find(query).sort({ departureDate: 1 });
    return res.status(200).json(createResponse(200, true, [], { trips }));
  } catch (error) {
    console.error("Error in searchTrips:", error);
    next(error);
  }
};

/**
 * Mark a trip as completed (driver only)
 */
/**
 * Mark a trip as completed (driver only)
 */
export const completeTrip = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { tripId } = req.params;

    // Validate tripId
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Invalid trip ID format" }])
      );
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    if (trip.driver._id.toString() !== driverId.toString()) {
      return res
        .status(403)
        .json(createResponse(403, false, [{ message: "Not authorized" }]));
    }

    // Check if trip can be marked as completed
    if (trip.status === "completed") {
      return res.status(400).json(
        createResponse(400, false, [
          { message: "Trip is already marked as completed" }
        ])
      );
    }

    // Create a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // First update any active bookings 
      // Mark all 'booked' bookings as 'completed'
      await Booking.updateMany(
        { trip: tripId, status: "booked" },
        { status: "completed" },
        { session }
      );

      // Cancel all 'pending' bookings with a reason
      await Booking.updateMany(
        { trip: tripId, status: "pending" },
        {
          status: "cancelled",
          rejectionReason: "Trip was marked as completed by the driver"
        },
        { session }
      );

      // Use the model's markAsCompleted method if available, otherwise update directly
      if (typeof trip.markAsCompleted === 'function') {
        const completionDetails = {
          actualDepartureTime: req.body.actualDepartureTime || trip.departureTime,
          actualArrivalTime: req.body.actualArrivalTime,
          notes: req.body.notes || "Completed by driver"
        };
        await trip.markAsCompleted(completionDetails);
      } else {
        // Fallback if method isn't available
        trip.status = "completed";
        trip.completionDetails = {
          completedAt: new Date(),
          actualDepartureTime: req.body.actualDepartureTime || trip.departureTime,
          actualArrivalTime: req.body.actualArrivalTime,
          notes: req.body.notes || "Completed by driver"
        };
        await trip.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(
        createResponse(200, true, [], {
          message: "Trip marked as completed successfully",
          trip
        })
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in completeTrip:", error);
    next(error);
  }
};

/**
 * GET driver trip statistics by time period
 */
export const getDriverTripStats = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    // Set up date range based on period
    if (startDate && endDate) {
      dateFilter = {
        departureDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case 'week':
          const lastWeek = new Date(now);
          lastWeek.setDate(now.getDate() - 7);
          dateFilter = { departureDate: { $gte: lastWeek } };
          break;
        case 'month':
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          dateFilter = { departureDate: { $gte: lastMonth } };
          break;
        case 'year':
          const lastYear = new Date(now);
          lastYear.setFullYear(now.getFullYear() - 1);
          dateFilter = { departureDate: { $gte: lastYear } };
          break;
        default:
          const last30Days = new Date(now);
          last30Days.setDate(now.getDate() - 30);
          dateFilter = { departureDate: { $gte: last30Days } };
      }
    }

    // Get trips created over time (grouped by day)
    const tripsOverTime = await Trip.aggregate([
      { $match: { "driver._id": driverId, ...dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$departureDate" }
          },
          count: { $sum: 1 },
          revenue: { $sum: { $multiply: ["$price", { $subtract: ["$availableSeats", { $size: { $ifNull: ["$bookedSeats", []] } }] }] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get popular routes
    const popularRoutes = await Trip.aggregate([
      { $match: { "driver._id": driverId } },
      {
        $group: {
          _id: {
            from: "$departureLocation",
            to: "$destinationLocation"
          },
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get booking rate statistics
    const bookingStats = await Trip.aggregate([
      { $match: { "driver._id": driverId, ...dateFilter } },
      {
        $project: {
          totalSeats: "$availableSeats",
          bookedSeats: { $size: { $ifNull: ["$bookedSeats", []] } },
          departureDate: 1
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalSeats: { $sum: "$totalSeats" },
          totalBooked: { $sum: "$bookedSeats" }
        }
      },
      {
        $project: {
          _id: 0,
          totalTrips: 1,
          totalSeats: 1,
          totalBooked: 1,
          occupancyRate: {
            $cond: [
              { $eq: ["$totalSeats", 0] },
              0,
              { $multiply: [{ $divide: ["$totalBooked", "$totalSeats"] }, 100] }
            ]
          }
        }
      }
    ]);

    // Get trip status distribution
    const tripStatusDistribution = await Trip.aggregate([
      { $match: { "driver._id": driverId } },
      {
        $group: {
          _id: "$status", // Assuming there's a status field, or you can create a computed one
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate completion rate
    const completionRate = await Trip.aggregate([
      { $match: { "driver._id": driverId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] }, // Assuming there's a status field
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] }
            ]
          }
        }
      }
    ]);

    return res.status(200).json(
      createResponse(200, true, [], {
        tripsOverTime,
        popularRoutes,
        bookingStats: bookingStats[0] || {
          totalTrips: 0,
          totalSeats: 0,
          totalBooked: 0,
          occupancyRate: 0
        },
        tripStatusDistribution,
        completionRate: completionRate[0] || {
          total: 0,
          completed: 0,
          completionRate: 0
        }
      })
    );
  } catch (error) {
    console.error("Error in getDriverTripStats:", error);
    next(error);
  }
};


export const getAdminTripAnalytics = async (req, res, next) => {
  try {
    // Admin role verification
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json(
        createResponse(403, false, [{ message: "Unauthorized access" }])
      );
    }

    // Destructure query params
    const {
      startDate,
      endDate,
      userType,
      status,
      period = 'month',
      groupBy = 'userType'
    } = req.query;

    // Date filter setup
    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        departureDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const periods = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
      };
      const days = periods[period] || 30;
      const pastDate = new Date(now.setDate(now.getDate() - days));
      dateFilter = { departureDate: { $gte: pastDate } };
    }

    // Status filter
    const statusFilter = status ? { status } : {};

    // Final trip filter
    const tripFilter = { ...dateFilter, ...statusFilter };

    // Fetch trips
    const trips = await Trip.find(tripFilter);
    const tripIds = trips.map(trip => trip._id);

    // Fetch bookings with user populated
    const bookings = await Booking.find({ trip: { $in: tripIds } })
      .populate({
        path: 'user',
        select: 'fullName email role phoneNumber'
      });

    // Initialize analytics object
    const analytics = {
      summary: {
        totalTrips: trips.length,
        totalBookings: bookings.length,
        totalRevenue: 0,
        averageOccupancyRate: 0,
        activeDrivers: new Set(),
        activePassengers: new Set()
      },
      tripsByStatus: {},
      tripsByUserType: {
        driver: [],
        passenger: []
      },
      bookingTrends: [],
      popularRoutes: [],
      userSegmentation: {
        newUsers: 0,
        returningUsers: 0
      },
      detailedBreakdown: []
    };

    // Counters
    let totalSeats = 0;
    let totalBookedSeats = 0;
    let routePopularity = {};
    let passengerBookingCounts = {};

    // Process trips
    trips.forEach(trip => {
      analytics.summary.activeDrivers.add(trip.driver._id.toString());

      // Count status
      analytics.tripsByStatus[trip.status] = (analytics.tripsByStatus[trip.status] || 0) + 1;

      totalSeats += trip.availableSeats;
      const bookedSeats = trip.bookedSeats ? trip.bookedSeats.length : 0;
      totalBookedSeats += bookedSeats;
      analytics.summary.totalRevenue += trip.price * bookedSeats;

      analytics.tripsByUserType.driver.push({
        tripId: trip._id,
        driverId: trip.driver._id,
        driverName: trip.driver.name,
        departureLocation: trip.departureLocation,
        destinationLocation: trip.destinationLocation,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        price: trip.price,
        availableSeats: trip.availableSeats,
        bookedSeats: bookedSeats,
        revenue: trip.price * bookedSeats,
        status: trip.status
      });
    });

    // Process bookings
    bookings.forEach(booking => {
      if (booking.user) {
        analytics.summary.activePassengers.add(booking.user._id.toString());

        passengerBookingCounts[booking.user._id] = (passengerBookingCounts[booking.user._id] || 0) + 1;

        const trip = trips.find(t => t._id.toString() === booking.trip.toString());

        if (trip) {
          const routeKey = `${trip.departureLocation} → ${trip.destinationLocation}`;
          if (!routePopularity[routeKey]) {
            routePopularity[routeKey] = {
              route: routeKey,
              count: 0,
              revenue: 0
            };
          }
          routePopularity[routeKey].count++;
          routePopularity[routeKey].revenue += trip.price;

          analytics.tripsByUserType.passenger.push({
            bookingId: booking._id,
            tripId: trip._id,
            passengerId: booking.user._id,
            passengerName: booking.user.fullName,
            passengerRole: booking.user.role,
            departureLocation: trip.departureLocation,
            destinationLocation: trip.destinationLocation,
            departureDate: trip.departureDate,
            departureTime: trip.departureTime,
            price: trip.price,
            status: booking.status,
            bookedAt: booking.createdAt
          });
        }
      }
    });

    // Calculate averages
    analytics.summary.averageOccupancyRate = totalSeats > 0 ? (totalBookedSeats / totalSeats) * 100 : 0;

    // Booking trends
    if (bookings.length > 0) {
      const bookingsByDate = {};
      bookings.forEach(booking => {
        const dateKey = new Date(booking.createdAt).toISOString().split('T')[0];
        bookingsByDate[dateKey] = (bookingsByDate[dateKey] || 0) + 1;
      });
      analytics.bookingTrends = Object.entries(bookingsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Route popularity
    analytics.popularRoutes = Object.values(routePopularity)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // New vs Returning users
    for (const [userId, count] of Object.entries(passengerBookingCounts)) {
      if (count === 1) {
        analytics.userSegmentation.newUsers++;
      } else {
        analytics.userSegmentation.returningUsers++;
      }
    }

    // Detailed breakdown
    if (groupBy === 'userType') {
      analytics.detailedBreakdown = analytics.tripsByUserType;
    } else if (groupBy === 'status') {
      const statusBreakdown = {};
      trips.forEach(trip => {
        if (!statusBreakdown[trip.status]) {
          statusBreakdown[trip.status] = [];
        }
        statusBreakdown[trip.status].push({
          tripId: trip._id,
          driver: trip.driver,
          departureLocation: trip.departureLocation,
          destinationLocation: trip.destinationLocation,
          departureDate: trip.departureDate,
          price: trip.price,
          bookedSeats: trip.bookedSeats ? trip.bookedSeats.length : 0,
          availableSeats: trip.availableSeats
        });
      });
      analytics.detailedBreakdown = statusBreakdown;
    } else if (groupBy === 'route') {
      analytics.detailedBreakdown = analytics.popularRoutes;
    }

    // Add userType specific analytics if needed
    if (userType) {
      const totalUsers = await User.countDocuments({ role: userType });
      analytics.userTypeSpecific = {
        userType,
        totalUsers,
        activeUsers: userType === 'driver' ? analytics.summary.activeDrivers.size : analytics.summary.activePassengers.size,
        activityData: [] // Optional: You can add advanced aggregation later
      };
    }

    return res.status(200).json(createResponse(200, true, [], { analytics }));

  } catch (error) {
    console.error("Error in getAdminTripAnalytics:", error);
    next(error);
  }
};

/**
 * Clean up expired trips with no bookings
 * This endpoint automatically removes trips that have passed their departure date and have no bookings
 */
export const cleanupExpiredTrips = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find trips that have passed their departure date and have no bookings
    const expiredTripsQuery = {
      departureDate: { $lt: today },
      status: { $nin: ["completed", "cancelled"] } // Only clean up trips that aren't already completed or cancelled
    };

    // Use a transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find all expired trips
      const expiredTrips = await Trip.find(expiredTripsQuery).session(session);

      if (!expiredTrips || expiredTrips.length === 0) {
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(
          createResponse(200, true, [], {
            message: "No expired trips to clean up",
            removedCount: 0
          })
        );
      }

      // Get trip IDs
      const expiredTripIds = expiredTrips.map(trip => trip._id);

      // Find trips with bookings
      const tripsWithBookings = await Booking.distinct("trip", {
        trip: { $in: expiredTripIds }
      }).session(session);

      // Convert to Set for faster lookups
      const tripsWithBookingsSet = new Set(tripsWithBookings.map(id => id.toString()));

      // Filter trips without bookings for deletion
      const tripsToDelete = expiredTrips.filter(trip =>
        !tripsWithBookingsSet.has(trip._id.toString())
      );

      const tripsToMarkCompleted = expiredTrips.filter(trip =>
        tripsWithBookingsSet.has(trip._id.toString())
      );

      let deletedCount = 0;
      let markedCompletedCount = 0;

      // Delete trips without bookings
      if (tripsToDelete.length > 0) {
        const deleteIds = tripsToDelete.map(trip => trip._id);
        const result = await Trip.deleteMany({
          _id: { $in: deleteIds }
        }).session(session);

        deletedCount = result.deletedCount;
      }

      // Mark trips with bookings as completed
      if (tripsToMarkCompleted.length > 0) {
        const updateIds = tripsToMarkCompleted.map(trip => trip._id);
        const result = await Trip.updateMany(
          { _id: { $in: updateIds } },
          {
            status: "completed",
            completionDetails: {
              completedAt: new Date(),
              notes: "Automatically marked as completed by system"
            }
          }
        ).session(session);

        markedCompletedCount = result.modifiedCount;

        // Also mark all pending bookings for these trips as completed
        await Booking.updateMany(
          {
            trip: { $in: updateIds },
            status: { $in: ["pending", "booked"] }
          },
          { status: "completed" }
        ).session(session);
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(
        createResponse(200, true, [], {
          message: `Clean-up successful: ${deletedCount} expired trips deleted, ${markedCompletedCount} trips marked as completed`,
          removedCount: deletedCount,
          completedCount: markedCompletedCount,
          totalProcessed: deletedCount + markedCompletedCount
        })
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error in cleanupExpiredTrips:", error);
    next(error);
  }
};