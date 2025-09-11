import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	Member,
	CreateMemberRequest,
	UpdateMemberRequest,
	MemberListResponse,
	MemberListParams,
} from '../../types/member.types';
import { mockMembers } from '../../common/data/gymMockData';

// Mock delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const membersApi = createApi({
	reducerPath: 'membersApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/members',
		// For now, we'll mock the responses
	}),
	tagTypes: ['Member'],
	endpoints: (builder) => ({
		// Get all members with pagination and filters
		getMembers: builder.query<MemberListResponse, MemberListParams>({
			queryFn: async (params) => {
				await delay(500); // Simulate network delay

				const {
					page = 1,
					limit = 10,
					search = '',
					status = '',
					sortBy = 'createdAt',
					sortOrder = 'desc',
				} = params;

				let filteredMembers = [...mockMembers];

				// Apply search filter
				if (search) {
					filteredMembers = filteredMembers.filter(
						(member) =>
							member.personalInfo.firstName
								.toLowerCase()
								.includes(search.toLowerCase()) ||
							member.personalInfo.lastName
								.toLowerCase()
								.includes(search.toLowerCase()) ||
							member.personalInfo.email.toLowerCase().includes(search.toLowerCase()),
					);
				}

				// Apply status filter
				if (status) {
					filteredMembers = filteredMembers.filter(
						(member) => member.membershipInfo.status === status,
					);
				}

				// Apply sorting
				filteredMembers.sort((a, b) => {
					const aValue = sortBy.includes('.')
						? sortBy.split('.').reduce((obj, key) => obj[key], a)
						: a[sortBy as keyof Member];
					const bValue = sortBy.includes('.')
						? sortBy.split('.').reduce((obj, key) => obj[key], b)
						: b[sortBy as keyof Member];

					if (sortOrder === 'asc') {
						return aValue > bValue ? 1 : -1;
					} else {
						return aValue < bValue ? 1 : -1;
					}
				});

				// Apply pagination
				const total = filteredMembers.length;
				const startIndex = (page - 1) * limit;
				const endIndex = startIndex + limit;
				const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

				return {
					data: {
						members: paginatedMembers,
						total,
						page,
						limit,
					},
				};
			},
			providesTags: ['Member'],
		}),

		// Get single member by ID
		getMemberById: builder.query<Member, string>({
			queryFn: async (id) => {
				await delay(300);
				const member = mockMembers.find((m) => m.id === id);
				if (!member) {
					return { error: { status: 404, data: 'Member not found' } };
				}
				return { data: member };
			},
			providesTags: (result, error, id) => [{ type: 'Member', id }],
		}),

		// Create new member
		createMember: builder.mutation<Member, CreateMemberRequest>({
			queryFn: async (newMember) => {
				await delay(800);
				const member: Member = {
					id: `member-${Date.now()}`,
					...newMember,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					registrationDate: new Date().toISOString(),
					progressTracking: {
						measurements: [
							{
								date: new Date().toISOString(),
								weight: newMember.healthInfo.currentWeight,
								notes: 'Medición inicial al registro',
							},
						],
					},
				};

				// In a real app, this would be sent to the server
				// For now, we'll just return the created member
				return { data: member };
			},
			invalidatesTags: ['Member'],
		}),

		// Update member
		updateMember: builder.mutation<Member, UpdateMemberRequest>({
			queryFn: async ({ id, ...updateData }) => {
				await delay(600);
				const existingMember = mockMembers.find((m) => m.id === id);
				if (!existingMember) {
					return { error: { status: 404, data: 'Member not found' } };
				}

				const updatedMember: Member = {
					...existingMember,
					...updateData,
					updatedAt: new Date().toISOString(),
				};

				return { data: updatedMember };
			},
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),

		// Delete member
		deleteMember: builder.mutation<void, string>({
			queryFn: async (id) => {
				await delay(400);
				const memberExists = mockMembers.find((m) => m.id === id);
				if (!memberExists) {
					return { error: { status: 404, data: 'Member not found' } };
				}
				return { data: undefined };
			},
			invalidatesTags: ['Member'],
		}),

		// Update member status
		updateMemberStatus: builder.mutation<Member, { id: string; status: string }>({
			queryFn: async ({ id, status }) => {
				await delay(300);
				const existingMember = mockMembers.find((m) => m.id === id);
				if (!existingMember) {
					return { error: { status: 404, data: 'Member not found' } };
				}

				const updatedMember: Member = {
					...existingMember,
					membershipInfo: {
						...existingMember.membershipInfo,
						status: status as any,
					},
					updatedAt: new Date().toISOString(),
				};

				return { data: updatedMember };
			},
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),
	}),
});

export const {
	useGetMembersQuery,
	useGetMemberByIdQuery,
	useCreateMemberMutation,
	useUpdateMemberMutation,
	useDeleteMemberMutation,
	useUpdateMemberStatusMutation,
} = membersApi;
