// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Feature/auth/authSlice"; // Renamed import

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
