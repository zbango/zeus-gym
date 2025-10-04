import React from 'react';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import PageTitle from '../../../components/common/PageTitle';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, { CardBody, CardHeader } from '../../../components/bootstrap/Card';
import { useMembershipPlans } from './hooks/useMembershipPlans';
import MembershipPlanCard from './components/MembershipPlanCard';
import MembershipPlanModal from './components/MembershipPlanModal';
import MembershipPlansSkeleton from './components/MembershipPlansSkeleton';

const MembershipPlansPage = () => {
	const { t } = useTranslation();

	// Use the custom hook for all state management
	const {
		loading,
		plans,
		showModal,
		editingPlan,
		saving,
		handleAddPlan,
		handleEditPlan,
		handleCloseModal,
		handleSubmitPlan,
		handleToggleStatus,
		handleDeletePlan,
	} = useMembershipPlans();

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
				<Card>
					<CardHeader borderSize={1}>
						{/* Page Title */}
						<PageTitle
							title={t('Membership Plans')}
							icon='CardMembership'
							iconColor='primary'
							subtitle={t(
								'Create and manage membership plans, set pricing, and configure member benefits',
							)}
						/>
					</CardHeader>
				</Card>

				{/* Plans Grid */}
				{loading ? (
					<MembershipPlansSkeleton />
				) : (
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
				)}

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
