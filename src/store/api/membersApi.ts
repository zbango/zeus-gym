import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	Member,
	CreateMemberRequest,
	UpdateMemberRequest,
	MemberListResponse,
	MemberListParams,
} from '../../types/member.types';

// API Base URL
const API_BASE_URL = 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1';

export const membersApi = createApi({
	reducerPath: 'membersApi',
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
	tagTypes: ['Member'],
	endpoints: (builder) => ({
		// Get all customers
		getMembers: builder.query<MemberListResponse, MemberListParams>({
			query: () => 'admin/customers',
			providesTags: ['Member'],
		}),

		// Get single customer by ID
		getMemberById: builder.query<{ member: Member }, string>({
			query: (id) => `admin/customers/${id}`,
			providesTags: (result, error, id) => [{ type: 'Member', id }],
		}),

		// Get customer by identification number
		getCustomerByIdentification: builder.query<{ member: Member }, string>({
			query: (identification) => `admin/customer-by-identification/${identification}`,
			providesTags: (result, error, identification) => [
				{ type: 'Member', id: identification },
			],
		}),

		// Create new customer
		createMember: builder.mutation<Member, CreateMemberRequest>({
			query: (newMember) => ({
				url: 'admin/customers',
				method: 'POST',
				body: newMember,
			}),
			invalidatesTags: ['Member'],
		}),

		// Update customer
		updateMember: builder.mutation<Member, UpdateMemberRequest>({
			query: ({ id, ...updateData }) => ({
				url: `admin/customers/${id}`,
				method: 'PATCH',
				body: updateData,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),

		// Delete customer
		deleteMember: builder.mutation<void, string>({
			query: (id) => ({
				url: `admin/customers/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Member'],
		}),

		// Update customer status
		updateMemberStatus: builder.mutation<Member, { id: string; status: string }>({
			query: ({ id, status }) => ({
				url: `admin/customers/${id}`,
				method: 'PATCH',
				body: { status },
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),
	}),
});

export const {
	useGetMembersQuery,
	useGetMemberByIdQuery,
	useGetCustomerByIdentificationQuery,
	useCreateMemberMutation,
	useUpdateMemberMutation,
	useDeleteMemberMutation,
	useUpdateMemberStatusMutation,
} = membersApi;
