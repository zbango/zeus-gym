import React from 'react';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import PageTitle from '../../../components/common/PageTitle';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import { useMembershipPlans } from './hooks/useMembershipPlans';
import MembershipPlansHeader from './components/MembershipPlansHeader';
import MembershipPlanCard from './components/MembershipPlanCard';
import MembershipPlanModal from './components/MembershipPlanModal';

const MembershipPlansPage = () => {
	const { t } = useTranslation();

	// Use the custom hook for all state management
	const {
		loading,
		plans,
		showModal,
		editingPlan,
		saving,
		alert,
		handleAddPlan,
		handleEditPlan,
		handleCloseModal,
		handleSubmitPlan,
		handleToggleStatus,
		handleDeletePlan,
	} = useMembershipPlans();

	if (loading) {
		return (
			<PageWrapper title={t('Membership Plans')}>
				<SubHeader>
					<SubHeaderLeft>
						<Breadcrumb
							list={[
								{ title: t('Dashboard'), to: '/gym-management' },
								{ title: t('Memberships'), to: '/gym-management/memberships' },
								{ title: t('Plans'), to: '/gym-management/memberships/plans' },
							]}
						/>
					</SubHeaderLeft>
				</SubHeader>
				<Page container='fluid'>
					<div
						className='d-flex justify-content-center align-items-center'
						style={{ minHeight: '60vh' }}>
						<div className='text-center'>
							<Spinner size='3rem' className='mb-3' />
							<div className='h5'>{t('Loading membership plans...')}</div>
							<div className='text-muted'>
								{t('Please wait while we fetch your membership plans')}
							</div>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('Membership Plans')}>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{ title: t('Dashboard'), to: '/gym-management' },
							{ title: t('Memberships'), to: '/gym-management/memberships' },
							{ title: t('Plans'), to: '/gym-management/memberships/plans' },
						]}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={handleAddPlan}>
						{t('Add New Plan')}
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				{/* Page Title */}
				<PageTitle
					title={t('Membership Plans')}
					icon='CardMembership'
					iconColor='primary'
					subtitle={t(
						'Create and manage membership plans, set pricing, and configure member benefits',
					)}
				/>

				{alert && (
					<Alert color={alert.type} isLight className='mb-4'>
						<Icon
							icon={alert.type === 'success' ? 'CheckCircle' : 'Error'}
							className='me-2'
						/>
						{alert.message}
					</Alert>
				)}

				{/* Header Section */}
				<MembershipPlansHeader />

				{/* Plans Grid */}
				<Card stretch className='mt-4'>
					<CardBody className='p-4'>
						<div className='row g-4'>
							{plans.map((plan) => (
								<div key={plan.id} className='col-lg-4 col-md-6'>
									<MembershipPlanCard
										plan={plan}
										onEdit={handleEditPlan}
										onDelete={handleDeletePlan}
										onToggleStatus={handleToggleStatus}
										saving={saving}
									/>
								</div>
							))}

							{/* Add New Plan Card */}
							<div className='col-lg-4 col-md-6'>
								<Card
									className='h-100 border-dashed cursor-pointer'
									onClick={handleAddPlan}
									style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
									<CardBody className='d-flex flex-column justify-content-center align-items-center text-center py-5'>
										<Icon
											icon='Add'
											size='3x'
											color='secondary'
											className='mb-3'
										/>
										<h5 className='text-muted'>{t('Add New Plan')}</h5>
										<p className='text-muted'>
											{t('Create a new membership plan')}
										</p>
									</CardBody>
								</Card>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Add/Edit Plan Modal */}
				<MembershipPlanModal
					isOpen={showModal}
					onClose={handleCloseModal}
					onSubmit={handleSubmitPlan}
					editingPlan={editingPlan}
					saving={saving}
				/>
			</Page>
		</PageWrapper>
	);
};

export default MembershipPlansPage;
