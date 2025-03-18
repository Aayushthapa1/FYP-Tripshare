import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/Slices/authSlice";
import KYCReducer from "../components/Slices/KYCSlice";
import tripReducer from "../components/Slices/tripSlice";
import userSlice from "../components/Slices/userSlice";
import bookingSlice from "../components/Slices/bookingSlice";
import paymentSlice from "../components/Slices/paymentSlice";



const store = configureStore({
    reducer: {
        auth: authReducer,
        driver: KYCReducer,
        trip: tripReducer,
        user: userSlice,
        booking: bookingSlice,
        payment: paymentSlice,
    },
});

export default store;