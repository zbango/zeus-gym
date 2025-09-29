import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import PageTitle from '../../../components/common/PageTitle';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
	CardActions,
} from '../../../components/bootstrap/Card';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Textarea from '../../../components/bootstrap/forms/Textarea';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockMembers, mockMembershipPlans } from '../../../common/data/gymMockData';
import Spinner from '../../../components/bootstrap/Spinner';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/bootstrap/Badge';

interface IRenewal {
	id: string;
	memberId: string;
	currentPlanId: string;
	newPlanId: string;
	currentExpiryDate: string;
	newExpiryDate: string;
	renewalDate: string;
	amount: number;
	paymentMethod: 'cash' | 'transfer';
	status: 'pending' | 'completed' | 'expired';
	notes?: string;
	processedBy?: string;
	processedDate?: string;
}

// Mock renewals data
const mockRenewals: IRenewal[] = [
	{
		id: 'ren-001',
		memberId: 'mem-001',
		currentPlanId: 'plan-001',
		newPlanId: 'plan-001',
		currentExpiryDate: '2024-01-15',
		newExpiryDate: '2024-02-15',
		renewalDate: '2024-01-10',
		amount: 45,
		paymentMethod: 'cash',
		status: 'completed',
		notes: 'Regular monthly renewal',
		processedBy: 'admin',
		processedDate: '2024-01-10',
	},
	{
		id: 'ren-002',
		memberId: 'mem-002',
		currentPlanId: 'plan-002',
		newPlanId: 'plan-001',
		currentExpiryDate: '2024-01-20',
		newExpiryDate: '2024-02-20',
		renewalDate: '2024-01-15',
		amount: 45,
		paymentMethod: 'transfer',
		status: 'pending',
		notes: 'Upgrade to monthly plan',
	},
	{
		id: 'ren-003',
		memberId: 'mem-003',
		currentPlanId: 'plan-001',
		newPlanId: 'plan-001',
		currentExpiryDate: '2024-01-25',
		newExpiryDate: '2024-02-25',
		renewalDate: '2024-01-20',
		amount: 45,
		paymentMethod: 'cash',
		status: 'expired',
		notes: 'Missed renewal deadline',
	},
];

