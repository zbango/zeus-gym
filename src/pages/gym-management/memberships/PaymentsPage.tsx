import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
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
import { mockPayments, mockMembers, mockMembershipPlans } from '../../../common/data/gymMockData';
import { IPayment, IMember } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import classNames from 'classnames';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';
import Avatar from '../../../components/Avatar';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';

const PaymentsPage = () => {
	const { t } = useTranslation();
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [payments, setPayments] = useState<IPayment[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);
	const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
	const [showPaymentDetailsOffcanvas, setShowPaymentDetailsOffcanvas] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
	const [saving, setSaving] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadPayments = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setPayments(mockPayments);
			setLoading(false);
		};

		loadPayments();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(payments);

	const addPaymentFormik = useFormik({
		initialValues: {
			memberId: '',
			membershipPlanId: '',
			amount: '',
			paymentMethod: 'cash' as 'cash' | 'transfer',
			notes: '',
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.memberId) errors.memberId = t('Member is required');
			if (!values.membershipPlanId)
				errors.membershipPlanId = t('Membership plan is required');
			if (!values.amount) errors.amount = t('Amount is required');

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

				const selectedPlan = mockMembershipPlans.find(
					(plan) => plan.id === values.membershipPlanId,
				);
				const paymentAmount = parseInt(values.amount);
				const totalAmount = selectedPlan?.price || 0;

				// Check if this is adding to an existing payment or creating new
				const existingPayment = payments.find(
					(p) =>
						p.memberId === values.memberId &&
						p.membershipPlanId === values.membershipPlanId &&
						p.status !== 'completed',
				);

				if (existingPayment) {
					// Add payment to existing record
					const newPaidAmount = existingPayment.paidAmount + paymentAmount;
					const newRemainingAmount = existingPayment.totalAmount - newPaidAmount;
					const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';

					const newPaymentEntry = {
						id: `pay-${Date.now()}`,
						date: dayjs().format('YYYY-MM-DD'),
						amount: paymentAmount,
						method: values.paymentMethod,
						notes: values.notes || `Payment via ${values.paymentMethod}`,
						receivedBy: 'admin', // In real app, get from auth context
					};

					setPayments((prev) =>
						prev.map((payment) =>
							payment.id === existingPayment.id
								? {
										...payment,
										paidAmount: newPaidAmount,
										remainingAmount: Math.max(0, newRemainingAmount),
										status: newStatus,
										payments: [...payment.payments, newPaymentEntry],
									}
								: payment,
						),
					);

					setAlert({
						type: 'success',
						message: t('Payment of {{amount}} recorded successfully! {{status}}', {
							amount: priceFormat(paymentAmount),
							status:
								newStatus === 'completed'
									? t('Payment completed!')
									: t('Remaining: {{remaining}}', {
											remaining: priceFormat(Math.max(0, newRemainingAmount)),
										}),
						}),
					});
				} else {
					// Create new payment record
					const remainingAmount = Math.max(0, totalAmount - paymentAmount);
					const status =
						remainingAmount <= 0
							? 'completed'
							: paymentAmount > 0
								? 'partial'
								: 'pending';

					const newPayment: IPayment = {
						id: `payment-${Date.now()}`,
						memberId: values.memberId,
						membershipPlanId: values.membershipPlanId,
						totalAmount,
						paidAmount: paymentAmount,
						remainingAmount,
						paymentMethod: values.paymentMethod,
						payments: [
							{
								id: `pay-${Date.now()}`,
								date: dayjs().format('YYYY-MM-DD'),
								amount: paymentAmount,
								method: values.paymentMethod,
								notes:
									values.notes || `Initial payment via ${values.paymentMethod}`,
								receivedBy: 'admin',
							},
						],
						status,
						dueDate: dayjs().add(30, 'days').format('YYYY-MM-DD'),
						createdDate: dayjs().format('YYYY-MM-DD'),
					};

					setPayments((prev) => [newPayment, ...prev]);

					setAlert({
						type: 'success',
						message: t('New payment record created! {{status}}', {
							status:
								status === 'completed'
									? t('Payment completed!')
									: t('Remaining: {{remaining}}', {
											remaining: priceFormat(remainingAmount),
										}),
						}),
					});
				}

				resetForm();
				setShowAddPaymentModal(false);
			} catch (error) {
				setAlert({
					type: 'danger',
					message: t('An error occurred while recording the payment. Please try again.'),
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
			case 'partial':
				return 'warning';
			case 'pending':
				return 'danger';
			default:
				return 'secondary';
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

	const handleViewDetails = (payment: IPayment) => {
		setSelectedPayment(payment);
		setShowPaymentDetailsOffcanvas(true);
	};

	const handleSendReminder = async (paymentId: string) => {
		setSaving(true);
		// Simulate sending email/notification
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setAlert({
			type: 'success',
			message: t('Payment reminder sent successfully!'),
		});
		setSaving(false);
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

	if (loading) {
		return (
			<PageWrapper title={t('Payments Management')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading payments...')}</div>
						<div className='text-muted'>{t('Please wait')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	const pendingPayments = payments.filter(
		(p) => p.status === 'partial' || p.status === 'pending',
	);
	const completedPayments = payments.filter((p) => p.status === 'completed');
	const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.remainingAmount, 0);

	return (
		<PageWrapper title={t('Payments Management')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Payment' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Manage member payments and track outstanding balances')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={() => setShowAddPaymentModal(true)}>
						{t('Record Payment')}
					</Button>
					<Button
						color={themeStatus}
						icon='Refresh'
						isLight
						onClick={() => window.location.reload()}>
						{t('Refresh')}
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				{alert && (
					<Alert color={alert.type} isLight className='mb-4'>
						<Icon
							icon={alert.type === 'success' ? 'CheckCircle' : 'Error'}
							className='me-2'
						/>
						{alert.message}
					</Alert>
				)}

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Payment' size='2x' color='primary' className='mb-2' />
								<div className='h4'>{payments.length}</div>
								<div className='text-muted'>{t('Total Payments')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Warning' size='2x' color='warning' className='mb-2' />
								<div className='h4'>{pendingPayments.length}</div>
								<div className='text-muted'>{t('Pending/Partial')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='CheckCircle'
									size='2x'
									color='success'
									className='mb-2'
								/>
								<div className='h4'>{completedPayments.length}</div>
								<div className='text-muted'>{t('Completed')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='AttachMoney'
									size='2x'
									color='danger'
									className='mb-2'
								/>
								<div className='h4'>{priceFormat(totalPendingAmount)}</div>
								<div className='text-muted'>{t('Outstanding')}</div>
							</CardBody>
						</Card>
					</div>
				</div>

				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Payment' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('Payment Records')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search payments...')}
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
									<td aria-labelledby='Actions' style={{ width: 60 }} />
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
									<th>{t('Plan')}</th>
									<th>{t('Total Amount')}</th>
									<th>{t('Paid Amount')}</th>
									<th>{t('Remaining')}</th>
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
									<th>{t('Due Date')}</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(items, currentPage, perPage).map((payment) => {
									const member = mockMembers.find(
										(m) => m.id === payment.memberId,
									);
									const plan = mockMembershipPlans.find(
										(p) => p.id === payment.membershipPlanId,
									);

									return (
										<tr key={payment.id}>
											<td>
												<Button
													isOutline={!darkModeStatus}
													color='dark'
													isLight={darkModeStatus}
													className={classNames({
														'border-light': !darkModeStatus,
													})}
													icon='Visibility'
													onClick={() => handleViewDetails(payment)}
													aria-label='View details'
												/>
											</td>
											<td>
												<div className='d-flex align-items-center'>
													<Avatar size={36} className='me-2' />
													<div>
														<div className='fw-bold'>
															{getMemberName(payment.memberId)}
														</div>
														<div className='small text-muted'>
															{member?.personalInfo.email}
														</div>
													</div>
												</div>
											</td>
											<td>
												<div>
													<div className='fw-bold'>
														{getPlanName(payment.membershipPlanId)}
													</div>
													<div className='small text-muted'>
														{plan?.description}
													</div>
												</div>
											</td>
											<td>
												<div className='fw-bold'>
													{priceFormat(payment.totalAmount)}
												</div>
											</td>
											<td>
												<div className='fw-bold text-success'>
													{priceFormat(payment.paidAmount)}
												</div>
											</td>
											<td>
												<div
													className={classNames('fw-bold', {
														'text-success':
															payment.remainingAmount === 0,
														'text-warning':
															payment.remainingAmount > 0 &&
															payment.remainingAmount <
																payment.totalAmount,
														'text-danger':
															payment.remainingAmount ===
															payment.totalAmount,
													})}>
													{priceFormat(payment.remainingAmount)}
												</div>
											</td>
											<td>
												<span
													className={`badge bg-${getStatusColor(payment.status)}`}>
													{payment.status.toUpperCase()}
												</span>
											</td>
											<td>
												<span
													className={classNames('text-nowrap', {
														'text-danger': dayjs(
															payment.dueDate,
														).isBefore(dayjs(), 'day'),
														'text-warning': dayjs(
															payment.dueDate,
														).isSame(dayjs(), 'day'),
													})}>
													{dayjs(payment.dueDate).format('DD/MM/YYYY')}
												</span>
											</td>
											<td>
												<div className='d-flex gap-1'>
													{payment.status !== 'completed' && (
														<>
															<Button
																color='success'
																size='sm'
																icon='Add'
																isLight
																onClick={() => {
																	addPaymentFormik.setFieldValue(
																		'memberId',
																		payment.memberId,
																	);
																	addPaymentFormik.setFieldValue(
																		'membershipPlanId',
																		payment.membershipPlanId,
																	);
																	setShowAddPaymentModal(true);
																}}>
																{t('Add Payment')}
															</Button>
															<Button
																color='warning'
																size='sm'
																icon='Email'
																isLight
																onClick={() =>
																	handleSendReminder(payment.id)
																}
																isDisable={saving}>
																{t('Remind')}
															</Button>
														</>
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
						label='payments'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* Add Payment Modal */}
				<Modal
					setIsOpen={setShowAddPaymentModal}
					isOpen={showAddPaymentModal}
					titleId='addPaymentModal'
					size='lg'>
					<ModalHeader setIsOpen={setShowAddPaymentModal}>
						<ModalTitle id='addPaymentModal'>{t('Record New Payment')}</ModalTitle>
					</ModalHeader>
					<form onSubmit={addPaymentFormik.handleSubmit}>
						<ModalBody>
							<div className='row g-3'>
								<div className='col-md-6'>
									<FormGroup
										id='memberId'
										label={t('Member')}
										isRequired
										invalidFeedback={addPaymentFormik.errors.memberId}>
										<Select
											name='memberId'
											onChange={addPaymentFormik.handleChange}
											onBlur={addPaymentFormik.handleBlur}
											value={addPaymentFormik.values.memberId}
											isValid={
												addPaymentFormik.touched.memberId &&
												!addPaymentFormik.errors.memberId
											}
											isTouched={
												addPaymentFormik.touched.memberId &&
												!!addPaymentFormik.errors.memberId
											}
											invalidFeedback={addPaymentFormik.errors.memberId}>
											<Option value=''>{t('Select a member')}</Option>
											{mockMembers
												.filter(
													(member) =>
														member.membershipInfo.status === 'active',
												)
												.map((member) => (
													<Option key={member.id} value={member.id}>
														{member.personalInfo.firstName}{' '}
														{member.personalInfo.lastName} -{' '}
														{member.personalInfo.email}
													</Option>
												))}
										</Select>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='membershipPlanId'
										label={t('Membership Plan')}
										isRequired
										invalidFeedback={addPaymentFormik.errors.membershipPlanId}>
										<Select
											name='membershipPlanId'
											onChange={addPaymentFormik.handleChange}
											onBlur={addPaymentFormik.handleBlur}
											value={addPaymentFormik.values.membershipPlanId}
											isValid={
												addPaymentFormik.touched.membershipPlanId &&
												!addPaymentFormik.errors.membershipPlanId
											}
											isTouched={
												addPaymentFormik.touched.membershipPlanId &&
												!!addPaymentFormik.errors.membershipPlanId
											}
											invalidFeedback={
												addPaymentFormik.errors.membershipPlanId
											}>
											<Option value=''>{t('Select a plan')}</Option>
											{mockMembershipPlans
												.filter((plan) => plan.isActive)
												.map((plan) => (
													<Option key={plan.id} value={plan.id}>
														{plan.name} - {priceFormat(plan.price)}
													</Option>
												))}
										</Select>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='amount'
										label={t('Payment Amount (USD)')}
										isRequired
										invalidFeedback={addPaymentFormik.errors.amount}>
										<Input
											type='number'
											name='amount'
											onChange={addPaymentFormik.handleChange}
											onBlur={addPaymentFormik.handleBlur}
											value={addPaymentFormik.values.amount}
											placeholder='50000'
											min='0'
											isValid={
												addPaymentFormik.touched.amount &&
												!addPaymentFormik.errors.amount
											}
											isTouched={
												addPaymentFormik.touched.amount &&
												!!addPaymentFormik.errors.amount
											}
											invalidFeedback={addPaymentFormik.errors.amount}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='paymentMethod' label={t('Payment Method')}>
										<Select
											name='paymentMethod'
											onChange={addPaymentFormik.handleChange}
											onBlur={addPaymentFormik.handleBlur}
											value={addPaymentFormik.values.paymentMethod}>
											<Option value='cash'>{t('Cash')}</Option>
											<Option value='transfer'>{t('Bank Transfer')}</Option>
										</Select>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='notes' label={t('Notes (Optional)')}>
										<Textarea
											name='notes'
											onChange={addPaymentFormik.handleChange}
											onBlur={addPaymentFormik.handleBlur}
											value={addPaymentFormik.values.notes}
											placeholder={t('Additional payment notes...')}
											rows={2}
										/>
									</FormGroup>
								</div>

								{/* Payment Summary */}
								{addPaymentFormik.values.membershipPlanId &&
									addPaymentFormik.values.amount && (
										<div className='col-12'>
											{(() => {
												const selectedPlan = mockMembershipPlans.find(
													(plan) =>
														plan.id ===
														addPaymentFormik.values.membershipPlanId,
												);
												const paymentAmount =
													parseInt(addPaymentFormik.values.amount) || 0;
												const totalAmount = selectedPlan?.price || 0;
												const remaining = Math.max(
													0,
													totalAmount - paymentAmount,
												);

												return (
													<div className='alert alert-info'>
														<h6>{t('Payment Summary')}:</h6>
														<div className='row'>
															<div className='col-6'>
																<strong>{t('Plan Total')}:</strong>{' '}
																{priceFormat(totalAmount)}
															</div>
															<div className='col-6'>
																<strong>
																	{t('This Payment')}:
																</strong>{' '}
																{priceFormat(paymentAmount)}
															</div>
															<div className='col-6'>
																<strong>{t('Remaining')}:</strong>{' '}
																<span
																	className={
																		remaining === 0
																			? 'text-success'
																			: 'text-warning'
																	}>
																	{priceFormat(remaining)}
																</span>
															</div>
															<div className='col-6'>
																<strong>{t('Status')}:</strong>{' '}
																<span
																	className={`badge bg-${remaining === 0 ? 'success' : 'warning'}`}>
																	{remaining === 0
																		? t('COMPLETED')
																		: t('PARTIAL')}
																</span>
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
							<Button color='secondary' onClick={() => setShowAddPaymentModal(false)}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='success'
								icon='Payment'
								isDisable={!addPaymentFormik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{t('Record Payment')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>

				{/* Payment Details OffCanvas */}
				<OffCanvas
					setOpen={setShowPaymentDetailsOffcanvas}
					isOpen={showPaymentDetailsOffcanvas}
					titleId='paymentDetails'
					placement='end'
					size='lg'
					isBodyScroll>
					<OffCanvasHeader setOpen={setShowPaymentDetailsOffcanvas}>
						<OffCanvasTitle id='paymentDetails'>
							{t('Payment Details')}:{' '}
							{selectedPayment && getMemberName(selectedPayment.memberId)}
						</OffCanvasTitle>
					</OffCanvasHeader>
					<OffCanvasBody>
						{selectedPayment && (
							<div className='row g-4'>
								{/* Payment Summary */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='Payment' iconColor='primary'>
												<CardTitle>{t('Payment Summary')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='row g-3'>
												<div className='col-6'>
													<FormGroup label={t('Total Amount')}>
														<Input
															value={priceFormat(
																selectedPayment.totalAmount,
															)}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Paid Amount')}>
														<Input
															value={priceFormat(
																selectedPayment.paidAmount,
															)}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Remaining Amount')}>
														<Input
															value={priceFormat(
																selectedPayment.remainingAmount,
															)}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Status')}>
														<Input
															value={selectedPayment.status.toUpperCase()}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Due Date')}>
														<Input
															value={dayjs(
																selectedPayment.dueDate,
															).format('DD/MM/YYYY')}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Created Date')}>
														<Input
															value={dayjs(
																selectedPayment.createdDate,
															).format('DD/MM/YYYY')}
															readOnly
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
								</div>

								{/* Payment History */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='History' iconColor='info'>
												<CardTitle>{t('Payment History')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='table-responsive'>
												<table className='table table-sm'>
													<thead>
														<tr>
															<th>{t('Date')}</th>
															<th>{t('Amount')}</th>
															<th>{t('Method')}</th>
															<th>{t('Received By')}</th>
															<th>{t('Notes')}</th>
														</tr>
													</thead>
													<tbody>
														{selectedPayment.payments.map(
															(payment, index) => (
																<tr key={payment.id}>
																	<td>
																		{dayjs(payment.date).format(
																			'DD/MM/YYYY',
																		)}
																	</td>
																	<td className='fw-bold text-success'>
																		{priceFormat(
																			payment.amount,
																		)}
																	</td>
																	<td>
																		<span
																			className={`badge bg-${payment.method === 'cash' ? 'success' : 'info'}`}>
																			{payment.method.toUpperCase()}
																		</span>
																	</td>
																	<td>{payment.receivedBy}</td>
																	<td>{payment.notes || '-'}</td>
																</tr>
															),
														)}
													</tbody>
												</table>
											</div>
										</CardBody>
									</Card>
								</div>
							</div>
						)}
					</OffCanvasBody>
				</OffCanvas>
			</Page>
		</PageWrapper>
	);
};

export default PaymentsPage;
