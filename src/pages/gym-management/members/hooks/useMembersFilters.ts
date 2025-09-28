import { useState, useCallback, useEffect, useMemo } from 'react';

export interface MembersFilters {
	search?: string;
	status?: string;
	gender?: string;
	ageRange?: { min: number; max: number };
	weightRange?: { min: number; max: number };
	heightRange?: { min: number; max: number };
	membershipType?: string;
	registrationDateRange?: { start: string; end: string };
}

interface UseMembersFiltersReturn {
	filters: MembersFilters;
	activeFiltersCount: number;
	updateFilter: (key: keyof MembersFilters, value: any) => void;
	clearFilter: (key: keyof MembersFilters) => void;
	clearAllFilters: () => void;
	forceClearAllFilters: () => void;
	hasActiveFilters: boolean;
	debugFilters: () => void;
}

const FILTERS_STORAGE_KEY = 'zeus_gym_members_filters';

export const useMembersFilters = (): UseMembersFiltersReturn => {
	// Load filters from localStorage on initialization
	const [filters, setFilters] = useState<MembersFilters>(() => {
		try {
			const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
			return stored ? JSON.parse(stored) : {};
		} catch (error) {
			console.warn('Failed to load filters from localStorage:', error);
			return {};
		}
	});

	// Save filters to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
		} catch (error) {
			console.warn('Failed to save filters to localStorage:', error);
		}
	}, [filters]);

	// Calculate active filters count
	const activeFiltersCount = useMemo(() => {
		let count = 0;

		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				if (typeof value === 'object' && value !== null) {
					// Handle range objects
					if (key.includes('Range')) {
						const range = value as {
							min?: number;
							max?: number;
							start?: string;
							end?: string;
						};
						if (range.min || range.max || range.start || range.end) {
							count++;
						}
					}
				} else {
					count++;
				}
			}
		});

		return count;
	}, [filters]);

	// Check if there are any active filters
	const hasActiveFilters = activeFiltersCount > 0;

	// Update a specific filter
	const updateFilter = useCallback((key: keyof MembersFilters, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	// Clear a specific filter
	const clearFilter = useCallback((key: keyof MembersFilters) => {
		setFilters((prev) => {
			const newFilters = { ...prev };
			delete newFilters[key];
			return newFilters;
		});
	}, []);

	// Clear all filters
	const clearAllFilters = useCallback(() => {
		setFilters({});
		// Also clear from localStorage immediately
		try {
			localStorage.removeItem(FILTERS_STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to clear filters from localStorage:', error);
		}
	}, []);

	// Force clear all filters (including localStorage)
	const forceClearAllFilters = useCallback(() => {
		setFilters({});
		try {
			localStorage.removeItem(FILTERS_STORAGE_KEY);
		} catch (error) {
			console.warn('Failed to force clear filters from localStorage:', error);
		}
	}, []);

	// Debug method to log current filter state
	const debugFilters = useCallback(() => {
		console.log('🔍 Current Filters State:', {
			filters,
			activeFiltersCount,
			hasActiveFilters,
			localStorage: localStorage.getItem(FILTERS_STORAGE_KEY),
		});
	}, [filters, activeFiltersCount, hasActiveFilters]);

	return {
		filters,
		activeFiltersCount,
		updateFilter,
		clearFilter,
		clearAllFilters,
		forceClearAllFilters,
		hasActiveFilters,
		debugFilters,
	};
};
