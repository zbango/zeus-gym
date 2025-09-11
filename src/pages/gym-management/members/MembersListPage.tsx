import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DynamicTable from '../../../components/table/DynamicTable';
import DataListPage from '../../../components/common/DataListPage';
import { useMembersTableColumns } from '../../../components/members/MembersTableConfig';
import {
	membersAdvancedFilterFields,
	membersStatusOptions,
} from '../../../components/members/MembersFiltersConfig';
import { useMembers } from '../../../hooks/useMembers';
import { Member } from '../../../types/member.types';

const MembersListPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	// Custom hook for members management
	const { members, total, currentPage, pageSize, isLoading, refresh } = useMembers();

	// Table columns configuration
	const columns = useMembersTableColumns();

	// Handle table row click
	const handleRowClick = (record: Member) => {
		// Navigate to member details or open modal
		console.log('Row clicked:', record);
	};

	// Handle pagination
	const handlePaginationChange = (page: number, size: number) => {
		// This will be handled by the useMembers hook
		console.log('Pagination changed:', page, size);
	};

	// Handle advanced filters change
	const handleAdvancedFiltersChange = (filters: any) => {
		console.log('Advanced filters changed:', filters);
		// This would be integrated with the useMembers hook
	};

	return (
		<DataListPage
			title='Members List'
			breadcrumbs={[
				{
					title: t('Dashboard'),
					to: '/gym-management/dashboard',
				},
				{
					title: t('Members'),
					to: '/gym-management/members/list',
				},
			]}
			data={members}
			total={total}
			isLoading={isLoading}
			columns={columns}
			rowKey='id'
			onRowClick={handleRowClick}
			currentPage={currentPage}
			pageSize={pageSize}
			onPaginationChange={handlePaginationChange}
			searchPlaceholder='Search members...'
			statusOptions={membersStatusOptions}
			advancedFilterFields={membersAdvancedFilterFields}
			onAdvancedFiltersChange={handleAdvancedFiltersChange}
			onRefresh={refresh}
			primaryAction={{
				label: 'Add New Member',
				icon: 'PersonAdd',
				color: 'success',
				to: '/gym-management/members/add',
			}}>
			<DynamicTable
				data={members}
				columns={columns}
				loading={isLoading}
				rowKey='id'
				pagination={{
					current: currentPage,
					pageSize: pageSize,
					total: total,
					onChange: handlePaginationChange,
				}}
				onRow={(record) => ({
					onClick: () => handleRowClick(record),
				})}
			/>
		</DataListPage>
	);
};

export default MembersListPage;
