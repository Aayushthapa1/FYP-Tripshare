import Trip from "../models/TripModel.js";
import { createResponse } from "../utils/responseHelper.js";
// Create a new trip

export const createTrip = async (req, res, next) => {
  try {
    const {
      departureLocation,
      destinationLocation,
      departureDate,
      departureTime,
      price,
      availableSeats,
      description,
      vehicleDetails,
      preferences,
    } = req.body;

    // Validate required fields
    if (
      !departureLocation ||
      !destinationLocation ||
      !departureDate ||
      !departureTime ||
      !price ||
      !availableSeats ||
      !vehicleDetails?.model ||
      !vehicleDetails?.color ||
      !vehicleDetails?.plateNumber
    ) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [
            { message: "Please provide all required fields including vehicle details" },
          ])
        );
    }

    // Validate numerical values
    const priceNum = Number(price);
    const seatsNum = Number(availableSeats);
    if (isNaN(priceNum)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Price must be a number" }]));
    }
    if (isNaN(seatsNum)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Available seats must be a number" }]));
    }
    if (seatsNum < 1) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Available seats must be at least 1" }]));
    }

    // Validate departure date
    const departureDateObj = new Date(departureDate);
    if (departureDateObj <= new Date()) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Departure date must be in the future" }]));
    }

    const newTrip = await Trip.create({
      departureLocation,
      destinationLocation,
      departureDate: departureDateObj,
      departureTime,
      price: priceNum,
      availableSeats: seatsNum,
      description,
      vehicleDetails,
      preferences,
    });

    return res.status(201).json(
      createResponse(201, true, [], {
        message: "Trip created successfully",
        trip: newTrip,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get all trips
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find()
      .populate("driver", "fullName phoneNumber")
      .sort({ departureDate: 1 });

    return res.status(200).json(
      createResponse(200, true, [], {
        trips,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get trips by driver
export const getDriverTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ driver: req.user._id }).sort({
      departureDate: 1,
    });

    return res.status(200).json(
      createResponse(200, true, [], {
        trips,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Get single trip
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate(
      "driver",
      "fullName phoneNumber"
    );

    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        trip,
      })
    );
  } catch (error) {
    next(error);
  }
};

// Update trip
export const updateTrip = async (req, res, next) => {
  console.log("entered the uodate trip")

  try {
    const trip = await Trip.findById(req.params.tripId);
    console.log("The trip is", trip)
    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    // Check if the user is the trip driver
    // if (trip.driver.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json(
    //       createResponse(403, false, [
    //         { message: "Not authorized to update this trip" },
    //       ])
    //     );
    // }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      req.body,
      { new: true }
    );

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Trip updated successfully",
        trip: updatedTrip,
      })
    );
  } catch (error) {
    next(error);
  }
};
  
// Delete trip
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.tripId).populate("driver");
    console.log(trip)

    if (!trip) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "Trip not found" }]));
    }

    // if (!trip.driver || !trip.driver._id) {
    //   return res.status(400).json(
    //     createResponse(400, false, [
    //       { message: "Driver not associated with this trip" }
    //     ])
    //   );
    // }

    // if (trip.driver._id.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json(
    //       createResponse(403, false, [
    //         { message: "Not authorized to delete this trip" },
    //       ])
    //     );
    // }

    if (trip.bookedSeats.length > 0) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [
            { message: "Cannot delete trip with existing bookings" },
          ])
        );
    }

    await Trip.findByIdAndDelete(req.params.tripId);
    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Trip deleted successfully",
      })
    );
  } catch (error) {
    next(error);
  }
};

// Search trips
export const searchTrips = async (req, res, next) => {
  try {
    const {
      departureLocation,
      destinationLocation,
      departureDate,
      availableSeats,
    } = req.query;

    const query = {
      status: "scheduled",
    };

    if (departureLocation) {
      query.departureLocation = { $regex: departureLocation, $options: "i" };
    }
    if (destinationLocation) {
      query.destinationLocation = { $regex: destinationLocation, $options: "i" };
    }
    if (departureDate) {
      // Match trips on the same date regardless of time
      const date = new Date(departureDate);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      query.departureDate = {
        $gte: date,
        $lt: nextDate,
      };
    }
    if (availableSeats) {
      query.availableSeats = { $gte: parseInt(availableSeats) };
    }

    const trips = await Trip.find(query)
      .populate("driver", "fullName phoneNumber")
      .sort({ departureDate: 1 });

    return res.status(200).json(
      createResponse(200, true, [], {
        trips,
      })
    );
  } catch (error) {
    next(error);
  }
};
