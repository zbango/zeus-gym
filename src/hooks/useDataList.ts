import { useState, useCallback, useMemo } from 'react';

export interface DataListParams {
	search?: string;
	status?: string;
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface AdvancedFilters {
	[key: string]: any;
}

export interface UseDataListOptions<T> {
	initialParams?: Partial<DataListParams>;
	initialAdvancedFilters?: AdvancedFilters;
	onParamsChange?: (params: DataListParams) => void;
	onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
}

export interface UseDataListReturn<T> {
	// State
	params: DataListParams;
	advancedFilters: AdvancedFilters;
	showAdvancedFilters: boolean;
	searchInput: string;

	// Actions
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
	setSearch: (search: string) => void;
	setStatusFilter: (status: string) => void;
	setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
	setAdvancedFilters: (filters: AdvancedFilters) => void;
	setShowAdvancedFilters: (show: boolean) => void;

	// Computed
	activeFiltersCount: number;

	// Utilities
	clearAllFilters: () => void;
	handleSearchChange: (value: string) => void;
	handleAdvancedFilterChange: (filterKey: string, value: any) => void;
	handlePaginationChange: (page: number, size: number) => void;
}

export function useDataList<T = any>({
	initialParams = {},
	initialAdvancedFilters = {},
	onParamsChange,
	onAdvancedFiltersChange,
}: UseDataListOptions<T> = {}): UseDataListReturn<T> {
	// State
	const [params, setParams] = useState<DataListParams>({
		page: 1,
		pageSize: 10,
		...initialParams,
	});

	const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(initialAdvancedFilters);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [searchInput, setSearchInput] = useState(params.search || '');

	// Actions
	const setPage = useCallback(
		(page: number) => {
			const newParams = { ...params, page };
			setParams(newParams);
			onParamsChange?.(newParams);
		},
		[params, onParamsChange],
	);

	const setPageSize = useCallback(
		(size: number) => {
			const newParams = { ...params, pageSize: size, page: 1 };
			setParams(newParams);
			onParamsChange?.(newParams);
		},
		[params, onParamsChange],
	);

	const setSearch = useCallback(
		(search: string) => {
			const newParams = { ...params, search, page: 1 };
			setParams(newParams);
			onParamsChange?.(newParams);
		},
		[params, onParamsChange],
	);

	const setStatusFilter = useCallback(
		(status: string) => {
			const newParams = { ...params, status, page: 1 };
			setParams(newParams);
			onParamsChange?.(newParams);
		},
		[params, onParamsChange],
	);

	const setSort = useCallback(
		(sortBy: string, sortOrder: 'asc' | 'desc') => {
			const newParams = { ...params, sortBy, sortOrder, page: 1 };
			setParams(newParams);
			onParamsChange?.(newParams);
		},
		[params, onParamsChange],
	);

	const handleAdvancedFilterChange = useCallback(
		(filterKey: string, value: any) => {
			const newFilters = {
				...advancedFilters,
				[filterKey]: value,
			};
			setAdvancedFilters(newFilters);
			onAdvancedFiltersChange?.(newFilters);
		},
		[advancedFilters, onAdvancedFiltersChange],
	);

	// Computed
	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (searchInput) count++;
		if (params.status) count++;

		// Count advanced filters
		Object.values(advancedFilters).forEach((value) => {
			if (value !== null && value !== undefined && value !== '') {
				if (typeof value === 'object' && value !== null) {
					// Handle range objects
					if (value.min || value.max || value.start || value.end) {
						count++;
					}
				} else {
					count++;
				}
			}
		});

		return count;
	}, [searchInput, params.status, advancedFilters]);

	// Utilities
	const clearAllFilters = useCallback(() => {
		setSearchInput('');
		setParams((prev) => ({
			...prev,
			search: '',
			status: '',
			page: 1,
		}));
		setAdvancedFilters({});
		onParamsChange?.({
			...params,
			search: '',
			status: '',
			page: 1,
		});
		onAdvancedFiltersChange?.({});
	}, [params, onParamsChange, onAdvancedFiltersChange]);

	const handleSearchChange = useCallback(
		(value: string) => {
			setSearchInput(value);
			// Debounce search
			const timeoutId = setTimeout(() => {
				setSearch(value);
			}, 300);
			return () => clearTimeout(timeoutId);
		},
		[setSearch],
	);

	const handlePaginationChange = useCallback(
		(page: number, size: number) => {
			setPage(page);
			if (size !== params.pageSize) {
				setPageSize(size);
			}
		},
		[setPage, setPageSize, params.pageSize],
	);

	return {
		// State
		params,
		advancedFilters,
		showAdvancedFilters,
		searchInput,

		// Actions
		setPage,
		setPageSize,
		setSearch,
		setStatusFilter,
		setSort,
		setAdvancedFilters,
		setShowAdvancedFilters,

		// Computed
		activeFiltersCount,

		// Utilities
		clearAllFilters,
		handleSearchChange,
		handleAdvancedFilterChange,
		handlePaginationChange,
	};
}
