import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// API Base URL
const API_BASE_URL = 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1';

// Types for membership renewal
export interface CreateMembershipRequest {
	customerId: string;
	membershipPlanId: string;
	startDate: string;
	totalAmount: number;
	initialPaymentAmount: number;
	paymentMethod: 'cash' | 'transfer';
}

export interface Membership {
	id: string;
	memberId: string;
	membershipPlanId: string;
	startDate: string;
	endDate?: string;
	totalAmount: number;
	status: 'active' | 'expired' | 'suspended';
	createdAt: string;
	updatedAt: string;
}

export const membershipsApi = createApi({
	reducerPath: 'membershipsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_BASE_URL,
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
	tagTypes: ['Membership'],
	endpoints: (builder) => ({
		// Create new membership (renewal)
		createMembership: builder.mutation<Membership, CreateMembershipRequest>({
			query: (newMembership) => ({
				url: 'admin/memberships',
				method: 'POST',
				body: newMembership,
			}),
			invalidatesTags: ['Membership'],
		}),
	}),
});

export const { useCreateMembershipMutation } = membershipsApi;
