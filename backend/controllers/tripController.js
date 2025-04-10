
import Trip from "../models/TripModel.js";
import User from "../models/userModel.js"; 
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

    // Broadcast a "trip_created" event
    if (io) {
      io.emit("trip_created", {
        tripId: newTrip._id,
        driverId: userId,
        departureLocation,
        destinationLocation,
        departureDate,
        departureTime
      });
    }

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
        .json(createResponse(403, false, [{ message: "Not authorized" }]));
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

    // Broadcast a "trip_updated" event
    if (io) {
      io.emit("trip_updated", {
        tripId: trip._id,
        driverId,
        ...req.body // or pick specific fields you want to broadcast
      });
    }

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
      .json(createResponse(200, true, [], { message: "Trip deleted" }));
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

