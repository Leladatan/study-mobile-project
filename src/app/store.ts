import { configureStore } from '@reduxjs/toolkit';
import favoritesReducer from '../features/favorites/model/favoritesSlice';
import { catalogApi } from '../features/posts/api/catalogApi';

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(catalogApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
