import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IGymUser } from '../../types/gym-types';

// API Base URL
const API_BASE_URL = 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1';

export interface CreateUserRequest {
	fullName: string;
	username: string;
	email: string;
	phone: string;
	role: 'admin' | 'staff';
	action: 'create' | 'update';
}

export interface UpdateUserRequest extends CreateUserRequest {
	id: string;
}

export interface UsersListResponse {
	users: IGymUser[];
	total: number;
	page: number;
	pageSize: number;
}

export interface UsersListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	role?: string;
	status?: string;
}

export const usersApi = createApi({
	reducerPath: 'usersApi',
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
	tagTypes: ['User'],
	endpoints: (builder) => ({
		// Get all users with pagination and filters
		getUsers: builder.query<UsersListResponse, UsersListParams>({
			query: (params) => {
				const { page = 1, pageSize = 10, search = '', role = '', status = '' } = params;
				const queryParams = new URLSearchParams();

				queryParams.append('page', page.toString());
				queryParams.append('pageSize', pageSize.toString());
				if (search) queryParams.append('search', search);
				if (role) queryParams.append('role', role);
				if (status) queryParams.append('status', status);

				return `admin/users?${queryParams.toString()}`;
			},
			providesTags: ['User'],
		}),

		// Get single user by ID
		getUserById: builder.query<IGymUser, string>({
			query: (id) => `admin/users/${id}`,
			providesTags: (result, error, id) => [{ type: 'User', id }],
		}),

		// Create new user
		createUser: builder.mutation<IGymUser, CreateUserRequest>({
			query: (newUser) => ({
				url: 'admin/users',
				method: 'POST',
				body: newUser,
			}),
			invalidatesTags: ['User'],
		}),

		// Update user
		updateUser: builder.mutation<IGymUser, UpdateUserRequest>({
			query: ({ id, ...updateData }) => ({
				url: `admin/users/${id}`,
				method: 'PUT',
				body: updateData,
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
		}),

		// Delete user
		deleteUser: builder.mutation<void, string>({
			query: (id) => ({
				url: `admin/users/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['User'],
		}),

		// Toggle user status
		toggleUserStatus: builder.mutation<IGymUser, { id: string; isActive: boolean }>({
			query: ({ id, isActive }) => ({
				url: `admin/users/${id}/status`,
				method: 'PATCH',
				body: { isActive },
			}),
			invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
		}),

		// Get user statistics
		getUserStats: builder.query<
			{
				total: number;
				active: number;
				inactive: number;
				admins: number;
				staff: number;
			},
			void
		>({
			query: () => 'admin/users/stats',
			providesTags: ['User'],
		}),
	}),
});

export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useToggleUserStatusMutation,
	useGetUserStatsQuery,
} = usersApi;
