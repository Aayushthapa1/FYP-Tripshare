import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/Slices/authSlice";
import driverReducer from "../components/Slices/driverSlice";
import tripReducer from "../components/Slices/tripSlice";
import userSlice from "../components/Slices/userSlice";
import bookingSlice from "../components/Slices/bookingSlice";



const store = configureStore({
    reducer: {
        auth: authReducer,
        driver: driverReducer,
        trip: tripReducer,
        user: userSlice,
        booking: bookingSlice,
    },
});

export default store;