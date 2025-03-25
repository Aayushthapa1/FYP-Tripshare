import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/Slices/authSlice";
import driverKYCSlice from "../components/Slices/driverKYCSlice";
import userKYCSlice from "../components/Slices/userKYCSlice";
import tripReducer from "../components/Slices/tripSlice";
import userSlice from "../components/Slices/userSlice";
import bookingSlice from "../components/Slices/bookingSlice";
import paymentSlice from "../components/Slices/paymentSlice";
import rideSlice from "../components/Slices/rideSlice";



const store = configureStore({
    reducer: {
        auth: authReducer,
        driverKYC : driverKYCSlice,
        userKYC : userKYCSlice,
        trip: tripReducer,
        user: userSlice,
        booking: bookingSlice,
        payment: paymentSlice,
        ride: rideSlice,
    },
});

export default store;