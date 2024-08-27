import { configureStore } from '@reduxjs/toolkit';
import { apiService } from './apiService'; // Import the API service

export const store = configureStore({
    reducer: {
        // Add api service reducer to your store
        [apiService.reducerPath]: apiService.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiService.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;