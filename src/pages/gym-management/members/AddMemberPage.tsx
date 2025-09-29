import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
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
import {
	useGetMemberByIdQuery,
	useCreateMemberMutation,
	useUpdateMemberMutation,
} from '../../../store/api/membersApi';
import { CreateMemberRequest, UpdateMemberRequest } from '../../../types/member.types';
import { mockMembershipPlans } from '../../../common/data/gymMockData';
import MemberSuccessDialog from './components/MemberSuccessDialog';

const AddMemberPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();

	const isEditMode = Boolean(id);
	const pageTitle = isEditMode ? t('Edit Member') : t('Add New Member');

	// Function to calculate age from birth date
	const calculateAge = (birthDate: string): string => {
		if (!birthDate) return '';
		const today = dayjs();
		const birth = dayjs(birthDate);
		const age = today.diff(birth, 'year');
		return age.toString();
	};

	// Function to calculate BMI
	const calculateBMI = (weight: number, height: number): number => {
		if (!weight || !height) return 0;
		const heightInMeters = height / 100;
		return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
	};

	// Function to get BMI category and feedback
	const getBMICategory = (
		bmi: number,
	): {
		category: string;
		color: string;
		feedback: string;
	} => {
		if (bmi < 18.5) {
			return {
				category: t('Underweight'),
				color: 'info',
				feedback: t('Consider consulting a nutritionist for healthy weight gain.'),
			};
		} else if (bmi >= 18.5 && bmi < 25) {
			return {
				category: t('Normal'),
				color: 'success',
				feedback: t('Healthy weight range. Maintain current lifestyle.'),
			};
		} else if (bmi >= 25 && bmi < 30) {
			return {
				category: t('Overweight'),
				color: 'warning',
				feedback: t('Consider a balanced diet and regular exercise program.'),
			};
		} else {
			return {
				category: t('Obese'),
				color: 'danger',
				feedback: t('Medical consultation recommended. Focus on gradual weight loss.'),
			};
		}
	};

	// RTK Query hooks
	const { data: memberData, isLoading: loadingMember } = useGetMemberByIdQuery(id!, {
		skip: !isEditMode || !id,
	});
	const [createMember, { isLoading: isCreating }] = useCreateMemberMutation();
	const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();

	// BMI calculation state
	const [bmi, setBmi] = useState<number>(0);
	const [bmiCategory, setBmiCategory] = useState<{
		category: string;
		color: string;
		feedback: string;
	} | null>(null);

	// Success dialog state
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [createdMember, setCreatedMember] = useState<any>(null);

	// Reset form function
	const resetForm = () => {
		setInitialValues({
			// Personal Information
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			birthDate: '',
			identification: '',

			// Health Information
			age: '',
			gender: '',
			height: '',
			currentWeight: '',
			chest: '',
			waist: '',
			hips: '',
			arms: '',
			thighs: '',
			medicalConditions: '',

			// Membership Information
			membershipPlan: '',
			membershipType: 'monthly' as 'monthly' | 'count-based',
			startDate: dayjs().format('YYYY-MM-DD'),
			paymentAmount: '',
		});
		setBmi(0);
		setBmiCategory(null);
	};

	// Handle keep creating
	const handleKeepCreating = () => {
		setShowSuccessDialog(false);
		setCreatedMember(null);
		resetForm();
		// Reset formik to initial values
		formik.resetForm();
	};

	const [initialValues, setInitialValues] = useState({
		// Personal Information
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		birthDate: '',
		identification: '',

		// Health Information
		age: '',
		gender: '',
		height: '',
		currentWeight: '',
		chest: '',
		waist: '',
		hips: '',
		arms: '',
		thighs: '',
		medicalConditions: '',

		// Membership Information
		membershipPlan: '',
		membershipType: 'monthly' as 'monthly' | 'count-based',
		startDate: dayjs().format('YYYY-MM-DD'),
		paymentAmount: '',
	});

	// Load member data for editing
	useEffect(() => {
		if (isEditMode && memberData) {
			setInitialValues({
				firstName: memberData.personalInfo.firstName,
				lastName: memberData.personalInfo.lastName,
				email: memberData.personalInfo.email,
				phone: memberData.personalInfo.phone,
				address: memberData.personalInfo.address,
				birthDate: memberData.personalInfo.birthDate || '',
				identification: memberData.personalInfo.identification || '',
				age: memberData.healthInfo.age.toString(),
				gender: memberData.healthInfo.gender || '',
				height: memberData.healthInfo.height.toString(),
				currentWeight: memberData.healthInfo.currentWeight.toString(),
				chest: memberData.healthInfo.chest?.toString() || '',
				waist: memberData.healthInfo.waist?.toString() || '',
				hips: memberData.healthInfo.hips?.toString() || '',
				arms: memberData.healthInfo.arms?.toString() || '',
				thighs: memberData.healthInfo.thighs?.toString() || '',
				medicalConditions: memberData.healthInfo.medicalConditions || '',
				membershipPlan: memberData.membershipInfo.plan,
				membershipType: memberData.membershipInfo.type,
				startDate: memberData.membershipInfo.startDate,
				paymentAmount: '',
			});
		}
	}, [isEditMode, memberData]);

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
			if (!values.identification) errors.identification = t('Identification is required');
			if (!values.gender) errors.gender = t('Gender is required');
			if (!values.height) errors.height = t('Height is required');
			if (!values.currentWeight) errors.currentWeight = t('Weight is required');
			// Membership plan is only required for new members
			if (!isEditMode && !values.membershipPlan)
				errors.membershipPlan = t('Membership plan is required');

			// Payment amount validation (only for new members)
			if (
				!isEditMode &&
				(!values.paymentAmount || values.paymentAmount.toString().trim() === '')
			) {
				errors.paymentAmount = t('Payment amount is required');
			}
			if (
				values.paymentAmount &&
				values.paymentAmount.toString().trim() !== '' &&
				parseFloat(values.paymentAmount.toString()) <= 0
			) {
				errors.paymentAmount = t('Payment amount must be greater than 0');
			}

			// Email validation
			if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
				errors.email = t('Invalid email address');
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
			try {
				console.log(values);

				// For new members, validate and get membership plan
				let membershipInfo: any = undefined;
				if (!isEditMode) {
					const selectedPlan = mockMembershipPlans.find(
						(plan) => plan.id === values.membershipPlan,
					);

					if (!selectedPlan) {
						throw new Error('Invalid membership plan selected');
					}

					membershipInfo = {
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
						status: 'active' as const,
					};
				}

				const memberData: any = {
					personalInfo: {
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						phone: values.phone,
						address: values.address,
						birthDate: values.birthDate,
						identification: values.identification,
					},
					healthInfo: {
						age: parseInt(values.age) || parseInt(calculateAge(values.birthDate)) || 0,
						gender: values.gender,
						height: parseInt(values.height),
						currentWeight: parseInt(values.currentWeight),
						chest: values.chest ? parseInt(values.chest) : undefined,
						waist: values.waist ? parseInt(values.waist) : undefined,
						hips: values.hips ? parseInt(values.hips) : undefined,
						arms: values.arms ? parseInt(values.arms) : undefined,
						thighs: values.thighs ? parseInt(values.thighs) : undefined,
						medicalConditions: values.medicalConditions || 'Ninguna',
					},
				};

				// Only add membership info for new members
				if (membershipInfo) {
					memberData.membershipInfo = membershipInfo;
				}

				if (isEditMode && id) {
					// Update existing member
					const updateData: UpdateMemberRequest = {
						id,
						...memberData,
					};

					await updateMember(updateData).unwrap();

					toast.success(
						t('Member {{name}} has been successfully updated!', {
							name: `${values.firstName} ${values.lastName}`,
						}),
					);
				} else {
					// Create new member
					const createData: CreateMemberRequest = memberData;
					console.log(createData);
					const result = await createMember(createData).unwrap();

					toast.success(
						t('Member {{name}} has been successfully registered!', {
							name: `${values.firstName} ${values.lastName}`,
						}),
					);

					// Show success dialog with member data
					setCreatedMember(result);
					setShowSuccessDialog(true);
					return; // Don't navigate yet, wait for dialog action
				}

				// For edit mode, navigate directly
				navigate('/gym-management/members/list');
			} catch (error) {
				toast.error(t('An error occurred while saving the member. Please try again.'));
			}
		},
	});

	// Auto-calculate age when birth date changes
	useEffect(() => {
		if (formik.values.birthDate) {
			const calculatedAge = calculateAge(formik.values.birthDate);
			if (calculatedAge !== formik.values.age) {
				formik.setFieldValue('age', calculatedAge);
			}
		}
	}, [formik.values.birthDate]);

	// Auto-calculate BMI when height or weight changes
	useEffect(() => {
		const weight = parseInt(formik.values.currentWeight) || 0;
		const height = parseInt(formik.values.height) || 0;

		if (weight > 0 && height > 0) {
			const calculatedBMI = calculateBMI(weight, height);
			setBmi(calculatedBMI);
			setBmiCategory(getBMICategory(calculatedBMI));
		} else {
			setBmi(0);
			setBmiCategory(null);
		}
	}, [formik.values.currentWeight, formik.values.height]);

	if (loadingMember) {
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
				<form
					onSubmit={(e) => {
						console.log('Form submit event triggered');
						console.log('Event:', e);
						console.log('formik.handleSubmit:', formik.handleSubmit);
						e.preventDefault(); // Prevent default form submission
						formik.handleSubmit(e);
					}}>
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
										<div className='col-md-6'>
											<FormGroup id='birthDate' label={t('Birth Date')}>
												<Input
													type='date'
													name='birthDate'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.birthDate}
													isValid={formik.isValid}
													isTouched={
														formik.touched.birthDate &&
														!!formik.errors.birthDate
													}
													invalidFeedback={formik.errors.birthDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												id='identification'
												label={t('Identification')}>
												<Input
													name='identification'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.identification}
													placeholder={t('ID number or passport')}
													isValid={formik.isValid}
													isTouched={
														formik.touched.identification &&
														!!formik.errors.identification
													}
													invalidFeedback={formik.errors.identification}
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
													value={formik.values.age}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='gender' label={t('Gender')}>
												<Select
													name='gender'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.gender}
													ariaLabel={t('Select gender')}
													isValid={formik.isValid}
													isTouched={
														formik.touched.gender &&
														!!formik.errors.gender
													}
													invalidFeedback={formik.errors.gender}>
													<Option value=''>{t('Select gender')}</Option>
													<Option value='male'>{t('Male')}</Option>
													<Option value='female'>{t('Female')}</Option>
												</Select>
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
										<div className='col-md-4'>
											<FormGroup id='chest' label={t('Chest (cm)')}>
												<Input
													type='number'
													name='chest'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.chest}
													min={60}
													max={150}
													placeholder={t('Chest measurement')}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='waist' label={t('Waist (cm)')}>
												<Input
													type='number'
													name='waist'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.waist}
													min={50}
													max={150}
													placeholder={t('Waist measurement')}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='hips' label={t('Hips (cm)')}>
												<Input
													type='number'
													name='hips'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.hips}
													min={60}
													max={150}
													placeholder={t('Hips measurement')}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='arms' label={t('Arms (cm)')}>
												<Input
													type='number'
													name='arms'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.arms}
													min={20}
													max={60}
													placeholder={t('Arms measurement')}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='thighs' label={t('Thighs (cm)')}>
												<Input
													type='number'
													name='thighs'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.thighs}
													min={40}
													max={100}
													placeholder={t('Thighs measurement')}
												/>
											</FormGroup>
										</div>
										{/* BMI Display */}
										{bmi > 0 && bmiCategory && (
											<div className='col-12'>
												<div className='card border-0 bg-light'>
													<div className='card-body'>
														<div className='row align-items-center'>
															<div className='col-md-6'>
																<h6 className='mb-1'>
																	{t('Body Mass Index (BMI)')}
																</h6>
																<div className='d-flex align-items-center gap-3'>
																	<span className='h4 mb-0'>
																		{bmi}
																	</span>
																	<span
																		className={`badge bg-${bmiCategory.color}`}>
																		{bmiCategory.category}
																	</span>
																</div>
															</div>
															<div className='col-md-6'>
																<small className='text-muted'>
																	{bmiCategory.feedback}
																</small>
															</div>
														</div>
													</div>
												</div>
											</div>
										)}
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
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Membership Information - Only show for new members */}
						{!isEditMode && (
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
														invalidFeedback={
															formik.errors.membershipPlan
														}>
														<Option value=''>
															{t('Select a membership plan')}
														</Option>
														{mockMembershipPlans
															.filter((plan) => plan.isActive)
															.map((plan) => (
																<Option
																	key={plan.id}
																	value={plan.id}>
																	{`${plan.name} - $${plan.price.toLocaleString()} (${
																		plan.type === 'monthly'
																			? t(
																					'{{duration}} month(s)',
																					{
																						duration:
																							plan.duration,
																					},
																				)
																			: t(
																					'{{count}} visits',
																					{
																						count: plan.visitCount,
																					},
																				)
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
											{/* Payment Amount - Only show for new members */}
											{!isEditMode && (
												<div className='col-12'>
													<FormGroup
														id='paymentAmount'
														label={t('Payment Amount (USD)')}>
														<Input
															type='number'
															name='paymentAmount'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.paymentAmount}
															placeholder={t('Enter payment amount')}
															min={0}
															step={0.01}
															isValid={formik.isValid}
															isTouched={
																formik.touched.paymentAmount &&
																!!formik.errors.paymentAmount
															}
															invalidFeedback={
																formik.errors.paymentAmount
															}
														/>
													</FormGroup>
												</div>
											)}
											{formik.values.membershipPlan && (
												<div className='col-12'>
													<div className='alert alert-warning'>
														{(() => {
															const selectedPlan =
																mockMembershipPlans.find(
																	(plan) =>
																		plan.id ===
																		formik.values
																			.membershipPlan,
																);
															if (!selectedPlan) return null;

															const paymentAmount =
																parseFloat(
																	formik.values.paymentAmount,
																) || 0;
															const planPrice = selectedPlan.price;
															const difference =
																planPrice - paymentAmount;

															return (
																<div>
																	<strong>
																		{selectedPlan.name}
																	</strong>
																	<small>
																		<br />
																		<strong>
																			{t('Plan Price')}:
																		</strong>{' '}
																		$
																		{planPrice.toLocaleString()}
																		{!isEditMode &&
																			formik.values
																				.paymentAmount && (
																				<>
																					<br />
																					<strong>
																						{t(
																							'Payment Amount',
																						)}
																					</strong>
																					: $
																					{paymentAmount.toLocaleString()}
																					<br />
																					<strong>
																						<span
																							className={
																								difference >
																								0
																									? 'text-danger'
																									: difference <
																										  0
																										? 'text-success'
																										: 'text-muted'
																							}>
																							{difference >
																							0
																								? t(
																										'Remaining: ${{amount}}',
																										{
																											amount: difference.toLocaleString(),
																										},
																									)
																								: difference <
																									  0
																									? t(
																											'Overpaid: ${{amount}}',
																											{
																												amount: Math.abs(
																													difference,
																												).toLocaleString(),
																											},
																										)
																									: t(
																											'Fully Paid',
																										)}
																						</span>
																					</strong>
																				</>
																			)}
																		<br />
																		<strong>
																			{t('Type')}:
																		</strong>{' '}
																		{selectedPlan.type ===
																		'monthly'
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
																				<strong>
																					{t('Expires')}:
																				</strong>{' '}
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
						)}

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
												type='button'
												color='primary'
												icon={isEditMode ? 'Save' : 'PersonAdd'}
												isDisable={
													!formik.isValid || isCreating || isUpdating
												}
												onClick={() => {
													console.log(
														'Submit button clicked - calling formik.handleSubmit()',
													);
													formik.handleSubmit();
												}}>
												{(isCreating || isUpdating) && (
													<Spinner isSmall inButton />
												)}
												{isCreating || isUpdating
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

			{/* Success Dialog */}
			<MemberSuccessDialog
				isOpen={showSuccessDialog}
				onClose={() => setShowSuccessDialog(false)}
				member={createdMember}
				onNavigateToList={() => {
					setShowSuccessDialog(false);
					navigate('/gym-management/members/list');
				}}
				onKeepCreating={handleKeepCreating}
			/>
		</PageWrapper>
	);
};

export default AddMemberPage;
