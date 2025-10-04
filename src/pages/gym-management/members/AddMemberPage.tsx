import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { useCreateMemberMutation, useUpdateMemberMutation } from '../../../store/api/membersApi';
import { useGetMembershipPlansQuery } from '../../../store/api/membershipPlansApi';
import { CreateMemberRequest, UpdateMemberRequest } from '../../../types/member.types';
import { extractErrorMessage } from '../../../helpers/errorUtils';
import MemberSuccessDialog from './components/MemberSuccessDialog';

// Plan Summary Component
interface PlanSummaryProps {
	selectedPlanId: string;
	initialPaymentAmount: string;
	startDate: string;
	isEditMode: boolean;
	membershipPlansData: any;
}

const PlanSummary = ({
	selectedPlanId,
	initialPaymentAmount,
	startDate,
	isEditMode,
	membershipPlansData,
}: PlanSummaryProps) => {
	const { t } = useTranslation();

	const selectedPlan = membershipPlansData?.plans?.find(
		(plan: any) => plan.id === selectedPlanId,
	);

	if (!selectedPlan) return null;

	const initialPayment = parseFloat(initialPaymentAmount) || 0;
	const hasInitialPayment = !isEditMode && initialPayment > 0;
	const difference = selectedPlan.price - initialPayment;

	return (
		<div>
			<strong>{selectedPlan.name}</strong>
			<small>
				<br />
				<strong>{t('Plan Price')}:</strong> ${selectedPlan.price.toLocaleString()}
				{hasInitialPayment && (
					<>
						<br />
						<strong>{t('Initial Payment')}:</strong> ${initialPayment.toLocaleString()}
						<br />
						<strong>
							<span
								className={
									difference > 0
										? 'text-danger'
										: difference < 0
											? 'text-success'
											: 'text-muted'
								}>
								{difference > 0
									? t('Remaining: ${{amount}}', {
											amount: difference.toLocaleString(),
										})
									: difference < 0
										? t('Overpaid: ${{amount}}', {
												amount: Math.abs(difference).toLocaleString(),
											})
										: t('Fully Paid')}
							</span>
						</strong>
					</>
				)}
				<br />
				<strong>{t('Type')}:</strong>{' '}
				{selectedPlan.type === 'monthly'
					? t('Monthly ({{duration}} month(s))', { duration: selectedPlan.duration })
					: t('Count-based ({{count}} visits)', { count: selectedPlan.visitCount })}
				{selectedPlan.type === 'monthly' && (
					<>
						<br />
						<strong>{t('Expires')}:</strong>{' '}
						{dayjs(startDate)
							.add(selectedPlan.duration || 1, 'month')
							.format('DD/MM/YYYY')}
					</>
				)}
			</small>
		</div>
	);
};

const AddMemberPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams<{ id?: string }>();

	const isEditMode = Boolean(id);
	const pageTitle = isEditMode ? t('Edit Member') : t('Add New Member');

	// Get member data from navigation state (for edit mode)
	const memberData = location.state?.memberData;

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
	const {
		data: membershipPlansData,
		isLoading: loadingPlans,
		error: plansError,
	} = useGetMembershipPlansQuery({
		page: 1,
		pageSize: 100,
		status: 'active',
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
			name: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			dateOfBirth: '',
			identification: '',
			medicalConditions: '',

			// Health Information
			age: '',
			gender: 'male',
			height: '',
			weight: '',
			chest: '',
			waist: '',
			hip: '',
			arms: '',
			thighs: '',

			// Membership Information
			membershipPlanId: '',
			startDate: dayjs().format('YYYY-MM-DD'),

			// Payment Information
			initialPaymentAmount: '',
			paymentMethod: 'cash' as 'cash' | 'transfer',
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
		name: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		dateOfBirth: '',
		identification: '',
		medicalConditions: '',

		// Health Information
		age: '',
		gender: 'male',
		height: '',
		weight: '',
		chest: '',
		waist: '',
		hip: '',
		arms: '',
		thighs: '',

		// Membership Information
		membershipPlanId: '',
		startDate: dayjs().format('YYYY-MM-DD'),

		// Payment Information
		initialPaymentAmount: '',
		paymentMethod: 'cash' as 'cash' | 'transfer',
	});

	// Load member data for editing from navigation state
	useEffect(() => {
		if (isEditMode && memberData) {
			setInitialValues({
				name: memberData.personalInfo?.firstName || '',
				lastName: memberData.personalInfo?.lastName || '',
				email: memberData.personalInfo?.email || '',
				phone: memberData.personalInfo?.phone || '',
				address: memberData.personalInfo?.address || '',
				dateOfBirth: memberData.personalInfo?.birthDate || '',
				identification: memberData.personalInfo?.identification || '',
				medicalConditions: memberData.healthInfo?.medicalConditions || '',
				age: memberData.healthInfo?.age?.toString() || '',
				gender: memberData.healthInfo?.gender || '',
				height: memberData.healthInfo?.height?.toString() || '',
				weight: memberData.healthInfo?.currentWeight?.toString() || '',
				chest: memberData.healthInfo?.chest?.toString() || '',
				waist: memberData.healthInfo?.waist?.toString() || '',
				hip: memberData.healthInfo?.hips?.toString() || '',
				arms: memberData.healthInfo?.arms?.toString() || '',
				thighs: memberData.healthInfo?.thighs?.toString() || '',
				membershipPlanId: '', // Not needed for edit mode
				startDate: memberData.membershipInfo?.startDate || dayjs().format('YYYY-MM-DD'),
				initialPaymentAmount: '',
				paymentMethod: 'cash' as 'cash' | 'transfer',
			});
		}
	}, [isEditMode, memberData]);

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};

			// Required fields
			if (!values.name) errors.name = t('Name is required');
			if (!values.lastName) errors.lastName = t('Last name is required');
			if (!values.dateOfBirth) errors.dateOfBirth = t('Date of birth is required');
			if (!values.identification) errors.identification = t('Identification is required');
			if (!values.gender) errors.gender = t('Gender is required');

			// Membership and payment fields (only required for new members)
			if (!isEditMode) {
				if (!values.membershipPlanId)
					errors.membershipPlanId = t('Membership plan is required');
				if (!values.startDate) errors.startDate = t('Start date is required');
				if (!values.paymentMethod) errors.paymentMethod = t('Payment method is required');
			}

			// Email validation
			if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
				errors.email = t('Invalid email address');
			}

			// Phone validation (optional but if provided, must be 10 digits)
			if (values.phone) {
				const phoneDigits = values.phone.replace(/\D/g, ''); // Remove all non-digits
				if (phoneDigits.length !== 10) {
					errors.phone = t('Phone number must be exactly 10 digits');
				}
			}

			// // Height validation
			// if (values.height && (parseInt(values.height) < 140 || parseInt(values.height) > 220)) {
			// 	errors.height = t('Height must be between 140cm and 220cm');
			// }

			// // Weight validation
			// if (values.weight && (parseInt(values.weight) < 40 || parseInt(values.weight) > 200)) {
			// 	errors.weight = t('Weight must be between 40kg and 200kg');
			// }

			// Amount validations
			if (values.initialPaymentAmount && parseFloat(values.initialPaymentAmount) <= 0) {
				errors.initialPaymentAmount = t('Initial payment amount must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				if (isEditMode && id) {
					// Update existing member
					const updateData: UpdateMemberRequest = {
						id,
						name: values.name,
						lastName: values.lastName,
						dateOfBirth: values.dateOfBirth,
						email: values.email,
						phone: values.phone,
						address: values.address,
						identification: values.identification,
						medicalConditions: values.medicalConditions,
					};

					await updateMember(updateData).unwrap();

					toast.success(
						t('Member {{name}} has been successfully updated!', {
							name: `${values.name} ${values.lastName}`,
						}),
					);
				} else {
					// Get selected membership plan to use its price as totalAmount
					const selectedPlan = membershipPlansData?.plans?.find(
						(plan) => plan.id === values.membershipPlanId,
					);

					if (!selectedPlan) {
						toast.error(t('Please select a valid membership plan'));
						return;
					}

					// Create new member
					const createData: CreateMemberRequest = {
						// Personal Information
						name: values.name,
						lastName: values.lastName,
						dateOfBirth: values.dateOfBirth,
						email: values.email,
						phone: values.phone,
						address: values.address,
						identification: values.identification,
						medicalConditions: values.medicalConditions,

						// Progress Information
						age:
							parseInt(values.age) || parseInt(calculateAge(values.dateOfBirth)) || 0,
						gender: values.gender as 'male' | 'female',
						height: parseInt(values.height || '0'),
						weight: parseInt(values.weight || '0'),
						chest: values.chest ? parseInt(values.chest) : undefined,
						waist: values.waist ? parseInt(values.waist) : undefined,
						hip: values.hip ? parseInt(values.hip) : undefined,
						arms: values.arms ? parseInt(values.arms) : undefined,
						thighs: values.thighs ? parseInt(values.thighs) : undefined,

						// Membership Information
						membershipPlanId: values.membershipPlanId,
						startDate: values.startDate,
						totalAmount: selectedPlan.price,

						// Payment Information
						initialPaymentAmount: parseFloat(values.initialPaymentAmount || '0'),
						paymentMethod: values.paymentMethod,
					};

					const result = await createMember(createData).unwrap();

					toast.success(
						t('Member {{name}} has been successfully registered!', {
							name: `${values.name} ${values.lastName}`,
						}),
					);

					// Show success dialog with member data
					setCreatedMember(result);
					setShowSuccessDialog(true);
					return; // Don't navigate yet, wait for dialog action
				}

				// For edit mode, navigate directly
				navigate('/gym-management/members/list');
			} catch (error: any) {
				console.error('Error saving member:', error);

				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(
					error,
					t('An error occurred while saving the member. Please try again.'),
				);

				toast.error(errorMessage);
			}
		},
	});

	// Auto-calculate age when birth date changes
	useEffect(() => {
		if (formik.values.dateOfBirth) {
			const calculatedAge = calculateAge(formik.values.dateOfBirth);
			if (calculatedAge !== formik.values.age) {
				formik.setFieldValue('age', calculatedAge);
			}
		}
	}, [formik.values.dateOfBirth]);

	// Auto-calculate BMI when height or weight changes
	useEffect(() => {
		const weight = parseInt(formik.values.weight) || 0;
		const height = parseInt(formik.values.height) || 0;

		if (weight > 0 && height > 0) {
			const calculatedBMI = calculateBMI(weight, height);
			setBmi(calculatedBMI);
			setBmiCategory(getBMICategory(calculatedBMI));
		} else {
			setBmi(0);
			setBmiCategory(null);
		}
	}, [formik.values.weight, formik.values.height]);

	// No loading state needed since we're not fetching member data

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
											<FormGroup id='name' label={t('Name')}>
												<Input
													name='name'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.name}
													isValid={formik.isValid}
													isTouched={
														formik.touched.name && !!formik.errors.name
													}
													invalidFeedback={formik.errors.name}
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
											<FormGroup id='dateOfBirth' label={t('Date of Birth')}>
												<Input
													type='date'
													name='dateOfBirth'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.dateOfBirth}
													isValid={formik.isValid}
													isTouched={
														formik.touched.dateOfBirth &&
														!!formik.errors.dateOfBirth
													}
													invalidFeedback={formik.errors.dateOfBirth}
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
											<FormGroup id='weight' label={t('Weight (kg)')}>
												<Input
													type='number'
													name='weight'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.weight}
													min={40}
													max={200}
													isValid={formik.isValid}
													isTouched={
														formik.touched.weight &&
														!!formik.errors.weight
													}
													invalidFeedback={formik.errors.weight}
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
											<FormGroup id='hip' label={t('Hips (cm)')}>
												<Input
													type='number'
													name='hip'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.hip}
													min={60}
													max={150}
													placeholder={t('Hip measurement')}
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
													id='membershipPlanId'
													label={t('Membership Plan')}>
													<Select
														name='membershipPlanId'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.membershipPlanId}
														ariaLabel={t('Select membership plan')}
														isValid={formik.isValid}
														isTouched={
															formik.touched.membershipPlanId &&
															!!formik.errors.membershipPlanId
														}
														invalidFeedback={
															formik.errors.membershipPlanId
														}>
														<Option value=''>
															{loadingPlans
																? t('Loading plans...')
																: plansError
																	? t('Error loading plans')
																	: t('Select a membership plan')}
														</Option>
														{membershipPlansData?.plans
															?.filter(
																(plan) => plan.status === 'active',
															)
															.map((plan: any) => (
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
											{/* Initial Payment Amount */}
											<div className='col-md-6'>
												<FormGroup
													id='initialPaymentAmount'
													label={t('Initial Payment Amount (USD)')}>
													<Input
														type='number'
														name='initialPaymentAmount'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.initialPaymentAmount}
														placeholder={t(
															'Enter initial payment amount',
														)}
														min={0}
														step={0.01}
														isValid={formik.isValid}
														isTouched={
															formik.touched.initialPaymentAmount &&
															!!formik.errors.initialPaymentAmount
														}
														invalidFeedback={
															formik.errors.initialPaymentAmount
														}
													/>
												</FormGroup>
											</div>
											{/* Payment Method */}
											<div className='col-md-6'>
												<FormGroup
													id='paymentMethod'
													label={t('Payment Method')}>
													<Select
														name='paymentMethod'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.paymentMethod}
														ariaLabel={t('Select payment method')}
														isValid={formik.isValid}
														isTouched={
															formik.touched.paymentMethod &&
															!!formik.errors.paymentMethod
														}
														invalidFeedback={
															formik.errors.paymentMethod
														}>
														<Option value='cash'>{t('Cash')}</Option>
														<Option value='transfer'>
															{t('Transfer')}
														</Option>
													</Select>
												</FormGroup>
											</div>
											{formik.values.membershipPlanId && (
												<div className='col-12'>
													<div className='alert alert-warning'>
														<PlanSummary
															selectedPlanId={
																formik.values.membershipPlanId
															}
															initialPaymentAmount={
																formik.values.initialPaymentAmount
															}
															startDate={formik.values.startDate}
															isEditMode={isEditMode}
															membershipPlansData={
																membershipPlansData
															}
														/>
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
												onClick={formik.handleSubmit}>
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
