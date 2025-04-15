import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/Slices/authSlice";
import driverKYCReducer from "../components/Slices/driverKYCSlice";
import userKYCSlice from "../components/Slices/userKYCSlice";
import tripReducer from "../components/Slices/tripSlice";
import userSlice from "../components/Slices/userSlice";
import bookingSlice from "../components/Slices/bookingSlice";
import paymentReducer from "../components/Slices/paymentSlice";
import rideSlice from "../components/Slices/rideSlice";
import notificationReducer from "../components/Slices/notificationSlice";
import chatReducer from "../components/Slices/chatSlice";
import tripStatsReducer from "../components/Slices/driverDashboardSlice";
import ratingReducer from "../components/Slices/ratingSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        driverKYC : driverKYCReducer,
        userKYC : userKYCSlice,
        trip: tripReducer,
        user: userSlice,
        booking: bookingSlice,
        payment: paymentReducer,
        ride: rideSlice,
        notification : notificationReducer,
        chat: chatReducer,
        tripStats: tripStatsReducer,
        rating: ratingReducer,
    },
});

export default store;