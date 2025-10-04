import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IMembershipPlan } from '../../types/gym-types';

// API Base URL
const API_BASE_URL = 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1';

export interface CreateMembershipPlanRequest {
	name: string;
	type: 'monthly' | 'count-based';
	price: number;
	duration?: number; // months for monthly plans
	visitCount?: number; // visits for count-based plans
	description: string;
	status: 'active' | 'inactive';
}

export interface UpdateMembershipPlanRequest extends CreateMembershipPlanRequest {
	id: string;
}

export interface MembershipPlansListResponse {
	plans: IMembershipPlan[];
	total: number;
	page: number;
	pageSize: number;
}

export interface MembershipPlansListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	type?: string;
	status?: string;
}

export const membershipPlansApi = createApi({
	reducerPath: 'membershipPlansApi',
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
	tagTypes: ['MembershipPlan'],
	endpoints: (builder) => ({
		// Get all membership plans with pagination and filters
		getMembershipPlans: builder.query<MembershipPlansListResponse, MembershipPlansListParams>({
			query: (params) => {
				const { page = 1, pageSize = 10, search = '', type = '', status = '' } = params;
				const queryParams = new URLSearchParams();

				queryParams.append('page', page.toString());
				queryParams.append('pageSize', pageSize.toString());
				if (search) queryParams.append('search', search);
				if (type) queryParams.append('type', type);
				if (status) queryParams.append('status', status);

				return `admin/membership-plans?${queryParams.toString()}`;
			},
			providesTags: (result) =>
				result
					? [
							...result.plans.map(({ id }) => ({
								type: 'MembershipPlan' as const,
								id,
							})),
							{ type: 'MembershipPlan' as const, id: 'LIST' },
						]
					: [{ type: 'MembershipPlan' as const, id: 'LIST' }],
		}),

		// Get single membership plan by ID
		getMembershipPlanById: builder.query<IMembershipPlan, string>({
			query: (id) => `admin/membership-plans/${id}`,
			providesTags: (result, error, id) => [{ type: 'MembershipPlan', id }],
		}),

		// Create new membership plan
		createMembershipPlan: builder.mutation<IMembershipPlan, CreateMembershipPlanRequest>({
			query: (newPlan) => ({
				url: 'admin/membership-plans',
				method: 'POST',
				body: newPlan,
			}),
			invalidatesTags: [{ type: 'MembershipPlan', id: 'LIST' }],
		}),

		// Update membership plan
		updateMembershipPlan: builder.mutation<IMembershipPlan, UpdateMembershipPlanRequest>({
			query: ({ id, ...updateData }) => ({
				url: `admin/membership-plans/${id}`,
				method: 'PATCH',
				body: updateData,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'MembershipPlan', id },
				{ type: 'MembershipPlan', id: 'LIST' },
			],
		}),

		// Delete membership plan
		deleteMembershipPlan: builder.mutation<void, string>({
			query: (id) => ({
				url: `admin/membership-plans/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'MembershipPlan', id },
				{ type: 'MembershipPlan', id: 'LIST' },
			],
		}),

		// Toggle membership plan status
		toggleMembershipPlanStatus: builder.mutation<
			IMembershipPlan,
			{ id: string; status: 'active' | 'inactive' }
		>({
			query: ({ id, status }) => ({
				url: `admin/membership-plans/${id}`,
				method: 'PATCH',
				body: { status },
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'MembershipPlan', id },
				{ type: 'MembershipPlan', id: 'LIST' },
			],
		}),

		// Get membership plans statistics
		getMembershipPlanStats: builder.query<
			{
				total: number;
				active: number;
				inactive: number;
				monthly: number;
				countBased: number;
			},
			void
		>({
			query: () => 'admin/membership-plans/stats',
			providesTags: ['MembershipPlan'],
		}),
	}),
});

export const {
	useGetMembershipPlansQuery,
	useGetMembershipPlanByIdQuery,
	useCreateMembershipPlanMutation,
	useUpdateMembershipPlanMutation,
	useDeleteMembershipPlanMutation,
	useToggleMembershipPlanStatusMutation,
	useGetMembershipPlanStatsQuery,
} = membershipPlansApi;
