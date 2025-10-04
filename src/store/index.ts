import { configureStore } from '@reduxjs/toolkit';
import { membersApi } from './api/membersApi';
import { usersApi } from './api/usersApi';
import { membershipPlansApi } from './api/membershipPlansApi';
import { paymentsApi } from './api/paymentsApi';
import { attendanceApi } from './api/attendanceApi';

export const store = configureStore({
	reducer: {
		[membersApi.reducerPath]: membersApi.reducer,
		[usersApi.reducerPath]: usersApi.reducer,
		[membershipPlansApi.reducerPath]: membershipPlansApi.reducer,
		[paymentsApi.reducerPath]: paymentsApi.reducer,
		[attendanceApi.reducerPath]: attendanceApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			membersApi.middleware,
			usersApi.middleware,
			membershipPlansApi.middleware,
			paymentsApi.middleware,
			attendanceApi.middleware,
		),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
