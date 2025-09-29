import { configureStore } from '@reduxjs/toolkit';
import { membersApi } from './api/membersApi';
import { usersApi } from './api/usersApi';

export const store = configureStore({
	reducer: {
		[membersApi.reducerPath]: membersApi.reducer,
		[usersApi.reducerPath]: usersApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(membersApi.middleware, usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
