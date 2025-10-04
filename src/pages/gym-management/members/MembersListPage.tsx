import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import PageTitle from '../../../components/common/PageTitle';
import MembersListActions from './components/MembersListActions';
import MembersSearch from './components/MembersSearch';
import MembersFilters from './components/MembersFilters';
import MembersAdvancedFiltersOffCanvas from './components/MembersAdvancedFiltersOffCanvas';
import MemberProfileSidePanel from './components/MemberProfileSidePanel';
import ActiveFilterBadges from './components/ActiveFilterBadges';
import EditMemberModal from './components/EditMemberModal';
import MemberSuccessDialog from './components/MemberSuccessDialog';
import DynamicTable from '../../../components/table/DynamicTable';
import { useMembersTableColumns } from '../../../components/members/MembersTableConfig';
import Card, { CardHeader, CardActions, CardBody } from '../../../components/bootstrap/Card';
import {
	membersAdvancedFilterFields,
	membersStatusOptions,
} from '../../../components/members/MembersFiltersConfig';
import { useMembersList } from './hooks/useMembersList';

const MembersListPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Edit modal state
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedMember, setSelectedMember] = useState<any>(null);

	// QR Code dialog state
	const [showQRDialog, setShowQRDialog] = useState(false);
	const [qrMember, setQrMember] = useState<any>(null);

	// Use the comprehensive state management hook
	const {
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
	} = useMembersList();

	// Handle edit member with modal
	const handleEditMemberModal = (memberId: string) => {
		const member = members.find((m) => m.id === memberId);
		if (member) {
			setSelectedMember(member);
			setShowEditModal(true);
		}
	};

	// Handle edit modal close
	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setSelectedMember(null);
	};

	// Handle successful edit
	const handleEditSuccess = () => {
		refresh(); // Refresh the data after successful edit
	};

	// Handle QR Code dialog
	const handleShowQRCode = (member: any) => {
		setQrMember(member);
		setShowQRDialog(true);
	};

	const handleCloseQRDialog = () => {
		setShowQRDialog(false);
		setQrMember(null);
	};

	// Transform Member to MemberCreationResponse format for the dialog
	const transformMemberForDialog = (member: any) => {
		return {
			customer: {
				id: member.id,
				name: member.personalInfo.name,
				lastName: member.personalInfo.lastName,
				dateOfBirth: member.personalInfo.birthDate || '',
				email: member.personalInfo.email || '',
				phone: member.personalInfo.phone || '',
				address: member.personalInfo.address || '',
				identification: member.personalInfo.identification || '',
				medicalConditions: member.healthInfo.medicalConditions || '',
				status: member.membershipInfo.status,
				createdAt: member.registrationDate,
				updatedAt: member.registrationDate,
			},
			progress: {
				id: `${member.id}-progress`,
				customerId: member.id,
				isCurrent: true,
				age: member.healthInfo.age,
				gender: 'unknown',
				height: member.healthInfo.height,
				weight: member.healthInfo.currentWeight,
				createdAt: member.registrationDate,
				updatedAt: member.registrationDate,
			},
			membership: {
				id: `${member.id}-membership`,
				customerId: member.id,
				membershipPlanId: `${member.id}-plan`,
				membershipPlan: {
					id: `${member.id}-plan`,
					name: member.membershipInfo.plan,
					type: member.membershipInfo.type,
					price: 0,
					duration: member.membershipInfo.type === 'monthly' ? 1 : undefined,
					description: '',
					status: 'active',
					createdAt: member.registrationDate,
					updatedAt: member.registrationDate,
				},
				startDate: member.membershipInfo.startDate,
				status: member.membershipInfo.status,
				totalAmount: 0,
				paidAmount: 0,
				remainingAmount: 0,
				createdAt: member.registrationDate,
				updatedAt: member.registrationDate,
			},
			payment: {
				id: `${member.id}-payment`,
				customerId: member.id,
				membershipId: `${member.id}-membership`,
				customerName: `${member.personalInfo.name} ${member.personalInfo.lastName}`,
				customerEmail: member.personalInfo.email || '',
				customerPhone: member.personalInfo.phone || '',
				membershipPlanName: member.membershipInfo.plan,
				membershipPlanType: member.membershipInfo.type,
				amount: 0,
				paymentMethod: 'cash',
				status: 'completed',
				createdAt: member.registrationDate,
				updatedAt: member.registrationDate,
			},
		};
	};

	// Debug pagination data
	console.log('Pagination Debug:', {
		members: members.length,
		total,
		currentPage,
		pageSize,
		isLoading,
	});

	return (
		<PageWrapper title={t('Members List')} className='pt-4'>
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
				{/* Header Section with Title and Search */}
				<Card>
					<CardHeader borderSize={1}>
						{/* Left side - Title */}
						<PageTitle
							title='Members List'
							icon='Group'
							iconColor='info'
							subtitle='View and manage all gym members'
						/>

						{/* Right side - Search */}
						<CardActions className='d-flex flex-wrap align-items-center gap-3'>
							<MembersSearch
								placeholder='Search users...'
								onSearchChange={handleSearchChange}
							/>
							<MembersFilters
								statusOptions={membersStatusOptions}
								onStatusChange={handleStatusChange}
								onAdvancedFiltersClick={ui.handleOpenAdvancedFilters}
								activeFiltersCount={filters.activeFiltersCount}
							/>
						</CardActions>
					</CardHeader>
				</Card>

				{/* Active Filter Badges */}
				<ActiveFilterBadges
					activeFilters={filters.filters}
					onRemoveFilter={handleRemoveFilter}
					onClearAll={handleClearAllAdvancedFilters}
				/>

				{/* Table Section */}
				<Card stretch className='mt-4'>
					<CardBody className='p-0'>
						<DynamicTable
							data={members}
							columns={useMembersTableColumns(
								ui.handleViewProfile,
								handleEditMemberModal,
								handleShowQRCode,
							)}
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
					isOpen={ui.showAdvancedFilters}
					onClose={ui.handleCloseAdvancedFilters}
					advancedFilterFields={membersAdvancedFilterFields}
					onAdvancedFiltersChange={handleAdvancedFiltersChange}
					initialFilters={filters.filters}
				/>

				{/* Member Profile Side Panel */}
				<MemberProfileSidePanel
					isOpen={ui.showMemberProfile}
					onClose={ui.handleCloseProfile}
					member={ui.selectedMember}
					onEdit={handleEditMemberModal}
				/>

				{/* Edit Member Modal */}
				<EditMemberModal
					isOpen={showEditModal}
					onClose={handleCloseEditModal}
					member={selectedMember}
					onSuccess={handleEditSuccess}
				/>

				{/* QR Code Dialog */}
				<MemberSuccessDialog
					isOpen={showQRDialog}
					onClose={handleCloseQRDialog}
					member={qrMember ? transformMemberForDialog(qrMember) : null}
					onNavigateToList={handleCloseQRDialog}
					onKeepCreating={handleCloseQRDialog}
				/>
			</Page>
		</PageWrapper>
	);
};

export default MembersListPage;
