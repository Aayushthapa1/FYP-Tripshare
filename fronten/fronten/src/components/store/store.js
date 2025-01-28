import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../Feature/auth/authSlice.jsx";


const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});

export default store;
