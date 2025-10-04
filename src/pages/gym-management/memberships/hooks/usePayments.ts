import { useState, useMemo } from 'react';
import { useGetPaymentsQuery } from '../../../../store/api/paymentsApi';
import { Payment } from '../../../../store/api/paymentsApi';

export const usePayments = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');

	// API call
	const {
		data: paymentsData,
		isLoading,
		error,
		refetch,
	} = useGetPaymentsQuery({
		page: currentPage,
		limit: pageSize,
		search: search || undefined,
		status: statusFilter || undefined,
	});

	// Local filtering for search and status
	const filteredPayments = useMemo(() => {
		if (!paymentsData?.payments) return [];

		let filtered = paymentsData.payments;

		// Apply local search filter
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(payment) =>
					payment.customerName.toLowerCase().includes(searchLower) ||
					payment.customerEmail.toLowerCase().includes(searchLower) ||
					payment.membershipPlanName.toLowerCase().includes(searchLower),
			);
		}

		// Apply local status filter
		if (statusFilter) {
			filtered = filtered.filter((payment) => payment.status === statusFilter);
		}

		return filtered;
	}, [paymentsData?.payments, search, statusFilter]);

	// Calculate summary data
	const summaryData = useMemo(() => {
		if (!paymentsData?.payments) {
			return {
				totalPayments: 0,
				pendingPayments: 0,
				completedPayments: 0,
				totalOutstanding: 0,
			};
		}

		const payments = paymentsData.payments;
		const pendingPayments = payments.filter(
			(p) => p.status === 'partial' || p.status === 'pending',
		);
		const completedPayments = payments.filter((p) => p.status === 'completed');
		const totalOutstanding = pendingPayments.reduce((sum, p) => sum + p.remaining, 0);

		return {
			totalPayments: payments.length,
			pendingPayments: pendingPayments.length,
			completedPayments: completedPayments.length,
			totalOutstanding,
		};
	}, [paymentsData?.payments]);

	// Pagination
	const totalPages = Math.ceil((paymentsData?.total || 0) / pageSize);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handlePageSizeChange = (size: number) => {
		setPageSize(size);
		setCurrentPage(1);
	};

	const handleSearchChange = (searchTerm: string) => {
		setSearch(searchTerm);
		setCurrentPage(1);
	};

	const handleStatusChange = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleRefresh = () => {
		refetch();
	};

	return {
		// Data
		payments: filteredPayments,
		total: paymentsData?.total || 0,
		currentPage,
		pageSize,
		totalPages,
		isLoading,
		error,

		// Summary
		summaryData,

		// Actions
		handlePageChange,
		handlePageSizeChange,
		handleSearchChange,
		handleStatusChange,
		handleRefresh,
	};
};
