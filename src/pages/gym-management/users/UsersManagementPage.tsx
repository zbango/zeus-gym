import React from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Alert from '../../../components/bootstrap/Alert';
import UsersListActions from './components/UsersListActions';
import UsersListStats from './components/UsersListStats';
import UsersListTable from './components/UsersListTable';
import UserFormModal from './components/UserFormModal';
import UsersListSkeleton from './components/UsersListSkeleton';
import { useUsersManagement } from './hooks/useUsersManagement';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import Card, { CardActions, CardHeader } from '../../../components/bootstrap/Card';
import PageTitle from '../../../components/common/PageTitle';
import Input from '../../../components/bootstrap/forms/Input';

const UsersManagementPageRefactored = () => {
	const { t } = useTranslation();

	const {
		// State
		loading,
		users,
		currentPage,
		perPage,
		showModal,
		editingUser,
		saving,
		searchTerm,
		hasPermission,
		currentUserId,

		// Actions
		handleAddUser,
		handleEditUser,
		handleCloseModal,
		handleSubmitUser,

		handleRefresh,
		handleSearchChange,
		handlePageChange,
		handlePerPageChange,
	} = useUsersManagement();

	// Check permissions
	if (!hasPermission('users.create') && !hasPermission('all')) {
		return (
			<PageWrapper title={t('User Management')}>
				<Page container='fluid'>
					<Alert color='danger' className='text-center'>
						<div className='h4'>{t('Access Denied')}</div>
						<div>{t('You do not have permission to access user management.')}</div>
					</Alert>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('User Management')} className='pt-4'>
			<SubHeader>
				<SubHeaderLeft>
					<PageBreadcrumbs
						breadcrumbs={[
							{
								title: t('Dashboard'),
								to: '/gym-management/dashboard',
							},
							{
								title: t('User Management'),
								to: '/gym-management/users',
							},
						]}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<UsersListActions
						onAddUser={handleAddUser}
						onRefresh={handleRefresh}
						hasPermission={hasPermission}
					/>
				</SubHeaderRight>
			</SubHeader>

			<Page container='fluid'>
				<Card>
					<CardHeader borderSize={1}>
						{/* Left side - Title */}
						<PageTitle
							title={t('User Management')}
							icon='SupervisorAccount'
							iconColor='info'
							subtitle={t('Manage admin and staff user accounts')}
						/>

						{/* Right side - Search */}
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search users...')}
								value={searchTerm}
								onChange={(e: any) => handleSearchChange(e.target.value)}
								className='me-2'
								style={{ width: '250px' }}
							/>
						</CardActions>
					</CardHeader>
				</Card>

				{/* Summary Statistics */}
				<UsersListStats users={users} />

				{/* Users Table */}
				{loading ? (
					<UsersListSkeleton />
				) : (
					<UsersListTable
						users={users}
						currentPage={currentPage}
						perPage={perPage}
						onPageChange={handlePageChange}
						onPerPageChange={handlePerPageChange}
						onEditUser={handleEditUser}
						hasPermission={hasPermission}
						currentUserId={currentUserId}
						saving={saving}
					/>
				)}

				{/* User Form Modal */}
				<UserFormModal
					isOpen={showModal}
					onClose={handleCloseModal}
					editingUser={editingUser}
					onSubmit={handleSubmitUser}
					saving={saving}
				/>
			</Page>
		</PageWrapper>
	);
};

export default UsersManagementPageRefactored;
