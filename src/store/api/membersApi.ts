import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
	Member,
	CreateMemberRequest,
	UpdateMemberRequest,
	MemberListResponse,
	MemberListParams,
} from '../../types/member.types';
import { mockMembers as initialMockMembers } from '../../common/data/gymMockData';

// LocalStorage key for persisting members data
const MEMBERS_STORAGE_KEY = 'zeus_gym_members';

// Function to get members from localStorage or fallback to initial data
const getStoredMembers = (): Member[] => {
	try {
		const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Merge with initial members to ensure we have all required fields
			return parsed.map((member: any) => ({
				...member,
				// Ensure all required fields exist
				createdAt: member.createdAt || new Date().toISOString(),
				updatedAt: member.updatedAt || new Date().toISOString(),
				registrationDate:
					member.registrationDate || member.createdAt || new Date().toISOString(),
			}));
		}
	} catch (error) {
		console.warn('Failed to parse stored members:', error);
	}
	// Convert IMember to Member format
	return initialMockMembers.map((member) => ({
		...member,
		createdAt: (member as any).createdAt || new Date().toISOString(),
		updatedAt: (member as any).updatedAt || new Date().toISOString(),
	}));
};

// Function to save members to localStorage
const saveMembersToStorage = (members: Member[]) => {
	try {
		localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
	} catch (error) {
		console.warn('Failed to save members to localStorage:', error);
	}
};

// Initialize with stored data or fallback to initial data
let mockMembers = getStoredMembers();

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
						? sortBy.split('.').reduce((obj: any, key) => obj[key], a)
						: (a as any)[sortBy];
					const bValue = sortBy.includes('.')
						? sortBy.split('.').reduce((obj: any, key) => obj[key], b)
						: (b as any)[sortBy];

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

				// Add the new member to our persistent mock data
				mockMembers.push(member);

				// Save to localStorage
				saveMembersToStorage(mockMembers);

				return { data: member };
			},
			invalidatesTags: ['Member'],
		}),

		// Update member
		updateMember: builder.mutation<Member, UpdateMemberRequest>({
			queryFn: async ({ id, ...updateData }) => {
				await delay(600);
				const memberIndex = mockMembers.findIndex((m) => m.id === id);
				if (memberIndex === -1) {
					return { error: { status: 404, data: 'Member not found' } };
				}

				const updatedMember: Member = {
					...mockMembers[memberIndex],
					...updateData,
					updatedAt: new Date().toISOString(),
				};

				// Update the member in our persistent mock data
				mockMembers[memberIndex] = updatedMember;

				// Save to localStorage
				saveMembersToStorage(mockMembers);

				return { data: updatedMember };
			},
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),

		// Delete member
		deleteMember: builder.mutation<void, string>({
			queryFn: async (id) => {
				await delay(400);
				const memberIndex = mockMembers.findIndex((m) => m.id === id);
				if (memberIndex === -1) {
					return { error: { status: 404, data: 'Member not found' } };
				}

				// Remove the member from our persistent mock data
				mockMembers.splice(memberIndex, 1);

				// Save to localStorage
				saveMembersToStorage(mockMembers);

				return { data: undefined };
			},
			invalidatesTags: ['Member'],
		}),

		// Update member status
		updateMemberStatus: builder.mutation<Member, { id: string; status: string }>({
			queryFn: async ({ id, status }) => {
				await delay(300);
				const memberIndex = mockMembers.findIndex((m) => m.id === id);
				if (memberIndex === -1) {
					return { error: { status: 404, data: 'Member not found' } };
				}

				const updatedMember: Member = {
					...mockMembers[memberIndex],
					membershipInfo: {
						...mockMembers[memberIndex].membershipInfo,
						status: status as any,
					},
					updatedAt: new Date().toISOString(),
				};

				// Update the member in our persistent mock data
				mockMembers[memberIndex] = updatedMember;

				// Save to localStorage
				saveMembersToStorage(mockMembers);

				return { data: updatedMember };
			},
			invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }],
		}),
	}),
});

// Utility function to clear stored data (for development/testing)
export const clearStoredMembers = () => {
	try {
		localStorage.removeItem(MEMBERS_STORAGE_KEY);
		// Reset to initial data
		mockMembers = initialMockMembers.map((member) => ({
			...member,
			createdAt: (member as any).createdAt || new Date().toISOString(),
			updatedAt: (member as any).updatedAt || new Date().toISOString(),
		}));
		saveMembersToStorage(mockMembers);
		console.log('Stored members data cleared and reset to initial data');
	} catch (error) {
		console.warn('Failed to clear stored members:', error);
	}
};

// Utility function to reset to initial data
export const resetToInitialData = () => {
	try {
		mockMembers = initialMockMembers.map((member) => ({
			...member,
			createdAt: (member as any).createdAt || new Date().toISOString(),
			updatedAt: (member as any).updatedAt || new Date().toISOString(),
		}));
		saveMembersToStorage(mockMembers);
		console.log('Members data reset to initial data');
	} catch (error) {
		console.warn('Failed to reset members data:', error);
	}
};

export const {
	useGetMembersQuery,
	useGetMemberByIdQuery,
	useCreateMemberMutation,
	useUpdateMemberMutation,
	useDeleteMemberMutation,
	useUpdateMemberStatusMutation,
} = membersApi;
