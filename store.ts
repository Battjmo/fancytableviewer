import { configureStore } from "@reduxjs/toolkit";
import opportunitiesReducer from "./opportunitiesSlice";

export const store = configureStore({
  reducer: {
    opportunities: opportunitiesReducer,
  },
});

// Types for dispatch and state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