const RenewalsPage = () => {
	const { t } = useTranslation();
	const { themeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [renewals, setRenewals] = useState<IRenewal[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);
	const [showRenewalModal, setShowRenewalModal] = useState(false);
	const [editingRenewal, setEditingRenewal] = useState<IRenewal | null>(null);
	const [saving, setSaving] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadRenewals = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setRenewals(mockRenewals);
			setLoading(false);
		};

		loadRenewals();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(renewals);

	const renewalFormik = useFormik({
		initialValues: {
			memberId: '',
			newPlanId: '',
			renewalDate: dayjs().format('YYYY-MM-DD'),
			amount: '',
			paymentMethod: 'cash' as 'cash' | 'transfer',
			notes: '',
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.memberId) errors.memberId = t('Member is required');
			if (!values.newPlanId) errors.newPlanId = t('Membership plan is required');
			if (!values.amount) errors.amount = t('Amount is required');
			if (!values.renewalDate) errors.renewalDate = t('Renewal date is required');

			if (values.amount && parseInt(values.amount) <= 0) {
				errors.amount = t('Amount must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const selectedMember = mockMembers.find((m) => m.id === values.memberId);
				const selectedPlan = mockMembershipPlans.find((p) => p.id === values.newPlanId);

				if (!selectedMember || !selectedPlan) {
					throw new Error('Member or plan not found');
				}

				const currentExpiryDate = selectedMember.membershipInfo.endDate || '';
				const renewalDate = dayjs(values.renewalDate);
				let newExpiryDate;

				if (selectedPlan.type === 'monthly') {
					newExpiryDate = renewalDate.add(selectedPlan.duration || 1, 'month');
				} else {
					// For count-based plans, set expiry to 6 months from renewal date
					newExpiryDate = renewalDate.add(6, 'month');
				}

				const renewalData: IRenewal = {
					id: editingRenewal ? editingRenewal.id : `ren-${Date.now()}`,
					memberId: values.memberId,
					currentPlanId: selectedMember.membershipInfo.plan,
					newPlanId: values.newPlanId,
					currentExpiryDate,
					newExpiryDate: newExpiryDate.format('YYYY-MM-DD'),
					renewalDate: values.renewalDate,
					amount: parseInt(values.amount),
					paymentMethod: values.paymentMethod,
					status: 'completed',
					notes: values.notes,
					processedBy: 'admin', // In real app, get from auth context
					processedDate: dayjs().format('YYYY-MM-DD'),
				};

				if (editingRenewal) {
					setRenewals((prev) =>
						prev.map((renewal) =>
							renewal.id === editingRenewal.id ? renewalData : renewal,
						),
					);
					setAlert({
						type: 'success',
						message: t('Renewal has been updated successfully!'),
					});
				} else {
					setRenewals((prev) => [renewalData, ...prev]);
					setAlert({
						type: 'success',
						message: t('Renewal has been processed successfully!'),
					});
				}

				resetForm();
				setShowRenewalModal(false);
				setEditingRenewal(null);
			} catch {
				setAlert({
					type: 'danger',
					message: t('An error occurred while processing the renewal. Please try again.'),
				});
			} finally {
				setSaving(false);
			}
		},
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'pending':
				return 'warning';
			case 'expired':
				return 'danger';
			default:
				return 'secondary';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return t('Completed');
			case 'pending':
				return t('Pending');
			case 'expired':
				return t('Expired');
			default:
				return status;
		}
	};

	const getMemberName = (memberId: string) => {
		const member = mockMembers.find((m) => m.id === memberId);
		return member
			? `${member.personalInfo.firstName} ${member.personalInfo.lastName}`
			: t('Unknown Member');
	};

	const getPlanName = (planId: string) => {
		const plan = mockMembershipPlans.find((p) => p.id === planId);
		return plan?.name || t('Unknown Plan');
	};

	const handleEditRenewal = (renewal: IRenewal) => {
		setEditingRenewal(renewal);
		renewalFormik.setValues({
			memberId: renewal.memberId,
			newPlanId: renewal.newPlanId,
			renewalDate: renewal.renewalDate,
			amount: renewal.amount.toString(),
			paymentMethod: renewal.paymentMethod,
			notes: renewal.notes || '',
		});
		setShowRenewalModal(true);
	};

	const handleAddRenewal = () => {
		setEditingRenewal(null);
		renewalFormik.resetForm();
		setShowRenewalModal(true);
	};

	const handleProcessRenewal = async (renewalId: string) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setRenewals((prev) =>
			prev.map((renewal) =>
				renewal.id === renewalId
					? {
							...renewal,
							status: 'completed',
							processedBy: 'admin',
							processedDate: dayjs().format('YYYY-MM-DD'),
						}
					: renewal,
			),
		);

		setAlert({
			type: 'success',
			message: t('Renewal has been processed successfully!'),
		});
		setSaving(false);
	};

	const getExpiringMembers = () => {
		const today = dayjs();
		const sevenDaysFromNow = today.add(7, 'days');

		return mockMembers.filter((member) => {
			const expiryDate = dayjs(member.membershipInfo.endDate);
			return expiryDate.isBefore(sevenDaysFromNow) && expiryDate.isAfter(today);
		});
	};

	// Auto-hide alerts
	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => {
				setAlert(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

	const pendingRenewals = renewals.filter((r) => r.status === 'pending');
	const completedRenewals = renewals.filter((r) => r.status === 'completed');
	const expiredRenewals = renewals.filter((r) => r.status === 'expired');
	const expiringMembers = getExpiringMembers();
	const totalRenewalAmount = completedRenewals.reduce((sum, r) => sum + r.amount, 0);

	return (
		<PageWrapper title={t('Membership Renewals')}>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{ title: t('Dashboard'), to: '/gym-management' },
							{ title: t('Memberships'), to: '/gym-management/memberships' },
							{ title: t('Renewals'), to: '/gym-management/memberships/renewals' },
						]}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={handleAddRenewal}>
						{t('Process New Renewal')}
					</Button>
					<Button
						color={themeStatus}
						icon='Refresh'
						isLight
						onClick={() => window.location.reload()}>
						{t('Refresh Data')}
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				<Card>
					<CardHeader borderSize={1}>
						{/* Page Title */}
						<PageTitle
							title={t('Membership Renewals')}
							icon='Autorenew'
							iconColor='primary'
							subtitle={t(
								'Process membership renewals, track expiring memberships, and manage member retention',
							)}
						/>
					</CardHeader>
				</Card>

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Autorenew' size='2x' color='primary' className='mb-2' />
								<div className='h4'>{renewals.length}</div>
								<div className='text-muted'>{t('Total Renewals')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='HourglassEmpty'
									size='2x'
									color='warning'
									className='mb-2'
								/>
								<div className='h4'>{pendingRenewals.length}</div>
								<div className='text-muted'>{t('Pending')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='CheckCircle'
									size='2x'
									color='success'
									className='mb-2'
								/>
								<div className='h4'>{completedRenewals.length}</div>
								<div className='text-muted'>{t('Completed')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Warning' size='2x' color='danger' className='mb-2' />
								<div className='h4'>{expiringMembers.length}</div>
								<div className='text-muted'>{t('Expiring Soon')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Cancel' size='2x' color='danger' className='mb-2' />
								<div className='h4'>{expiredRenewals.length}</div>
								<div className='text-muted'>{t('Expired')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-2'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='AttachMoney'
									size='2x'
									color='success'
									className='mb-2'
								/>
								<div className='h4'>{priceFormat(totalRenewalAmount)}</div>
								<div className='text-muted'>{t('Revenue')}</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Expiring Members Alert */}
				{expiringMembers.length > 0 && (
					<Alert color='warning' isLight className='mb-4'>
						<div className='d-flex align-items-center'>
							<Icon icon='Warning' className='me-2' />
							<div>
								<strong>{t('Attention!')}</strong>{' '}
								{t('{{count}} members have memberships expiring within 7 days', {
									count: expiringMembers.length,
								})}
							</div>
						</div>
					</Alert>
				)}

				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Autorenew' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('Renewal Records')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search renewals...')}
								className='me-2'
								style={{ width: '250px' }}
							/>
							<Button color='info' icon='FilterList' isLight>
								{t('Filters')}
							</Button>
						</CardActions>
					</CardHeader>
					<CardBody className='table-responsive' isScrollable>
						<table className='table table-modern table-hover'>
							<thead>
								<tr>
									<th
										onClick={() => requestSort('memberId')}
										className='cursor-pointer text-decoration-underline'>
										{t('Member')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('memberId')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Current Plan')}</th>
									<th>{t('New Plan')}</th>
									<th>{t('Renewal Date')}</th>
									<th>{t('New Expiry')}</th>
									<th>{t('Amount')}</th>
									<th>{t('Payment Method')}</th>
									<th
										onClick={() => requestSort('status')}
										className='cursor-pointer text-decoration-underline'>
										{t('Status')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('status')}
											icon='FilterList'
										/>
									</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(items, currentPage, perPage).map((renewal) => {
									const member = mockMembers.find(
										(m) => m.id === renewal.memberId,
									);

									return (
										<tr key={renewal.id}>
											<td>
												<div className='d-flex align-items-center'>
													<Avatar size={36} className='me-2' src='' />
													<div>
														<div className='fw-bold'>
															{getMemberName(renewal.memberId)}
														</div>
														<div className='small text-muted'>
															{member?.personalInfo.email}
														</div>
													</div>
												</div>
											</td>
											<td>
												<div className='fw-bold'>
													{getPlanName(renewal.currentPlanId)}
												</div>
												<div className='small text-muted'>
													{t('Expires')}:{' '}
													{dayjs(renewal.currentExpiryDate).format(
														'DD/MM/YYYY',
													)}
												</div>
											</td>
											<td>
												<div className='fw-bold'>
													{getPlanName(renewal.newPlanId)}
												</div>
											</td>
											<td>
												<span className='text-nowrap'>
													{dayjs(renewal.renewalDate).format(
														'DD/MM/YYYY',
													)}
												</span>
											</td>
											<td>
												<span className='text-nowrap'>
													{dayjs(renewal.newExpiryDate).format(
														'DD/MM/YYYY',
													)}
												</span>
											</td>
											<td>
												<div className='fw-bold'>
													{priceFormat(renewal.amount)}
												</div>
											</td>
											<td>
												<Badge
													color={
														renewal.paymentMethod === 'cash'
															? 'success'
															: 'info'
													}>
													{renewal.paymentMethod === 'cash'
														? t('Cash')
														: t('Bank Transfer')}
												</Badge>
											</td>
											<td>
												<Badge color={getStatusColor(renewal.status)}>
													{getStatusText(renewal.status)}
												</Badge>
											</td>
											<td>
												<div className='d-flex gap-1'>
													<Button
														color='info'
														size='sm'
														icon='Edit'
														isLight
														onClick={() => handleEditRenewal(renewal)}>
														{t('Edit')}
													</Button>
													{renewal.status === 'pending' && (
														<Button
															color='success'
															size='sm'
															icon='CheckCircle'
															isLight
															onClick={() =>
																handleProcessRenewal(renewal.id)
															}
															isDisable={saving}>
															{t('Process')}
														</Button>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</CardBody>
					<PaginationButtons
						data={items}
						label='renewals'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* Add/Edit Renewal Modal */}
				<Modal
					setIsOpen={setShowRenewalModal}
					isOpen={showRenewalModal}
					titleId='renewalModal'
					size='lg'>
					<ModalHeader setIsOpen={setShowRenewalModal}>
						<ModalTitle id='renewalModal'>
							{editingRenewal ? t('Edit Renewal') : t('Process New Renewal')}
						</ModalTitle>
					</ModalHeader>
					<form onSubmit={renewalFormik.handleSubmit}>
						<ModalBody>
							<div className='row g-3'>
								<div className='col-md-6'>
									<FormGroup id='memberId' label={t('Member')}>
										<Select
											ariaLabel={t('Select member')}
											name='memberId'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.memberId}
											isValid={
												renewalFormik.touched.memberId &&
												!renewalFormik.errors.memberId
											}
											isTouched={
												renewalFormik.touched.memberId &&
												!!renewalFormik.errors.memberId
											}
											invalidFeedback={renewalFormik.errors.memberId}>
											<Option value=''>{t('Select a member')}</Option>
											{mockMembers
												.filter(
													(member) =>
														member.membershipInfo.status === 'active',
												)
												.map((member) => (
													<Option key={member.id} value={member.id}>
														{`${member.personalInfo.firstName} ${member.personalInfo.lastName} - ${member.personalInfo.email}`}
													</Option>
												))}
										</Select>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='newPlanId' label={t('New Plan')}>
										<Select
											ariaLabel={t('Select plan')}
											name='newPlanId'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.newPlanId}
											isValid={
												renewalFormik.touched.newPlanId &&
												!renewalFormik.errors.newPlanId
											}
											isTouched={
												renewalFormik.touched.newPlanId &&
												!!renewalFormik.errors.newPlanId
											}
											invalidFeedback={renewalFormik.errors.newPlanId}>
											<Option value=''>{t('Select a plan')}</Option>
											{mockMembershipPlans
												.filter((plan) => plan.isActive)
												.map((plan) => (
													<Option key={plan.id} value={plan.id}>
														{`${plan.name} - ${priceFormat(plan.price)}`}
													</Option>
												))}
										</Select>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='renewalDate' label={t('Renewal Date')}>
										<Input
											type='date'
											name='renewalDate'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.renewalDate}
											isValid={
												renewalFormik.touched.renewalDate &&
												!renewalFormik.errors.renewalDate
											}
											isTouched={
												renewalFormik.touched.renewalDate &&
												!!renewalFormik.errors.renewalDate
											}
											invalidFeedback={renewalFormik.errors.renewalDate}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='amount' label={t('Renewal Amount (USD)')}>
										<Input
											type='number'
											name='amount'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.amount}
											placeholder='45'
											min={0}
											isValid={
												renewalFormik.touched.amount &&
												!renewalFormik.errors.amount
											}
											isTouched={
												renewalFormik.touched.amount &&
												!!renewalFormik.errors.amount
											}
											invalidFeedback={renewalFormik.errors.amount}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='paymentMethod' label={t('Payment Method')}>
										<Select
											ariaLabel={t('Select payment method')}
											name='paymentMethod'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.paymentMethod}>
											<Option value='cash'>{t('Cash')}</Option>
											<Option value='transfer'>{t('Bank Transfer')}</Option>
										</Select>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='notes' label={t('Notes (Optional)')}>
										<Textarea
											name='notes'
											onChange={renewalFormik.handleChange}
											onBlur={renewalFormik.handleBlur}
											value={renewalFormik.values.notes}
											placeholder={t('Additional renewal notes...')}
											rows={2}
										/>
									</FormGroup>
								</div>

								{/* Renewal Summary */}
								{renewalFormik.values.newPlanId &&
									renewalFormik.values.renewalDate && (
										<div className='col-12'>
											{(() => {
												const selectedPlan = mockMembershipPlans.find(
													(plan) =>
														plan.id === renewalFormik.values.newPlanId,
												);
												const renewalDate = dayjs(
													renewalFormik.values.renewalDate,
												);
												let newExpiryDate;

												if (selectedPlan?.type === 'monthly') {
													newExpiryDate = renewalDate.add(
														selectedPlan.duration || 1,
														'month',
													);
												} else {
													newExpiryDate = renewalDate.add(6, 'month');
												}

												return (
													<div className='alert alert-info'>
														<h6>{t('Renewal Summary')}:</h6>
														<div className='row'>
															<div className='col-6'>
																<strong>{t('Plan')}:</strong>{' '}
																{selectedPlan?.name}
															</div>
															<div className='col-6'>
																<strong>
																	{t('Renewal Date')}:
																</strong>{' '}
																{renewalDate.format('DD/MM/YYYY')}
															</div>
															<div className='col-6'>
																<strong>
																	{t('New Expiry Date')}:
																</strong>{' '}
																{newExpiryDate.format('DD/MM/YYYY')}
															</div>
															<div className='col-6'>
																<strong>{t('Duration')}:</strong>{' '}
																{selectedPlan?.type === 'monthly'
																	? t('{{duration}} month(s)', {
																			duration:
																				selectedPlan.duration ||
																				1,
																			count:
																				selectedPlan.duration ||
																				1,
																		})
																	: t('{{count}} visits', {
																			count:
																				selectedPlan?.visitCount ||
																				12,
																		})}
															</div>
														</div>
													</div>
												);
											})()}
										</div>
									)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color='secondary' onClick={() => setShowRenewalModal(false)}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='success'
								icon={editingRenewal ? 'Save' : 'Autorenew'}
								isDisable={!renewalFormik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{editingRenewal ? t('Update Renewal') : t('Process Renewal')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default RenewalsPage;
