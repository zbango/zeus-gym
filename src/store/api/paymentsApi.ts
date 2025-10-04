import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types based on API response
export interface PaymentHistoric {
	id: string;
	customerId: string;
	membershipId: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	membershipPlanName: string;
	membershipPlanType: 'monthly' | 'count-based';
	amount: number;
	paymentMethod: 'cash' | 'card' | 'transfer';
	status: 'completed' | 'pending' | 'failed';
	reference: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
}

export interface Payment {
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	membershipPlanName: string;
	membershipTotalAmount: number;
	paidAmount: number;
	remaining: number;
	status: 'completed' | 'partial' | 'pending';
	createdAt: string;
	paymentHistorics: PaymentHistoric[];
}

export interface PaymentsResponse {
	message: string;
	payments: Payment[];
	total: number;
	page: number;
	limit: number;
}

export interface PaymentsParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}

export interface CreatePaymentRequest {
	customerId: string;
	amount: number;
	paymentMethod: 'cash' | 'card' | 'transfer';
	notes?: string;
}

export interface CreatePaymentResponse {
	message: string;
	payment: PaymentHistoric;
}

export const paymentsApi = createApi({
	reducerPath: 'paymentsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1',
		prepareHeaders: (headers) => {
			// Add authorization header if token exists
			const token = localStorage.getItem('gym_access_token');
			if (token) {
				headers.set('authorization', `${token}`);
			}
			headers.set('Content-Type', 'application/json');
			return headers;
		},
	}),
	tagTypes: ['Payments'],
	endpoints: (builder) => ({
		getPayments: builder.query<PaymentsResponse, PaymentsParams>({
			query: (params = {}) => {
				const searchParams = new URLSearchParams();

				if (params.page) searchParams.append('page', params.page.toString());
				if (params.limit) searchParams.append('limit', params.limit.toString());
				if (params.search) searchParams.append('search', params.search);
				if (params.status) searchParams.append('status', params.status);

				return `admin/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
			},
			providesTags: ['Payments'],
		}),

		createPayment: builder.mutation<CreatePaymentResponse, CreatePaymentRequest>({
			query: (paymentData) => ({
				url: 'admin/payments',
				method: 'POST',
				body: paymentData,
			}),
			invalidatesTags: ['Payments'],
		}),
	}),
});

export const { useGetPaymentsQuery, useCreatePaymentMutation } = paymentsApi;
