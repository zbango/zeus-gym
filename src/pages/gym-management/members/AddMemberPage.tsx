import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Textarea from '../../../components/bootstrap/forms/Textarea';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import { mockMembershipPlans, mockMembers } from '../../../common/data/gymMockData';
import { IMember } from '../../../types/gym-types';

const AddMemberPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	const isEditMode = Boolean(id);
	const pageTitle = isEditMode ? t('Edit Member') : t('Add New Member');
	const [initialValues, setInitialValues] = useState({
		// Personal Information
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',

		// Emergency Contact
		emergencyName: '',
		emergencyPhone: '',
		emergencyRelationship: '',

		// Health Information
		age: '',
		height: '',
		currentWeight: '',
		medicalConditions: '',
		goals: '',

		// Membership Information
		membershipPlan: '',
		membershipType: 'monthly' as 'monthly' | 'count-based',
		startDate: dayjs().format('YYYY-MM-DD'),
	});

	// Load member data for editing
	useEffect(() => {
		if (isEditMode && id) {
			setLoading(true);
			// Simulate API call to get member data
			const loadMemberData = async () => {
				await new Promise((resolve) => setTimeout(resolve, 500));
				const member = mockMembers.find((m) => m.id === id);
				if (member) {
					setInitialValues({
						firstName: member.personalInfo.firstName,
						lastName: member.personalInfo.lastName,
						email: member.personalInfo.email,
						phone: member.personalInfo.phone,
						address: member.personalInfo.address,
						emergencyName: member.personalInfo.emergencyContact.name,
						emergencyPhone: member.personalInfo.emergencyContact.phone,
						emergencyRelationship: member.personalInfo.emergencyContact.relationship,
						age: member.healthInfo.age.toString(),
						height: member.healthInfo.height.toString(),
						currentWeight: member.healthInfo.currentWeight.toString(),
						medicalConditions: member.healthInfo.medicalConditions || '',
						goals: member.healthInfo.goals || '',
						membershipPlan: member.membershipInfo.plan,
						membershipType: member.membershipInfo.type,
						startDate: member.membershipInfo.startDate,
					});
				}
				setLoading(false);
			};
			loadMemberData();
		}
	}, [id, isEditMode]);

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};

			// Required fields
			if (!values.firstName) errors.firstName = t('First name is required');
			if (!values.lastName) errors.lastName = t('Last name is required');
			if (!values.email) errors.email = t('Email is required');
			if (!values.phone) errors.phone = t('Phone is required');
			if (!values.age) errors.age = t('Age is required');
			if (!values.height) errors.height = t('Height is required');
			if (!values.currentWeight) errors.currentWeight = t('Weight is required');
			if (!values.membershipPlan) errors.membershipPlan = t('Membership plan is required');
			if (!values.emergencyName)
				errors.emergencyName = t('Emergency contact name is required');
			if (!values.emergencyPhone)
				errors.emergencyPhone = t('Emergency contact phone is required');

			// Email validation
			if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
				errors.email = t('Invalid email address');
			}

			// Age validation
			if (values.age && (parseInt(values.age) < 16 || parseInt(values.age) > 80)) {
				errors.age = t('Age must be between 16 and 80');
			}

			// Height validation
			if (values.height && (parseInt(values.height) < 140 || parseInt(values.height) > 220)) {
				errors.height = t('Height must be between 140cm and 220cm');
			}

			// Weight validation
			if (
				values.currentWeight &&
				(parseInt(values.currentWeight) < 40 || parseInt(values.currentWeight) > 200)
			) {
				errors.currentWeight = t('Weight must be between 40kg and 200kg');
			}

			return errors;
		},
		onSubmit: async (values) => {
			setSaving(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const selectedPlan = mockMembershipPlans.find(
					(plan) => plan.id === values.membershipPlan,
				);

				if (!selectedPlan) {
					throw new Error('Invalid membership plan selected');
				}

				if (isEditMode && id) {
					// Update existing member
					const updatedMember: IMember = {
						id: id,
						personalInfo: {
							firstName: values.firstName,
							lastName: values.lastName,
							email: values.email,
							phone: values.phone,
							address: values.address,
							emergencyContact: {
								name: values.emergencyName,
								phone: values.emergencyPhone,
								relationship: values.emergencyRelationship,
							},
						},
						healthInfo: {
							age: parseInt(values.age),
							height: parseInt(values.height),
							currentWeight: parseInt(values.currentWeight),
							medicalConditions: values.medicalConditions || 'Ninguna',
							goals: values.goals || 'Mantenerse en forma',
						},
						progressTracking: {
							measurements: [
								{
									date: dayjs().format('YYYY-MM-DD'),
									weight: parseInt(values.currentWeight),
									notes: 'Medición actualizada',
								},
							],
						},
						membershipInfo: {
							type: selectedPlan.type,
							plan: selectedPlan.name,
							startDate: values.startDate,
							endDate:
								selectedPlan.type === 'monthly'
									? dayjs(values.startDate)
											.add(selectedPlan.duration || 1, 'month')
											.format('YYYY-MM-DD')
									: undefined,
							remainingVisits:
								selectedPlan.type === 'count-based'
									? selectedPlan.visitCount
									: undefined,
							status: 'active',
						},
						registrationDate: dayjs().format('YYYY-MM-DD'),
					};

					console.log('Member updated:', updatedMember);

					setAlert({
						type: 'success',
						message: t('Member {{name}} has been successfully updated!', {
							name: `${values.firstName} ${values.lastName}`,
						}),
					});
				} else {
					// Create new member
					const newMember: IMember = {
						id: `member-${Date.now()}`,
						personalInfo: {
							firstName: values.firstName,
							lastName: values.lastName,
							email: values.email,
							phone: values.phone,
							address: values.address,
							emergencyContact: {
								name: values.emergencyName,
								phone: values.emergencyPhone,
								relationship: values.emergencyRelationship,
							},
						},
						healthInfo: {
							age: parseInt(values.age),
							height: parseInt(values.height),
							currentWeight: parseInt(values.currentWeight),
							medicalConditions: values.medicalConditions || 'Ninguna',
							goals: values.goals || 'Mantenerse en forma',
						},
						progressTracking: {
							measurements: [
								{
									date: dayjs().format('YYYY-MM-DD'),
									weight: parseInt(values.currentWeight),
									notes: 'Medición inicial al registro',
								},
							],
						},
						membershipInfo: {
							type: selectedPlan.type,
							plan: selectedPlan.name,
							startDate: values.startDate,
							endDate:
								selectedPlan.type === 'monthly'
									? dayjs(values.startDate)
											.add(selectedPlan.duration || 1, 'month')
											.format('YYYY-MM-DD')
									: undefined,
							remainingVisits:
								selectedPlan.type === 'count-based'
									? selectedPlan.visitCount
									: undefined,
							status: 'active',
						},
						registrationDate: dayjs().format('YYYY-MM-DD'),
					};

					console.log('New member created:', newMember);

					setAlert({
						type: 'success',
						message: t('Member {{name}} has been successfully registered!', {
							name: `${values.firstName} ${values.lastName}`,
						}),
					});
				}

				// Redirect after 2 seconds
				setTimeout(() => {
					navigate('/gym-management/members/list');
				}, 2000);
			} catch (error) {
				setAlert({
					type: 'danger',
					message: t('An error occurred while saving the member. Please try again.'),
				});
			} finally {
				setSaving(false);
			}
		},
	});

	if (loading) {
		return (
			<PageWrapper title={pageTitle}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading member data...')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={pageTitle}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon={isEditMode ? 'Edit' : 'PersonAdd'} className='me-2' size='2x' />
					<span className='text-muted'>
						{isEditMode
							? t('Edit gym member information')
							: t('Register a new gym member')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color='secondary'
						icon='ArrowBack'
						tag='a'
						to='/gym-management/members/list'>
						{t('Back to Members')}
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

				<form onSubmit={formik.handleSubmit}>
					<div className='row g-4'>
						{/* Personal Information */}
						<div className='col-lg-6'>
							<Card>
								<CardHeader>
									<CardLabel icon='Person' iconColor='primary'>
										<CardTitle>{t('Personal Information')}</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-3'>
										<div className='col-md-6'>
											<FormGroup id='firstName' label={t('First Name')}>
												<Input
													name='firstName'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.firstName}
													isValid={formik.isValid}
													isTouched={
														formik.touched.firstName &&
														!!formik.errors.firstName
													}
													invalidFeedback={formik.errors.firstName}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='lastName' label={t('Last Name')}>
												<Input
													name='lastName'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.lastName}
													isValid={formik.isValid}
													isTouched={
														formik.touched.lastName &&
														!!formik.errors.lastName
													}
													invalidFeedback={formik.errors.lastName}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='email' label={t('Email')}>
												<Input
													type='email'
													name='email'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.email}
													isValid={formik.isValid}
													isTouched={
														formik.touched.email &&
														!!formik.errors.email
													}
													invalidFeedback={formik.errors.email}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='phone' label={t('Phone')}>
												<Input
													type='tel'
													name='phone'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.phone}
													placeholder='+593 999 123 456'
													isValid={formik.isValid}
													isTouched={
														formik.touched.phone &&
														!!formik.errors.phone
													}
													invalidFeedback={formik.errors.phone}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup id='address' label={t('Address')}>
												<Textarea
													name='address'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.address}
													rows={2}
													placeholder={t('Full address...')}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Health Information */}
						<div className='col-lg-6'>
							<Card>
								<CardHeader>
									<CardLabel icon='FitnessCenter' iconColor='success'>
										<CardTitle>{t('Health Information')}</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-3'>
										<div className='col-md-4'>
											<FormGroup id='age' label={t('Age')}>
												<Input
													type='number'
													name='age'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.age}
													min={16}
													max={80}
													isValid={formik.isValid}
													isTouched={
														formik.touched.age && !!formik.errors.age
													}
													invalidFeedback={formik.errors.age}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='height' label={t('Height (cm)')}>
												<Input
													type='number'
													name='height'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.height}
													min={140}
													max={220}
													isValid={formik.isValid}
													isTouched={
														formik.touched.height &&
														!!formik.errors.height
													}
													invalidFeedback={formik.errors.height}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='currentWeight' label={t('Weight (kg)')}>
												<Input
													type='number'
													name='currentWeight'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.currentWeight}
													min={40}
													max={200}
													isValid={formik.isValid}
													isTouched={
														formik.touched.currentWeight &&
														!!formik.errors.currentWeight
													}
													invalidFeedback={formik.errors.currentWeight}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup
												id='medicalConditions'
												label={t('Medical Conditions')}>
												<Textarea
													name='medicalConditions'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.medicalConditions}
													rows={2}
													placeholder={t(
														'Any medical conditions or injuries to be aware of...',
													)}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup id='goals' label={t('Fitness Goals')}>
												<Textarea
													name='goals'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.goals}
													rows={2}
													placeholder={t('What are their fitness goals?')}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Membership Information */}
						<div className='col-lg-12'>
							<Card>
								<CardHeader>
									<CardLabel icon='CardMembership' iconColor='info'>
										<CardTitle>{t('Membership Information')}</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-3'>
										<div className='col-12'>
											<FormGroup
												id='membershipPlan'
												label={t('Membership Plan')}>
												<Select
													name='membershipPlan'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.membershipPlan}
													ariaLabel={t('Select membership plan')}
													isValid={formik.isValid}
													isTouched={
														formik.touched.membershipPlan &&
														!!formik.errors.membershipPlan
													}
													invalidFeedback={formik.errors.membershipPlan}>
													<Option value=''>
														{t('Select a membership plan')}
													</Option>
													{mockMembershipPlans
														.filter((plan) => plan.isActive)
														.map((plan) => (
															<Option key={plan.id} value={plan.id}>
																{`${plan.name} - $${plan.price.toLocaleString()} (${
																	plan.type === 'monthly'
																		? t(
																				'{{duration}} month(s)',
																				{
																					duration:
																						plan.duration,
																				},
																			)
																		: t('{{count}} visits', {
																				count: plan.visitCount,
																			})
																})`}
															</Option>
														))}
												</Select>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup id='startDate' label={t('Start Date')}>
												<Input
													type='date'
													name='startDate'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.startDate}
												/>
											</FormGroup>
										</div>
										{formik.values.membershipPlan && (
											<div className='col-12'>
												<div className='alert alert-info'>
													{(() => {
														const selectedPlan =
															mockMembershipPlans.find(
																(plan) =>
																	plan.id ===
																	formik.values.membershipPlan,
															);
														if (!selectedPlan) return null;

														return (
															<div>
																<strong>{selectedPlan.name}</strong>
																<br />
																<small>
																	{selectedPlan.description}
																	<br />
																	{t('Price')}: $
																	{selectedPlan.price.toLocaleString()}
																	<br />
																	{t('Type')}:{' '}
																	{selectedPlan.type === 'monthly'
																		? t(
																				'Monthly ({{duration}} month(s))',
																				{
																					duration:
																						selectedPlan.duration,
																				},
																			)
																		: t(
																				'Count-based ({{count}} visits)',
																				{
																					count: selectedPlan.visitCount,
																				},
																			)}
																	{selectedPlan.type ===
																		'monthly' && (
																		<>
																			<br />
																			{t('Expires')}:{' '}
																			{dayjs(
																				formik.values
																					.startDate,
																			)
																				.add(
																					selectedPlan.duration ||
																						1,
																					'month',
																				)
																				.format(
																					'DD/MM/YYYY',
																				)}
																		</>
																	)}
																</small>
															</div>
														);
													})()}
												</div>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Form Actions */}
						<div className='col-12'>
							<Card>
								<CardBody>
									<div className='row'>
										<div className='col-12 d-flex justify-content-end gap-3'>
											<Button
												type='button'
												color='secondary'
												onClick={() =>
													navigate('/gym-management/members/list')
												}>
												{t('Cancel')}
											</Button>
											<Button
												type='submit'
												color='primary'
												icon={isEditMode ? 'Save' : 'PersonAdd'}
												isDisable={!formik.isValid || saving}>
												{saving && <Spinner isSmall inButton />}
												{saving
													? isEditMode
														? t('Updating...')
														: t('Registering...')
													: isEditMode
														? t('Update Member')
														: t('Register Member')}
											</Button>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</form>
			</Page>
		</PageWrapper>
	);
};

export default AddMemberPage;
