import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembers } from './useMembers';
import { useMembersFilters } from './useMembersFilters';
import { useMembersUI } from './useMembersUI';
import { Member } from '../../../../types/member.types';

interface UseMembersListReturn {
	// Data
	members: Member[];
	total: number;
	currentPage: number;
	pageSize: number;
	isLoading: boolean;

	// Filters
	filters: ReturnType<typeof useMembersFilters>;

	// UI State
	ui: ReturnType<typeof useMembersUI>;

	// Actions
	handlePaginationChange: (page: number, size: number) => void;
	handleSearchChange: (search: string) => void;
	handleStatusChange: (status: string) => void;
	handleAdvancedFiltersChange: (filters: any) => void;
	handleRemoveFilter: (filterKey: string) => void;
	handleClearAllAdvancedFilters: () => void;
	handleEditMember: (memberId: string) => void;
	refresh: () => void;
	debugFilters: () => void;
}

export const useMembersList = (): UseMembersListReturn => {
	const navigate = useNavigate();

	// Custom hooks
	const membersData = useMembers();
	const filters = useMembersFilters();
	const ui = useMembersUI();

	// Destructure members data
	const {
		members,
		total,
		currentPage,
		pageSize,
		isLoading,
		refresh,
		setPage,
		setPageSize,
		setSearch,
		setStatusFilter,
		updateParams,
	} = membersData;

	// Handle pagination
	const handlePaginationChange = useCallback(
		(page: number, size: number) => {
			console.log('handlePaginationChange called with:', { page, size });
			console.log('Current state before change:', { currentPage, pageSize });
			// Update both page and page size together to avoid conflicts
			updateParams({ page, limit: size });
			console.log('updateParams called with both page and limit');
		},
		[updateParams, currentPage, pageSize],
	);

	// Handle search
	const handleSearchChange = useCallback(
		(search: string) => {
			setSearch(search);
			filters.updateFilter('search', search);
			// Update API params to include search
			updateParams({
				...filters.filters,
				search,
				page: 1,
			});
		},
		[setSearch, filters, updateParams],
	);

	// Handle status filter
	const handleStatusChange = useCallback(
		(status: string) => {
			setStatusFilter(status);
			filters.updateFilter('status', status);
			// Update API params to include status
			updateParams({
				...filters.filters,
				status,
				page: 1,
			});
		},
		[setStatusFilter, filters, updateParams],
	);

	// Handle advanced filters change
	const handleAdvancedFiltersChange = useCallback(
		(newFilters: any) => {
			// Update local filters state
			Object.entries(newFilters).forEach(([key, value]) => {
				filters.updateFilter(key as keyof typeof filters.filters, value);
			});

			// Update API params
			updateParams({
				...newFilters,
				page: 1, // Reset to first page when filters change
			});
		},
		[filters, updateParams],
	);

	// Handle removing individual filter
	const handleRemoveFilter = useCallback(
		(filterKey: string) => {
			// Clear the specific filter from localStorage
			filters.clearFilter(filterKey as keyof typeof filters.filters);

			// Handle special cases for search and status
			if (filterKey === 'search') {
				setSearch('');
			}
			if (filterKey === 'status') {
				setStatusFilter('');
			}

			// Update API params
			const newFilters = { ...filters.filters };
			delete newFilters[filterKey as keyof typeof filters.filters];
			updateParams({
				...newFilters,
				page: 1,
			});
		},
		[filters, updateParams, setSearch, setStatusFilter],
	);

	// Handle clearing all advanced filters
	const handleClearAllAdvancedFilters = useCallback(() => {
		// Force clear all filters from localStorage
		filters.forceClearAllFilters();

		// Clear API state (search, status, etc.)
		setSearch('');
		setStatusFilter('');

		// Reset API params to empty state
		updateParams({
			page: 1,
			search: '',
			status: '',
		});
	}, [filters, updateParams, setSearch, setStatusFilter]);

	// Handle editing member
	const handleEditMember = useCallback(
		(memberId: string) => {
			navigate(`/gym-management/members/edit/${memberId}`);
		},
		[navigate],
	);

	return {
		// Data
		members,
		total,
		currentPage,
		pageSize,
		isLoading,

		// Filters
		filters,

		// UI State
		ui,

		// Actions
		handlePaginationChange,
		handleSearchChange,
		handleStatusChange,
		handleAdvancedFiltersChange,
		handleRemoveFilter,
		handleClearAllAdvancedFilters,
		handleEditMember,
		refresh,
		debugFilters: filters.debugFilters,
	};
};
