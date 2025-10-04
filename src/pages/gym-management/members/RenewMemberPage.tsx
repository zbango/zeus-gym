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
import { useGetMemberByIdQuery } from '../../../store/api/membersApi';
import { useGetMembershipPlansQuery } from '../../../store/api/membershipPlansApi';
import { useCreateMembershipMutation } from '../../../store/api/membershipsApi';
import { extractErrorMessage } from '../../../helpers/errorUtils';

// Plan Summary Component
interface PlanSummaryProps {
	selectedPlanId: string;
	initialPaymentAmount: string;
	startDate: string;
	membershipPlansData: any;
}

const PlanSummary = ({
	selectedPlanId,
	initialPaymentAmount,
	startDate,
	membershipPlansData,
}: PlanSummaryProps) => {
	const { t } = useTranslation();

	const selectedPlan = membershipPlansData?.plans?.find(
		(plan: any) => plan.id === selectedPlanId,
	);

	if (!selectedPlan) return null;

	const initialPayment = parseFloat(initialPaymentAmount) || 0;
	const hasInitialPayment = initialPayment > 0;
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

const RenewMemberPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const pageTitle = t('Renew Membership');

	// RTK Query hooks
	const { data, isLoading: loadingMember, error: memberError } = useGetMemberByIdQuery(id!);
	const memberData = data?.member;

	const {
		data: membershipPlansData,
		isLoading: loadingPlans,
		error: plansError,
	} = useGetMembershipPlansQuery({
		page: 1,
		pageSize: 100,
		status: 'active',
	});

	const [createMembership, { isLoading: isCreating }] = useCreateMembershipMutation();

	// BMI calculation state
	const [bmi, setBmi] = useState<number>(0);
	const [bmiCategory, setBmiCategory] = useState<{
		category: string;
		color: string;
		feedback: string;
	} | null>(null);

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

	const [initialValues, setInitialValues] = useState({
		// Personal Information (readonly)
		name: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		dateOfBirth: '',
		identification: '',
		medicalConditions: '',

		// Health Information (editable)
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

	// Load member data for renewal
	useEffect(() => {
		if (memberData) {
			setInitialValues({
				// Personal Information (readonly)
				name: memberData.personalInfo?.name || '',
				lastName: memberData.personalInfo?.lastName || '',
				email: memberData.personalInfo?.email || '',
				phone: memberData.personalInfo?.phone || '',
				address: memberData.personalInfo?.address || '',
				dateOfBirth: memberData.personalInfo?.birthDate || '',
				identification: memberData.personalInfo?.identification || '',
				medicalConditions: memberData.healthInfo?.medicalConditions || '',

				// Health Information (populated with current data)
				gender: memberData.healthInfo?.gender || '',
				height: memberData.healthInfo?.height?.toString() || '',
				weight: memberData.healthInfo?.currentWeight?.toString() || '',
				chest: memberData.healthInfo?.chest?.toString() || '',
				waist: memberData.healthInfo?.waist?.toString() || '',
				hip: memberData.healthInfo?.hips?.toString() || '',
				arms: memberData.healthInfo?.arms?.toString() || '',
				thighs: memberData.healthInfo?.thighs?.toString() || '',

				// Membership Information
				membershipPlanId: '',
				startDate: dayjs().format('YYYY-MM-DD'),

				// Payment Information
				initialPaymentAmount: '',
				paymentMethod: 'cash' as 'cash' | 'transfer',
			});
		}
	}, [memberData]);

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};

			// Required fields for renewal
			if (!values.membershipPlanId)
				errors.membershipPlanId = t('Membership plan is required');
			if (!values.startDate) errors.startDate = t('Start date is required');
			if (!values.paymentMethod) errors.paymentMethod = t('Payment method is required');

			// Amount validations
			if (values.initialPaymentAmount && parseFloat(values.initialPaymentAmount) <= 0) {
				errors.initialPaymentAmount = t('Initial payment amount must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				// Get selected membership plan to use its price as totalAmount
				const selectedPlan = membershipPlansData?.plans?.find(
					(plan) => plan.id === values.membershipPlanId,
				);

				if (!selectedPlan) {
					toast.error(t('Please select a valid membership plan'));
					return;
				}

				// Create new membership
				const createData = {
					customerId: id!,
					membershipPlanId: values.membershipPlanId,
					startDate: values.startDate,
					totalAmount: selectedPlan.price,
					initialPaymentAmount: parseFloat(values.initialPaymentAmount || '0'),
					paymentMethod: values.paymentMethod,
				};

				await createMembership(createData).unwrap();

				toast.success(
					t('Membership renewed successfully for {{name}}!', {
						name: `${values.name} ${values.lastName}`,
					}),
				);

				// Navigate to members list
				navigate('/gym-management/members/list');
			} catch (error: any) {
				console.error('Error renewing membership:', error);

				// Extract error message from API response with fallback
				const errorMessage = extractErrorMessage(
					error,
					t('An error occurred while renewing the membership. Please try again.'),
				);

				toast.error(errorMessage);
			}
		},
	});

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

	if (loadingMember) {
		return (
			<PageWrapper title={pageTitle}>
				<Page container='fluid'>
					<div
						className='d-flex justify-content-center align-items-center'
						style={{ minHeight: '400px' }}>
						<Spinner size='3x' />
					</div>
				</Page>
			</PageWrapper>
		);
	}

	if (memberError || !memberData) {
		return (
			<PageWrapper title={pageTitle}>
				<Page container='fluid'>
					<div className='text-center py-5'>
						<Icon icon='Error' size='3x' className='text-danger mb-3' />
						<h4>{t('Member not found')}</h4>
						<p className='text-muted'>
							{t('The member you are looking for does not exist.')}
						</p>
						<Button
							color='primary'
							onClick={() => navigate('/gym-management/members/list')}>
							{t('Back to Members')}
						</Button>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={pageTitle}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Refresh' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Renew membership for {{name}}', {
							name: `${memberData.personalInfo?.name} ${memberData.personalInfo?.lastName}`,
						})}
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
						{/* Personal Information - Readonly */}
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
													value={formik.values.name}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='lastName' label={t('Last Name')}>
												<Input
													name='lastName'
													value={formik.values.lastName}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='email' label={t('Email')}>
												<Input
													type='email'
													name='email'
													value={formik.values.email}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='phone' label={t('Phone')}>
												<Input
													type='tel'
													name='phone'
													value={formik.values.phone}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup id='dateOfBirth' label={t('Date of Birth')}>
												<Input
													type='date'
													name='dateOfBirth'
													value={formik.values.dateOfBirth}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												id='identification'
												label={t('Identification')}>
												<Input
													name='identification'
													value={formik.values.identification}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup id='address' label={t('Address')}>
												<Textarea
													name='address'
													value={formik.values.address}
													rows={2}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>

						{/* Health Information - Editable */}
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
													value={calculateAge(formik.values.dateOfBirth)}
													readOnly
													className='bg-light'
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup id='gender' label={t('Gender')}>
												<Input
													name='gender'
													value={
														formik.values.gender === 'male'
															? t('Male')
															: t('Female')
													}
													readOnly
													className='bg-light'
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

						{/* Membership Information */}
						<div className='col-lg-12'>
							<Card>
								<CardHeader>
									<CardLabel icon='CardMembership' iconColor='info'>
										<CardTitle>{t('New Membership Information')}</CardTitle>
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
														?.filter((plan) => plan.status === 'active')
														.map((plan: any) => (
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
													placeholder={t('Enter initial payment amount')}
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
													invalidFeedback={formik.errors.paymentMethod}>
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
														membershipPlansData={membershipPlansData}
													/>
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
												type='button'
												color='primary'
												icon='Refresh'
												isDisable={!formik.isValid || isCreating}
												onClick={formik.handleSubmit}>
												{isCreating && <Spinner isSmall inButton />}
												{isCreating
													? t('Renewing...')
													: t('Renew Membership')}
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

export default RenewMemberPage;
