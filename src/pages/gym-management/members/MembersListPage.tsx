import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import PageTitle from '../../../components/common/PageTitle';
import MembersListActions from './components/MembersListActions';
import MembersBasicFilters from './components/MembersBasicFilters';
import MembersAdvancedFiltersOffCanvas from './components/MembersAdvancedFiltersOffCanvas';
import MemberProfileSidePanel from './components/MemberProfileSidePanel';
import ActiveFilterBadges from './components/ActiveFilterBadges';
import DynamicTable from '../../../components/table/DynamicTable';
import { useMembersTableColumns } from '../../../components/members/MembersTableConfig';
import Card, { CardHeader, CardActions, CardBody } from '../../../components/bootstrap/Card';
import {
	membersAdvancedFilterFields,
	membersStatusOptions,
} from '../../../components/members/MembersFiltersConfig';
import { useMembers } from '../../../hooks/useMembers';
import { Member } from '../../../types/member.types';

const MembersListPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
	const [showMemberProfile, setShowMemberProfile] = React.useState(false);
	const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

	// Custom hook for members management
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
	} = useMembers();

	// Advanced filters state
	const [advancedFilters, setAdvancedFilters] = React.useState<Record<string, any>>({});
	const [activeFiltersCount, setActiveFiltersCount] = React.useState(0);

	// Handle table row click
	const handleRowClick = (record: Member) => {
		navigate(`/gym-management/members/${record.id}`);
	};

	// Handle opening member profile
	const handleViewProfile = (member: Member) => {
		setSelectedMember(member);
		setShowMemberProfile(true);
	};

	// Handle editing member
	const handleEditMember = (memberId: string) => {
		navigate(`/gym-management/members/edit/${memberId}`);
	};

	// Handle pagination
	const handlePaginationChange = (page: number, size: number) => {
		setPage(page);
		setPageSize(size);
	};

	// Handle search
	const handleSearchChange = (search: string) => {
		setSearch(search);
	};

	// Handle status filter
	const handleStatusChange = (status: string) => {
		setStatusFilter(status);
	};

	// Handle advanced filters change
	const handleAdvancedFiltersChange = (filters: any) => {
		setAdvancedFilters(filters);
		updateParams({
			...filters,
			page: 1, // Reset to first page when filters change
		});
	};

	// Handle removing individual filter
	const handleRemoveFilter = (filterKey: string) => {
		const newFilters = { ...advancedFilters };
		delete newFilters[filterKey];
		setAdvancedFilters(newFilters);
		updateParams({
			...newFilters,
			page: 1,
		});
	};

	// Handle clearing all advanced filters
	const handleClearAllAdvancedFilters = () => {
		setAdvancedFilters({});
		updateParams({
			page: 1,
		});
	};

	// Update active filters count
	React.useEffect(() => {
		let count = 0;

		// Count basic filters
		// Note: We'd need to track search and status from useMembers hook
		// For now, we'll focus on advanced filters

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

		setActiveFiltersCount(count);
	}, [advancedFilters]);

	return (
		<PageWrapper title='Members List' className='pt-4'>
			<SubHeader>
				<SubHeaderLeft>
					<PageBreadcrumbs
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
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<MembersListActions
						onRefresh={refresh}
						onAddMember={() => navigate('/gym-management/members/add')}
					/>
				</SubHeaderRight>
			</SubHeader>

			<Page container='fluid'>
				{/* Header Section with Title and Filters */}
				<Card>
					<CardHeader borderSize={1}>
						{/* Left side - Title */}
						<PageTitle title='Members List' icon='Group' iconColor='info' />

						{/* Right side - Filters */}
						<CardActions>
							<MembersBasicFilters
								searchPlaceholder='Search members...'
								statusOptions={membersStatusOptions}
								onSearchChange={handleSearchChange}
								onStatusChange={handleStatusChange}
								onAdvancedFiltersClick={() => setShowAdvancedFilters(true)}
								activeFiltersCount={activeFiltersCount}
							/>
						</CardActions>
					</CardHeader>
				</Card>

				{/* Active Filter Badges */}
				<ActiveFilterBadges
					activeFilters={advancedFilters}
					onRemoveFilter={handleRemoveFilter}
					onClearAll={handleClearAllAdvancedFilters}
				/>

				{/* Table Section */}
				<Card stretch className='mt-4'>
					<CardBody className='p-0'>
						<DynamicTable
							data={members}
							columns={useMembersTableColumns(handleViewProfile, handleEditMember)}
							loading={isLoading}
							rowKey='id'
							pagination={{
								current: currentPage,
								pageSize: pageSize,
								total: total,
								onChange: handlePaginationChange,
							}}
						/>
					</CardBody>
				</Card>

				{/* Advanced Filters OffCanvas */}
				<MembersAdvancedFiltersOffCanvas
					isOpen={showAdvancedFilters}
					onClose={() => setShowAdvancedFilters(false)}
					advancedFilterFields={membersAdvancedFilterFields}
					onAdvancedFiltersChange={handleAdvancedFiltersChange}
					initialFilters={advancedFilters}
				/>

				{/* Member Profile Side Panel */}
				<MemberProfileSidePanel
					isOpen={showMemberProfile}
					onClose={() => setShowMemberProfile(false)}
					member={selectedMember}
					onEdit={handleEditMember}
				/>
			</Page>
		</PageWrapper>
	);
};

export default MembersListPage;
