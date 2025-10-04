import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	useGetMembersQuery,
	useCreateMemberMutation,
	useUpdateMemberMutation,
	useDeleteMemberMutation,
	useUpdateMemberStatusMutation,
} from '../../../../store/api/membersApi';
import {
	MemberListParams,
	CreateMemberRequest,
	UpdateMemberRequest,
} from '../../../../types/member.types';
import { extractErrorMessage, ERROR_MESSAGES } from '../../../../helpers/errorUtils';

export const useMembers = (initialParams?: Partial<MemberListParams>) => {
	const { t } = useTranslation();
	const [params, setParams] = useState<MemberListParams>({
		page: 1,
		limit: 10,
		search: '',
		status: '',
		sortBy: 'createdAt',
		sortOrder: 'desc',
		...initialParams,
	});

	// Local search and status state (separate from API params)
	const [localSearch, setLocalSearch] = useState('');
	const [localStatus, setLocalStatus] = useState('');

	// RTK Query hooks - fetch all data without search and status filters
	const {
		data: membersData,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetMembersQuery({
		...params,
		search: '', // Don't send search to API
		status: '', // Don't send status to API
	});

	const [createMember, { isLoading: isCreating }] = useCreateMemberMutation();
	const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
	const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMutation();
	const [updateMemberStatus, { isLoading: isUpdatingStatus }] = useUpdateMemberStatusMutation();

	// Parameter update functions
	const updateParams = useCallback((newParams: Partial<MemberListParams>) => {
		console.log('updateParams called with:', newParams);
		setParams((prev) => {
			const updated = { ...prev, ...newParams };
			console.log('Params updated from:', prev, 'to:', updated);
			return updated;
		});
	}, []);

	const setPage = useCallback(
		(page: number) => {
			console.log('setPage called with:', page);
			console.log('Current params before update:', params);
			updateParams({ page });
			console.log('updateParams called with page:', page);
		},
		[updateParams, params],
	);

	const setPageSize = useCallback(
		(limit: number) => {
			updateParams({ page: 1, limit });
		},
		[updateParams],
	);

	const setSearch = useCallback((search: string) => {
		setLocalSearch(search);
		// Don't update API params for search
	}, []);

	const setStatusFilter = useCallback((status: string) => {
		setLocalStatus(status);
		// Don't update API params for status
	}, []);

	const setSorting = useCallback(
		(sortBy: string, sortOrder: 'asc' | 'desc') => {
			updateParams({ sortBy, sortOrder });
		},
		[updateParams],
	);

	// CRUD operations
	const handleCreateMember = useCallback(
		async (memberData: CreateMemberRequest) => {
			try {
				const result = await createMember(memberData).unwrap();
				return { success: true, data: result };
			} catch (error: any) {
				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(error, t(ERROR_MESSAGES.CREATE_MEMBER));

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[createMember, t],
	);

	const handleUpdateMember = useCallback(
		async (memberData: UpdateMemberRequest) => {
			try {
				const result = await updateMember(memberData).unwrap();
				return { success: true, data: result };
			} catch (error: any) {
				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(error, t(ERROR_MESSAGES.UPDATE_MEMBER));

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[updateMember, t],
	);

	const handleDeleteMember = useCallback(
		async (memberId: string, memberName: string) => {
			const confirmed = window.confirm(
				t(
					'Are you sure you want to delete member "{{name}}"? This action cannot be undone.',
					{
						name: memberName,
					},
				),
			);

			if (!confirmed) {
				return { success: false, error: 'Operation cancelled' };
			}

			try {
				await deleteMember(memberId).unwrap();
				return { success: true };
			} catch (error: any) {
				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(error, t(ERROR_MESSAGES.DELETE_MEMBER));

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[deleteMember, t],
	);

	const handleUpdateStatus = useCallback(
		async (memberId: string, status: string) => {
			try {
				const result = await updateMemberStatus({ id: memberId, status }).unwrap();
				return { success: true, data: result };
			} catch (error: any) {
				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(error, t(ERROR_MESSAGES.UPDATE_STATUS));

				return {
					success: false,
					error: errorMessage,
				};
			}
		},
		[updateMemberStatus, t],
	);

	// Local filtering logic
	const allMembers = membersData?.members || [];
	const filteredMembers = useMemo(() => {
		let filtered = allMembers;

		// Apply search filter
		if (localSearch) {
			const searchLower = localSearch.toLowerCase();
			filtered = filtered.filter((member) => {
				return (
					member.personalInfo.firstName.toLowerCase().includes(searchLower) ||
					member.personalInfo.lastName.toLowerCase().includes(searchLower) ||
					member.personalInfo.identification.toLowerCase().includes(searchLower) ||
					`${member.personalInfo.firstName} ${member.personalInfo.lastName}`
						.toLowerCase()
						.includes(searchLower)
				);
			});
		}

		// Apply status filter
		if (localStatus) {
			filtered = filtered.filter((member) => {
				return member.status === localStatus;
			});
		}

		return filtered;
	}, [allMembers, localSearch, localStatus]);

	// Apply pagination to filtered results
	const startIndex = (params.page - 1) * params.limit;
	const endIndex = startIndex + params.limit;
	const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
	const totalFiltered = filteredMembers.length;

	// Refresh data
	const refresh = useCallback(() => {
		refetch();
	}, [refetch]);

	return {
		// Data
		members: paginatedMembers,
		total: totalFiltered,
		currentPage: params.page,
		pageSize: params.limit,

		// Loading states
		isLoading,
		isCreating,
		isUpdating,
		isDeleting,
		isUpdatingStatus,

		// Error states
		isError,
		error,

		// Parameters
		params,

		// Parameter setters
		setPage,
		setPageSize,
		setSearch,
		setStatusFilter,
		setSorting,
		updateParams,

		// CRUD operations
		createMember: handleCreateMember,
		updateMember: handleUpdateMember,
		deleteMember: handleDeleteMember,
		updateMemberStatus: handleUpdateStatus,

		// Utilities
		refresh,
	};
};
