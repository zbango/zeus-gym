import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface AttendanceRequest {
	customerId: string;
}

export interface AttendanceResponse {
	statusCode: number;
	message: string;
	attendance: {
		id: string;
		customerId: string;
		customerName: string;
		customerLastName: string;
		customerIdentification: string;
		attendanceDate: string;
		createdAt: string;
		createdBy: string;
	};
	customer: {
		id: string;
		name: string;
		lastName: string;
		email: string;
	};
	membership: {
		id: string;
		planName: string;
		planType: string;
		totalAmount: number;
		paidAmount: number;
		remainingAmount: number;
		remainingVisits: number;
		endDate: string;
	};
	hasReasonToAlert?: string;
}

export interface AttendanceErrorResponse {
	statusCode: number;
	body: {
		error: string;
	};
}

export interface AttendanceItem {
	id: string;
	customerId: string;
	customerFullName: string;
}

export interface GetAttendanceResponse {
	message: string;
	date: string;
	count: number;
	attendance: AttendanceItem[];
}

// API slice
export const attendanceApi = createApi({
	reducerPath: 'attendanceApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('gym_access_token');
			if (token) {
				headers.set('Authorization', `${token}`);
			}
			headers.set('Content-Type', 'application/json');
			return headers;
		},
	}),
	tagTypes: ['Attendance'],
	endpoints: (builder) => ({
		createAttendance: builder.mutation<AttendanceResponse, AttendanceRequest>({
			query: (attendanceData) => ({
				url: 'admin/attendance',
				method: 'POST',
				body: attendanceData,
			}),
			invalidatesTags: ['Attendance'],
		}),
		getAttendanceByDate: builder.query<GetAttendanceResponse, string>({
			query: (date) => `admin/attendance?date=${date}`,
			providesTags: ['Attendance'],
		}),
	}),
});

export const { useCreateAttendanceMutation, useGetAttendanceByDateQuery } = attendanceApi;
