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
import Textarea from '../../../components/bootstrap/forms/Textarea';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Checks from '../../../components/bootstrap/forms/Checks';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockMembershipPlans } from '../../../common/data/gymMockData';
import { IMembershipPlan } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import classNames from 'classnames';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';

const MembershipPlansPage = () => {
	const { t } = useTranslation();
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [plans, setPlans] = useState<IMembershipPlan[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingPlan, setEditingPlan] = useState<IMembershipPlan | null>(null);
	const [saving, setSaving] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadPlans = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setPlans(mockMembershipPlans);
			setLoading(false);
		};

		loadPlans();
	}, []);

	const formik = useFormik({
		initialValues: {
			name: '',
			type: 'monthly' as 'monthly' | 'count-based',
			price: '',
			duration: '',
			visitCount: '',
			description: '',
			isActive: true,
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.name) errors.name = t('Plan name is required');
			if (!values.price) errors.price = t('Price is required');
			if (!values.description) errors.description = t('Description is required');

			if (values.type === 'monthly' && !values.duration) {
				errors.duration = t('Duration is required for monthly plans');
			}

			if (values.type === 'count-based' && !values.visitCount) {
				errors.visitCount = t('Visit count is required for count-based plans');
			}

			if (values.price && parseInt(values.price) <= 0) {
				errors.price = t('Price must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const planData: IMembershipPlan = {
					id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
					name: values.name,
					type: values.type,
					price: parseInt(values.price),
					duration: values.type === 'monthly' ? parseInt(values.duration) : undefined,
					visitCount:
						values.type === 'count-based' ? parseInt(values.visitCount) : undefined,
					description: values.description,
					isActive: values.isActive,
				};

				if (editingPlan) {
					setPlans((prev) =>
						prev.map((plan) => (plan.id === editingPlan.id ? planData : plan)),
					);
					setAlert({
						type: 'success',
						message: t('Plan "{{name}}" has been updated successfully!', {
							name: values.name,
						}),
					});
				} else {
					setPlans((prev) => [planData, ...prev]);
					setAlert({
						type: 'success',
						message: t('Plan "{{name}}" has been created successfully!', {
							name: values.name,
						}),
					});
				}

				resetForm();
				setShowModal(false);
				setEditingPlan(null);
			} catch (error) {
				setAlert({
					type: 'danger',
					message: t('An error occurred while saving the plan. Please try again.'),
				});
			} finally {
				setSaving(false);
			}
		},
	});

	const handleEditPlan = (plan: IMembershipPlan) => {
		setEditingPlan(plan);
		formik.setValues({
			name: plan.name,
			type: plan.type,
			price: plan.price.toString(),
			duration: plan.duration ? plan.duration.toString() : '',
			visitCount: plan.visitCount ? plan.visitCount.toString() : '',
			description: plan.description,
			isActive: plan.isActive,
		});
		setShowModal(true);
	};

	const handleAddPlan = () => {
		setEditingPlan(null);
		formik.resetForm();
		setShowModal(true);
	};

	const handleToggleStatus = async (planId: string) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setPlans((prev) =>
			prev.map((plan) => (plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan)),
		);
		setSaving(false);
	};

	const handleDeletePlan = async (planId: string) => {
		if (!confirm(t('Are you sure you want to delete this plan?'))) return;

		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setPlans((prev) => prev.filter((plan) => plan.id !== planId));
		setAlert({
			type: 'success',
			message: t('Plan has been deleted successfully!'),
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
			<PageWrapper title={t('Membership Plans')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading membership plans...')}</div>
						<div className='text-muted'>{t('Please wait')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('Membership Plans')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Assignment' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Manage gym membership plans and pricing')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={handleAddPlan}>
						{t('Add New Plan')}
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

				<div className='row g-4'>
					{plans.map((plan) => (
						<div key={plan.id} className='col-lg-4 col-md-6'>
							<Card
								className={classNames('h-100', {
									'border-success': plan.isActive,
									'border-secondary': !plan.isActive,
								})}
								shadow='sm'>
								<CardHeader
									className={classNames({
										'bg-success text-white':
											plan.isActive && plan.type === 'monthly',
										'bg-info text-white':
											plan.isActive && plan.type === 'count-based',
										'bg-light': !plan.isActive,
									})}>
									<CardLabel>
										<CardTitle className='d-flex justify-content-between align-items-center'>
											<span>{plan.name}</span>
											<div className='d-flex gap-1'>
												{!plan.isActive && (
													<span className='badge bg-secondary text-dark'>
														{t('Inactive')}
													</span>
												)}
												<span
													className={classNames('badge', {
														'bg-light text-dark': plan.isActive,
														'bg-secondary': !plan.isActive,
													})}>
													{plan.type === 'monthly'
														? t('Monthly')
														: t('Count-based')}
												</span>
											</div>
										</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='text-center mb-3'>
										<div className='h2 text-primary mb-0'>
											{priceFormat(plan.price)}
										</div>
										<small className='text-muted'>
											{plan.type === 'monthly'
												? t('per {{duration}} month(s)', {
														duration: plan.duration,
														count: plan.duration || 0,
													})
												: t('for {{count}} visits', {
														count: plan.visitCount,
													})}
										</small>
									</div>

									<p className='text-muted mb-3'>{plan.description}</p>

									<div className='row g-2 mb-3'>
										<div className='col-6'>
											<small className='text-muted'>{t('Type')}:</small>
											<div className='fw-bold'>
												{plan.type === 'monthly'
													? t('Monthly')
													: t('Count-based')}
											</div>
										</div>
										<div className='col-6'>
											<small className='text-muted'>
												{plan.type === 'monthly'
													? t('Duration')
													: t('Visits')}
												:
											</small>
											<div className='fw-bold'>
												{plan.type === 'monthly'
													? t('{{duration}} month(s)', {
															duration: plan.duration,
															count: plan.duration || 0,
														})
													: t('{{count}} visits', {
															count: plan.visitCount,
														})}
											</div>
										</div>
									</div>

									<div className='d-flex justify-content-between align-items-center'>
										<div className='form-check form-switch'>
											<input
												className='form-check-input'
												type='checkbox'
												checked={plan.isActive}
												onChange={() => handleToggleStatus(plan.id)}
												disabled={saving}
											/>
											<label className='form-check-label small text-muted'>
												{plan.isActive ? t('Active') : t('Inactive')}
											</label>
										</div>

										<div className='d-flex gap-1'>
											<Button
												color='info'
												size='sm'
												icon='Edit'
												isLight
												onClick={() => handleEditPlan(plan)}>
												{t('Edit')}
											</Button>
											<Button
												color='danger'
												size='sm'
												icon='Delete'
												isLight
												onClick={() => handleDeletePlan(plan.id)}
												isDisable={saving}>
												{t('Delete')}
											</Button>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					))}

					{/* Add New Plan Card */}
					<div className='col-lg-4 col-md-6'>
						<Card
							className='h-100 border-dashed cursor-pointer'
							onClick={handleAddPlan}
							style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
							<CardBody className='d-flex flex-column justify-content-center align-items-center text-center py-5'>
								<Icon icon='Add' size='3x' color='muted' className='mb-3' />
								<h5 className='text-muted'>{t('Add New Plan')}</h5>
								<p className='text-muted'>{t('Create a new membership plan')}</p>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Add/Edit Plan Modal */}
				<Modal
					setIsOpen={setShowModal}
					isOpen={showModal}
					titleId='planModal'
					size='lg'
					isScrollable>
					<ModalHeader setIsOpen={setShowModal}>
						<ModalTitle id='planModal'>
							{editingPlan ? t('Edit Membership Plan') : t('Add New Membership Plan')}
						</ModalTitle>
					</ModalHeader>
					<form onSubmit={formik.handleSubmit}>
						<ModalBody>
							<div className='row g-3'>
								<div className='col-md-6'>
									<FormGroup
										id='name'
										label={t('Plan Name')}
										isRequired
										invalidFeedback={formik.errors.name}>
										<Input
											name='name'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.name}
											placeholder={t('e.g., Premium Monthly')}
											isValid={formik.touched.name && !formik.errors.name}
											isTouched={formik.touched.name && !!formik.errors.name}
											invalidFeedback={formik.errors.name}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='type' label={t('Plan Type')} isRequired>
										<Select
											name='type'
											onChange={(e) => {
												formik.handleChange(e);
												// Reset duration/visitCount when type changes
												formik.setFieldValue('duration', '');
												formik.setFieldValue('visitCount', '');
											}}
											onBlur={formik.handleBlur}
											value={formik.values.type}>
											<Option value='monthly'>{t('Monthly Plan')}</Option>
											<Option value='count-based'>
												{t('Count-based Plan')}
											</Option>
										</Select>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='price'
										label={t('Price (USD)')}
										isRequired
										invalidFeedback={formik.errors.price}>
										<Input
											type='number'
											name='price'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.price}
											placeholder='45'
											min='0'
											isValid={formik.touched.price && !formik.errors.price}
											isTouched={
												formik.touched.price && !!formik.errors.price
											}
											invalidFeedback={formik.errors.price}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									{formik.values.type === 'monthly' ? (
										<FormGroup
											id='duration'
											label={t('Duration (months)')}
											isRequired
											invalidFeedback={formik.errors.duration}>
											<Input
												type='number'
												name='duration'
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.duration}
												placeholder='1'
												min='1'
												max='12'
												isValid={
													formik.touched.duration &&
													!formik.errors.duration
												}
												isTouched={
													formik.touched.duration &&
													!!formik.errors.duration
												}
												invalidFeedback={formik.errors.duration}
											/>
										</FormGroup>
									) : (
										<FormGroup
											id='visitCount'
											label={t('Number of Visits')}
											isRequired
											invalidFeedback={formik.errors.visitCount}>
											<Input
												type='number'
												name='visitCount'
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.visitCount}
												placeholder='12'
												min='1'
												max='100'
												isValid={
													formik.touched.visitCount &&
													!formik.errors.visitCount
												}
												isTouched={
													formik.touched.visitCount &&
													!!formik.errors.visitCount
												}
												invalidFeedback={formik.errors.visitCount}
											/>
										</FormGroup>
									)}
								</div>
								<div className='col-12'>
									<FormGroup
										id='description'
										label={t('Description')}
										isRequired
										invalidFeedback={formik.errors.description}>
										<Textarea
											name='description'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.description}
											placeholder={t('Describe what this plan includes...')}
											rows={3}
											isValid={
												formik.touched.description &&
												!formik.errors.description
											}
											isTouched={
												formik.touched.description &&
												!!formik.errors.description
											}
											invalidFeedback={formik.errors.description}
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup>
										<Checks
											id='isActive'
											type='switch'
											label={t('Plan is active')}
											name='isActive'
											onChange={formik.handleChange}
											checked={formik.values.isActive}
										/>
									</FormGroup>
								</div>

								{/* Preview */}
								{formik.values.name && formik.values.price && (
									<div className='col-12'>
										<div className='alert alert-info'>
											<h6>{t('Preview')}:</h6>
											<strong>{formik.values.name}</strong> -{' '}
											{priceFormat(parseInt(formik.values.price || '0'))}
											<br />
											<small>
												{formik.values.type === 'monthly'
													? t('Duration: {{duration}} month(s)', {
															duration: formik.values.duration || 1,
															count:
																parseInt(formik.values.duration) ||
																1,
														})
													: t('Visits: {{count}}', {
															count: formik.values.visitCount || 1,
														})}
												<br />
												{formik.values.description}
											</small>
										</div>
									</div>
								)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color='secondary' onClick={() => setShowModal(false)}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='primary'
								icon={editingPlan ? 'Save' : 'Add'}
								isDisable={!formik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{editingPlan ? t('Update Plan') : t('Create Plan')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default MembershipPlansPage;
