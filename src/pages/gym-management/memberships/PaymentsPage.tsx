import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import PageTitle from '../../../components/common/PageTitle';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import DynamicTable from '../../../components/table/DynamicTable';
import { usePaymentsTableColumns } from '../../../components/payments/PaymentsTableConfig';
import { usePayments } from './hooks/usePayments';
import { Payment, useCreatePaymentMutation } from '../../../store/api/paymentsApi';
import { priceFormat } from '../../../helpers/helpers';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../components/bootstrap/OffCanvas';
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
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import dayjs from 'dayjs';

const PaymentsPage = () => {
	const { t } = useTranslation();

	// State for modals and details
	const [showPaymentDetailsOffcanvas, setShowPaymentDetailsOffcanvas] = useState(false);
	const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [saving, setSaving] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	// Use the payments hook
	const {
		payments,
		total,
		currentPage,
		pageSize,
		isLoading,
		summaryData,
		handlePageChange,
		handlePageSizeChange,
		handleSearchChange,
		handleStatusChange,
		handleRefresh,
	} = usePayments();

	// State for customer search
	const [customerIdentification, setCustomerIdentification] = useState('');
	const [foundCustomer, setFoundCustomer] = useState(null);
	const [searchingCustomer, setSearchingCustomer] = useState(false);
	const [customerSearchError, setCustomerSearchError] = useState(null);

	// Fetch customer by identification
	const searchCustomer = async (identification: string) => {
		if (!identification.trim()) return;

		setSearchingCustomer(true);
		setCustomerSearchError(null);
		setFoundCustomer(null);

		try {
			const token = localStorage.getItem('gym_access_token');
			const response = await fetch(
				`https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1/admin/customer-by-identification/${identification}`,
				{
					method: 'GET',
					headers: {
						Authorization: `${token}`,
						'Content-Type': 'application/json',
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				setFoundCustomer(data.member);
			} else if (response.status === 404) {
				setCustomerSearchError(
					t('Customer not found. Please check the identification number.'),
				);
			} else {
				setCustomerSearchError(
					t('An error occurred while searching for the customer. Please try again.'),
				);
			}
		} catch (error) {
			console.error('Customer search error:', error);
			setCustomerSearchError(
				t('An error occurred while searching for the customer. Please try again.'),
			);
		} finally {
			setSearchingCustomer(false);
		}
	};

	// Create payment mutation
	const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();

	// Form for adding payment
	const addPaymentFormik = useFormik({
		initialValues: {
			amount: '',
			paymentMethod: 'cash' as 'cash' | 'transfer',
			notes: '',
		},
		validate: (values) => {
			const errors: any = {};

			if (!foundCustomer) errors.customer = t('Customer must be found first');
			if (!values.amount) errors.amount = t('Amount is required');

			if (values.amount && parseInt(values.amount) <= 0) {
				errors.amount = t('Amount must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);
			setAlert(null);

			try {
				// Validate customer exists
				if (!foundCustomer?.id) {
					throw new Error('Customer not found');
				}

				// Create payment via API
				const paymentData = {
					customerId: foundCustomer.id,
					amount: parseInt(values.amount),
					paymentMethod: values.paymentMethod,
					notes: values.notes || undefined,
				};

				await createPayment(paymentData).unwrap();

				setAlert({
					type: 'success',
					message: t('Payment of {{amount}} recorded successfully!', {
						amount: priceFormat(parseInt(values.amount)),
					}),
				});

				// Clear form and close modal
				resetForm();
				setCustomerIdentification('');
				setFoundCustomer(null);
				setCustomerSearchError(null);
				setAlert(null);
				setShowAddPaymentModal(false);
			} catch (error: any) {
				console.error('Payment creation error:', error);

				let errorMessage = t(
					'An error occurred while recording the payment. Please try again.',
				);

				if (error?.data?.error?.message) {
					errorMessage = error.data.error.message;
				}

				setAlert({
					type: 'danger',
					message: errorMessage,
				});
			} finally {
				setSaving(false);
			}
		},
	});

	// Handle customer search
	const handleSearchCustomer = () => {
		if (!customerIdentification.trim()) {
			return;
		}
		searchCustomer(customerIdentification);
	};

	// Handle identification input change to reset search state
	const handleIdentificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCustomerIdentification(e.target.value);
		// Clear previous results when typing
		setFoundCustomer(null);
		setCustomerSearchError(null);
	};

	// Reset form when modal closes
	const handleCloseModal = () => {
		setShowAddPaymentModal(false);
		setCustomerIdentification('');
		setFoundCustomer(null);
		setCustomerSearchError(null);
		addPaymentFormik.resetForm();
		setAlert(null);
	};

	// Reset form when modal opens
	const handleOpenModal = () => {
		setShowAddPaymentModal(true);
	};

	// Reset modal state when it opens
	useEffect(() => {
		if (showAddPaymentModal) {
			// Reset all customer search state
			setCustomerIdentification('');
			setFoundCustomer(null);
			setCustomerSearchError(null);
			addPaymentFormik.resetForm();
			setAlert(null);
		}
	}, [showAddPaymentModal]);

	// Handle view details
	const handleViewDetails = (payment: Payment) => {
		setSelectedPayment(payment);
		setShowPaymentDetailsOffcanvas(true);
	};

	// Handle add payment (placeholder for now)
	const handleAddPayment = (payment: Payment) => {
		console.log('Add payment for:', payment);
		// TODO: Implement add payment modal
	};

	// Handle send reminder (placeholder for now)
	const handleSendReminder = (payment: Payment) => {
		console.log('Send reminder for:', payment);
		// TODO: Implement send reminder functionality
	};

	// Get table columns
	const columns = usePaymentsTableColumns(
		handleViewDetails,
		handleAddPayment,
		handleSendReminder,
	);

	return (
		<PageWrapper title={t('Payment Management')} className='pt-4'>
			<SubHeader>
				<SubHeaderLeft>
					<PageBreadcrumbs
						breadcrumbs={[
							{
								title: t('Dashboard'),
								to: '/gym-management/dashboard',
							},
							{
								title: t('Memberships'),
								to: '/gym-management/memberships',
							},
							{
								title: t('Payments'),
								to: '/gym-management/memberships/payments',
							},
						]}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					{/* <Button color='success' icon='Add' onClick={handleOpenModal}>
						{t('Record New Payment')}
					</Button> */}
					<Button color='info' icon='Refresh' isLight onClick={handleRefresh}>
						{t('Refresh Data')}
					</Button>
				</SubHeaderRight>
			</SubHeader>

			<Page container='fluid'>
				{/* Header Section with Title */}
				<Card>
					<CardHeader borderSize={1}>
						<PageTitle
							title='Payment Management'
							icon='Payment'
							iconColor='primary'
							subtitle='Track member payments, manage outstanding balances, and monitor payment history'
						/>
					</CardHeader>
				</Card>

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Payment' size='2x' color='primary' className='mb-2' />
								<div className='h4'>{summaryData.totalPayments}</div>
								<div className='text-muted'>{t('Total Payments')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-3'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Warning' size='2x' color='warning' className='mb-2' />
								<div className='h4'>{summaryData.pendingPayments}</div>
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
								<div className='h4'>{summaryData.completedPayments}</div>
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
								<div className='h4'>
									{priceFormat(summaryData.totalOutstanding)}
								</div>
								<div className='text-muted'>{t('Outstanding')}</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Table Section */}
				<Card stretch className='mt-4'>
					<CardBody className='p-0'>
						<DynamicTable
							data={payments}
							columns={columns}
							loading={isLoading}
							rowKey='customerName'
							pagination={{
								current: currentPage,
								pageSize: pageSize,
								total: total,
								onChange: handlePageChange,
							}}
						/>
					</CardBody>
				</Card>

				{/* Add Payment Modal */}
				<Modal
					setIsOpen={handleCloseModal}
					isOpen={showAddPaymentModal}
					titleId='addPaymentModal'
					size='lg'
					isStaticBackdrop>
					<ModalHeader>
						<ModalTitle id='addPaymentModal'>{t('Record New Payment')}</ModalTitle>
					</ModalHeader>
					<form onSubmit={addPaymentFormik.handleSubmit}>
						<ModalBody>
							{alert && (
								<Alert color={alert.type} className='mb-3'>
									{alert.message}
								</Alert>
							)}
							<div className='row g-3'>
								{/* Customer Search Section */}
								<div className='col-12'>
									<FormGroup
										id='customerIdentification'
										label={t('Customer Identification')}
										isRequired>
										<div className='input-group'>
											<Input
												type='text'
												value={customerIdentification}
												onChange={handleIdentificationChange}
												placeholder={t(
													'Enter customer identification number',
												)}
												disabled={searchingCustomer}
											/>
											<Button
												color='primary'
												onClick={handleSearchCustomer}
												isDisable={
													searchingCustomer ||
													!customerIdentification.trim()
												}>
												{searchingCustomer && <Spinner isSmall inButton />}
												{t('Search')}
											</Button>
										</div>
									</FormGroup>
								</div>

								{/* Found Customer Info */}
								{foundCustomer && foundCustomer.personalInfo && (
									<div className='col-12'>
										<Alert color='success' className='mb-3'>
											<div className='row g-2'>
												<div className='col-12'>
													<div className='fw-bold text-white'>
														{t('Customer Found')}:
													</div>
												</div>
												<div className='col-12'>
													<div className='text-white'>
														{foundCustomer.personalInfo.name || ''}{' '}
														{foundCustomer.personalInfo.lastName || ''}
													</div>
												</div>
												<div className='col-12'>
													<div className='small text-white'>
														{foundCustomer.personalInfo.email || ''}
													</div>
												</div>
												<div className='col-12'>
													<div className='small text-white'>
														{foundCustomer.personalInfo.phone || ''}
													</div>
												</div>
												<div className='col-12'>
													<div className='small text-white'>
														{t('Plan')}:{' '}
														{foundCustomer.membershipInfo?.plan || ''}
													</div>
												</div>
												<div className='col-12'>
													<div className='small text-white'>
														{t('Remaining')}:{' '}
														{priceFormat(
															foundCustomer.membershipInfo
																?.remainingAmount || 0,
														)}
													</div>
												</div>
											</div>
										</Alert>
									</div>
								)}

								{/* Customer Search Error */}
								{customerSearchError && (
									<div className='col-12'>
										<Alert color='danger' className='mb-3  text-white fw-bold'>
											{customerSearchError}
										</Alert>
									</div>
								)}
								{/* Payment Fields - Only enabled when customer is found */}
								{foundCustomer && (
									<>
										<div className='col-md-6'>
											<FormGroup
												id='amount'
												label={t('Payment Amount (USD)')}>
												<Input
													type='number'
													name='amount'
													onChange={addPaymentFormik.handleChange}
													onBlur={addPaymentFormik.handleBlur}
													value={addPaymentFormik.values.amount}
													min={0}
													placeholder={t('Enter payment amount')}
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
											<FormGroup
												id='paymentMethod'
												label={t('Payment Method')}>
												<Select
													ariaLabel={t('Select payment method')}
													name='paymentMethod'
													onChange={addPaymentFormik.handleChange}
													onBlur={addPaymentFormik.handleBlur}
													value={addPaymentFormik.values.paymentMethod}>
													<Option value='cash'>{t('Cash')}</Option>
													<Option value='transfer'>
														{t('Bank Transfer')}
													</Option>
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
									</>
								)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color='secondary' onClick={handleCloseModal}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='success'
								icon='Payment'
								isDisable={
									!foundCustomer ||
									!addPaymentFormik.isValid ||
									saving ||
									isCreatingPayment
								}>
								{(saving || isCreatingPayment) && <Spinner isSmall inButton />}
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
					isBodyScroll>
					<OffCanvasHeader setOpen={setShowPaymentDetailsOffcanvas}>
						<OffCanvasTitle id='paymentDetails'>
							{t('Payment Details')}: {selectedPayment?.customerName}
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
													<FormGroup label={t('Customer')}>
														<Input
															value={selectedPayment.customerName}
															readOnly
														/>
													</FormGroup>
												</div>

												<div className='col-6'>
													<FormGroup label={t('Plan')}>
														<Input
															value={
																selectedPayment.membershipPlanName
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Total Amount')}>
														<Input
															value={priceFormat(
																selectedPayment.membershipTotalAmount,
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
													<FormGroup label={t('Remaining')}>
														<Input
															value={priceFormat(
																selectedPayment.remaining,
															)}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Status')}>
														<Input
															value={t(
																selectedPayment.status.toUpperCase(),
															)}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-6'>
													<FormGroup label={t('Created Date')}>
														<Input
															value={dayjs(
																selectedPayment.createdAt,
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

															<th>{t('Registered By')}</th>
														</tr>
													</thead>
													<tbody>
														{selectedPayment.paymentHistorics.map(
															(payment) => (
																<tr key={payment.id}>
																	<td>
																		{dayjs(
																			payment.createdAt,
																		).format('DD/MM/YYYY')}
																	</td>
																	<td className='fw-bold text-success'>
																		{priceFormat(
																			payment.amount,
																		)}
																	</td>
																	<td>
																		<span
																			className={`badge bg-${
																				payment.paymentMethod ===
																				'cash'
																					? 'success'
																					: 'info'
																			}`}>
																			{t(
																				payment.paymentMethod,
																			)}
																		</span>
																	</td>

																	<td>{payment.createdBy}</td>
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
