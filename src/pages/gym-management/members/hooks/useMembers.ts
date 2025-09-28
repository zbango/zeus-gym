import { useState, useCallback } from 'react';
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

	// RTK Query hooks
	const { data: membersData, isLoading, isError, error, refetch } = useGetMembersQuery(params);

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

	const setSearch = useCallback(
		(search: string) => {
			updateParams({ page: 1, search });
		},
		[updateParams],
	);

	const setStatusFilter = useCallback(
		(status: string) => {
			updateParams({ page: 1, status });
		},
		[updateParams],
	);

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
			} catch (error) {
				return {
					success: false,
					error: t('Failed to create member. Please try again.'),
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
			} catch (error) {
				return {
					success: false,
					error: t('Failed to update member. Please try again.'),
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
			} catch (error) {
				return {
					success: false,
					error: t('Failed to delete member. Please try again.'),
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
			} catch (error) {
				return {
					success: false,
					error: t('Failed to update member status. Please try again.'),
				};
			}
		},
		[updateMemberStatus, t],
	);

	// Refresh data
	const refresh = useCallback(() => {
		refetch();
	}, [refetch]);

	return {
		// Data
		members: membersData?.members || [],
		total: membersData?.total || 0,
		currentPage: membersData?.page || 1,
		pageSize: membersData?.limit || 10,

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
