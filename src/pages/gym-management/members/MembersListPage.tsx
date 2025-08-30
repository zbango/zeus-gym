import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
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
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
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
import Textarea from '../../../components/bootstrap/forms/Textarea';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import useDarkMode from '../../../hooks/useDarkMode';
import classNames from 'classnames';
import Spinner from '../../../components/bootstrap/Spinner';
import Avatar from '../../../components/Avatar';
import { mockMembers, mockPayments } from '../../../common/data/gymMockData';
import { IMember } from '../../../types/gym-types';

const MembersListPage = () => {
	const { t } = useTranslation();
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [members, setMembers] = useState<IMember[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);

	// OffCanvas states
	const [memberDetailsOffcanvas, setMemberDetailsOffcanvas] = useState(false);
	const [selectedMember, setSelectedMember] = useState<IMember | null>(null);

	// Modal states
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingMember, setEditingMember] = useState<IMember | null>(null);
	const [saving, setSaving] = useState(false);

	// Load members data
	useEffect(() => {
		const loadMembers = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setMembers(mockMembers);
			setLoading(false);
		};

		loadMembers();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(members);

	// Edit form
	const editFormik = useFormik({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			age: '',
			height: '',
			currentWeight: '',
			goals: '',
			medicalConditions: '',
			emergencyContactName: '',
			emergencyContactRelationship: '',
			emergencyContactPhone: '',
		},
		validate: (values) => {
			const errors: any = {};
			if (!values.firstName) errors.firstName = t('First name is required');
			if (!values.lastName) errors.lastName = t('Last name is required');
			if (!values.email) errors.email = t('Email is required');
			if (!values.phone) errors.phone = t('Phone is required');
			if (!values.address) errors.address = t('Address is required');
			if (!values.age) errors.age = t('Age is required');
			if (!values.height) errors.height = t('Height is required');
			if (!values.currentWeight) errors.currentWeight = t('Weight is required');
			if (!values.emergencyContactName)
				errors.emergencyContactName = t('Emergency contact name is required');
			if (!values.emergencyContactPhone)
				errors.emergencyContactPhone = t('Emergency contact phone is required');
			return errors;
		},
		onSubmit: async (values) => {
			if (!editingMember) return;

			setSaving(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const updatedMember: IMember = {
					...editingMember,
					personalInfo: {
						...editingMember.personalInfo,
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						phone: values.phone,
						address: values.address,
						emergencyContact: {
							name: values.emergencyContactName,
							relationship: values.emergencyContactRelationship,
							phone: values.emergencyContactPhone,
						},
					},
					healthInfo: {
						...editingMember.healthInfo,
						age: parseInt(values.age),
						height: parseInt(values.height),
						currentWeight: parseInt(values.currentWeight),
						goals: values.goals,
						medicalConditions: values.medicalConditions || undefined,
					},
				};

				setMembers((prev) =>
					prev.map((member) => (member.id === editingMember.id ? updatedMember : member)),
				);

				// Update selected member if it's being viewed
				if (selectedMember?.id === editingMember.id) {
					setSelectedMember(updatedMember);
				}

				setEditModalOpen(false);
				setEditingMember(null);
			} catch (error) {
				alert(t('Failed to update member. Please try again.'));
			} finally {
				setSaving(false);
			}
		},
	});

	// Utility functions
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'success';
			case 'expired':
				return 'danger';
			case 'suspended':
				return 'warning';
			case 'inactive':
				return 'secondary';
			default:
				return 'secondary';
		}
	};

	const getMemberPaymentStatus = (memberId: string) => {
		const payments = mockPayments.filter((p) => p.memberId === memberId);
		const hasPartialPayment = payments.some((p) => p.status === 'partial');
		return hasPartialPayment;
	};

	const handleMemberDetails = (member: IMember) => {
		setSelectedMember(member);
		setMemberDetailsOffcanvas(true);
	};

	const handleEditMember = (member: IMember) => {
		setEditingMember(member);
		editFormik.setValues({
			firstName: member.personalInfo.firstName,
			lastName: member.personalInfo.lastName,
			email: member.personalInfo.email,
			phone: member.personalInfo.phone,
			address: member.personalInfo.address,
			age: member.healthInfo.age.toString(),
			height: member.healthInfo.height.toString(),
			currentWeight: member.healthInfo.currentWeight.toString(),
			goals: member.healthInfo.goals,
			medicalConditions: member.healthInfo.medicalConditions || '',
			emergencyContactName: member.personalInfo.emergencyContact.name,
			emergencyContactRelationship: member.personalInfo.emergencyContact.relationship,
			emergencyContactPhone: member.personalInfo.emergencyContact.phone,
		});
		setEditModalOpen(true);
	};

	const handleStatusChange = async (memberId: string, newStatus: string) => {
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setMembers((prev) =>
			prev.map((member) =>
				member.id === memberId
					? {
							...member,
							membershipInfo: { ...member.membershipInfo, status: newStatus as any },
						}
					: member,
			),
		);
	};

	const handleDeleteMember = async (memberId: string, memberName: string) => {
		if (
			!confirm(
				t(
					'Are you sure you want to delete member "{{name}}"? This action cannot be undone.',
					{ name: memberName },
				),
			)
		) {
			return;
		}

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setMembers((prev) => prev.filter((member) => member.id !== memberId));

			// Close offcanvas if deleted member was being viewed
			if (selectedMember?.id === memberId) {
				setMemberDetailsOffcanvas(false);
				setSelectedMember(null);
			}
		} catch (error) {
			alert(t('Failed to delete member. Please try again.'));
		}
	};

	if (loading) {
		return (
			<PageWrapper title={t('Members List')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading members...')}</div>
						<div className='text-muted'>
							{t('Please wait while we fetch member data')}
						</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('Members List')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Group' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Managing {{count}} total members.', { count: members.length })}{' '}
						<Icon icon='CheckCircle' color='success' className='mx-1' size='lg' />
						{t('{{count}} active members.', {
							count: members.filter((m) => m.membershipInfo.status === 'active')
								.length,
						})}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color='success'
						icon='PersonAdd'
						tag='a'
						to='/gym-management/members/add'>
						{t('Add New Member')}
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
				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Group' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('Gym Members')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search members...')}
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
										onClick={() => requestSort('personalInfo.firstName')}
										className='cursor-pointer text-decoration-underline'>
										{t('Member')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('personalInfo.firstName')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Contact')}</th>
									<th>{t('Membership')}</th>
									<th
										onClick={() => requestSort('membershipInfo.status')}
										className='cursor-pointer text-decoration-underline'>
										{t('Status')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('membershipInfo.status')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Progress')}</th>
									<th>{t('Payment')}</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(items, currentPage, perPage).map((member) => {
									const hasPartialPayment = getMemberPaymentStatus(member.id);
									const latestProgress =
										member.progressTracking.measurements[
											member.progressTracking.measurements.length - 1
										];

									return (
										<tr key={member.id}>
											<td>
												<Button
													isOutline={!darkModeStatus}
													color='dark'
													isLight={darkModeStatus}
													className={classNames({
														'border-light': !darkModeStatus,
													})}
													icon='Visibility'
													onClick={() => handleMemberDetails(member)}
													aria-label='View details'
												/>
											</td>
											<td>
												<div className='d-flex align-items-center'>
													<Avatar size={40} className='me-3' src='' />
													<div>
														<div className='fw-bold'>
															{member.personalInfo.firstName}{' '}
															{member.personalInfo.lastName}
														</div>
														<div className='small text-muted'>
															{t('{{age}} years', {
																age: member.healthInfo.age,
															})}{' '}
															• {member.healthInfo.height}cm
														</div>
													</div>
												</div>
											</td>
											<td>
												<div>
													<div>{member.personalInfo.email}</div>
													<div className='small text-muted'>
														{member.personalInfo.phone}
													</div>
												</div>
											</td>
											<td>
												<div>
													<div className='fw-bold'>
														{member.membershipInfo.plan}
													</div>
													<div className='small text-muted'>
														{member.membershipInfo.type === 'monthly'
															? t('Expires: {{date}}', {
																	date: dayjs(
																		member.membershipInfo
																			.endDate,
																	).format('DD/MM/YYYY'),
																})
															: t('{{count}} visits left', {
																	count: member.membershipInfo
																		.remainingVisits,
																})}
													</div>
												</div>
											</td>
											<td>
												<Dropdown>
													<DropdownToggle hasIcon={false}>
														<Button
															isLink
															color={getStatusColor(
																member.membershipInfo.status,
															)}
															icon='Circle'
															className='text-nowrap'>
															{t(
																member.membershipInfo.status
																	.charAt(0)
																	.toUpperCase() +
																	member.membershipInfo.status.slice(
																		1,
																	),
															)}
														</Button>
													</DropdownToggle>
													<DropdownMenu>
														{[
															'active',
															'inactive',
															'suspended',
															'expired',
														].map((status) => (
															<DropdownItem
																key={status}
																onClick={() =>
																	handleStatusChange(
																		member.id,
																		status,
																	)
																}>
																<div>
																	<Icon
																		icon='Circle'
																		color={getStatusColor(
																			status,
																		)}
																		className='me-2'
																	/>
																	{t(
																		status
																			.charAt(0)
																			.toUpperCase() +
																			status.slice(1),
																	)}
																</div>
															</DropdownItem>
														))}
													</DropdownMenu>
												</Dropdown>
											</td>
											<td>
												{latestProgress && (
													<div>
														<div className='fw-bold'>
															{latestProgress.weight}kg
														</div>
														<div className='small text-muted'>
															{dayjs(latestProgress.date).format(
																'DD/MM/YYYY',
															)}
														</div>
													</div>
												)}
											</td>
											<td>
												{hasPartialPayment ? (
													<span className='badge bg-warning'>
														<Icon
															icon='Warning'
															size='sm'
															className='me-1'
														/>
														{t('Pending')}
													</span>
												) : (
													<span className='badge bg-success'>
														<Icon
															icon='CheckCircle'
															size='sm'
															className='me-1'
														/>
														{t('Up to date')}
													</span>
												)}
											</td>
											<td>
												<Dropdown>
													<DropdownToggle hasIcon={false}>
														<Button
															isOutline={!darkModeStatus}
															color='dark'
															isLight={darkModeStatus}
															className={classNames({
																'border-light': !darkModeStatus,
															})}
															icon='MoreVert'
														/>
													</DropdownToggle>
													<DropdownMenu>
														<DropdownItem
															onClick={() =>
																handleMemberDetails(member)
															}>
															<div>
																<Icon
																	icon='Visibility'
																	className='me-2'
																/>
																{t('View Profile')}
															</div>
														</DropdownItem>
														<DropdownItem
															onClick={() =>
																handleEditMember(member)
															}>
															<div>
																<Icon
																	icon='Edit'
																	className='me-2'
																/>
																{t('Edit Member')}
															</div>
														</DropdownItem>
														<DropdownItem>
															<div>
																<Icon
																	icon='TrendingUp'
																	className='me-2'
																/>
																{t('View Progress')}
															</div>
														</DropdownItem>
														<DropdownItem isDivider />
														<DropdownItem>
															<div>
																<Icon
																	icon='Payment'
																	className='me-2'
																/>
																{t('Payment History')}
															</div>
														</DropdownItem>
														<DropdownItem>
															<div>
																<Icon
																	icon='LoginTwoTone'
																	className='me-2'
																/>
																{t('Check-in History')}
															</div>
														</DropdownItem>
														<DropdownItem isDivider />
														<DropdownItem
															onClick={() =>
																handleDeleteMember(
																	member.id,
																	`${member.personalInfo.firstName} ${member.personalInfo.lastName}`,
																)
															}>
															<div className='text-danger'>
																<Icon
																	icon='Delete'
																	className='me-2'
																/>
																{t('Delete Member')}
															</div>
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</CardBody>
					<PaginationButtons
						data={items}
						label='members'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* Member Details OffCanvas */}
				<OffCanvas
					setOpen={setMemberDetailsOffcanvas}
					isOpen={memberDetailsOffcanvas}
					titleId='memberDetails'
					placement='end'
					isBodyScroll>
					<OffCanvasHeader setOpen={setMemberDetailsOffcanvas}>
						<OffCanvasTitle id='memberDetails'>
							{t('Member Profile: {{name}}', {
								name: `${selectedMember?.personalInfo.firstName} ${selectedMember?.personalInfo.lastName}`,
							})}
						</OffCanvasTitle>
					</OffCanvasHeader>
					<OffCanvasBody>
						{selectedMember && (
							<div className='row g-4'>
								{/* Personal Information */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='Person' iconColor='primary'>
												<CardTitle>{t('Personal Information')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='row g-3'>
												<div className='col-md-6'>
													<FormGroup label={t('First Name')}>
														<Input
															value={
																selectedMember.personalInfo
																	.firstName
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup label={t('Last Name')}>
														<Input
															value={
																selectedMember.personalInfo.lastName
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup label={t('Email')}>
														<Input
															value={
																selectedMember.personalInfo.email
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup label={t('Phone')}>
														<Input
															value={
																selectedMember.personalInfo.phone
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup label={t('Address')}>
														<Textarea
															value={
																selectedMember.personalInfo.address
															}
															readOnly
															rows={2}
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
								</div>

								{/* Health Information */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='FitnessCenter' iconColor='success'>
												<CardTitle>{t('Health & Fitness')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='row g-3'>
												<div className='col-md-4'>
													<FormGroup label={t('Age')}>
														<Input
															value={t('{{age}} years', {
																age: selectedMember.healthInfo.age,
															})}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-4'>
													<FormGroup label={t('Height')}>
														<Input
															value={`${selectedMember.healthInfo.height} cm`}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-4'>
													<FormGroup label={t('Current Weight')}>
														<Input
															value={`${selectedMember.healthInfo.currentWeight} kg`}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup label={t('Goals')}>
														<Textarea
															value={selectedMember.healthInfo.goals}
															readOnly
															rows={2}
														/>
													</FormGroup>
												</div>
												{selectedMember.healthInfo.medicalConditions && (
													<div className='col-12'>
														<FormGroup label={t('Medical Conditions')}>
															<Textarea
																value={
																	selectedMember.healthInfo
																		.medicalConditions
																}
																readOnly
																rows={2}
															/>
														</FormGroup>
													</div>
												)}
											</div>
										</CardBody>
									</Card>
								</div>

								{/* Progress Tracking */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='TrendingUp' iconColor='info'>
												<CardTitle>{t('Recent Progress')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											{selectedMember.progressTracking.measurements.length >
											0 ? (
												<div className='table-responsive'>
													<table className='table table-sm'>
														<thead>
															<tr>
																<th>{t('Date')}</th>
																<th>{t('Weight')}</th>
																<th>{t('Body Fat')}</th>
																<th>{t('Chest')}</th>
																<th>{t('Waist')}</th>
																<th>{t('Arms')}</th>
															</tr>
														</thead>
														<tbody>
															{selectedMember.progressTracking.measurements
																.slice(-3)
																.map((measurement, index) => (
																	<tr key={index}>
																		<td>
																			{dayjs(
																				measurement.date,
																			).format('DD/MM/YYYY')}
																		</td>
																		<td>
																			{measurement.weight}kg
																		</td>
																		<td>
																			{measurement.bodyFat ||
																				'-'}
																			%
																		</td>
																		<td>
																			{measurement.chest ||
																				'-'}
																			cm
																		</td>
																		<td>
																			{measurement.waist ||
																				'-'}
																			cm
																		</td>
																		<td>
																			{measurement.arms ||
																				'-'}
																			cm
																		</td>
																	</tr>
																))}
														</tbody>
													</table>
												</div>
											) : (
												<div className='text-center py-4'>
													<Icon
														icon='TrendingUp'
														size='3x'
														color='secondary'
														className='mb-2'
													/>
													<div className='text-muted'>
														{t('No progress measurements recorded yet')}
													</div>
												</div>
											)}
										</CardBody>
									</Card>
								</div>

								{/* Emergency Contact */}
								<div className='col-12'>
									<Card>
										<CardHeader>
											<CardLabel icon='ContactPhone' iconColor='warning'>
												<CardTitle>{t('Emergency Contact')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody>
											<div className='row g-3'>
												<div className='col-md-6'>
													<FormGroup label={t('Name')}>
														<Input
															value={
																selectedMember.personalInfo
																	.emergencyContact.name
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup label={t('Relationship')}>
														<Input
															value={
																selectedMember.personalInfo
																	.emergencyContact.relationship
															}
															readOnly
														/>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup label={t('Phone')}>
														<Input
															value={
																selectedMember.personalInfo
																	.emergencyContact.phone
															}
															readOnly
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
								</div>
							</div>
						)}
					</OffCanvasBody>
				</OffCanvas>

				{/* Edit Member Modal */}
				<Modal
					setIsOpen={setEditModalOpen}
					isOpen={editModalOpen}
					titleId='editMemberModal'
					size='xl'
					isScrollable>
					<ModalHeader setIsOpen={setEditModalOpen}>
						<ModalTitle id='editMemberModal'>
							{t('Edit Member: {{name}}', {
								name: `${editingMember?.personalInfo.firstName} ${editingMember?.personalInfo.lastName}`,
							})}
						</ModalTitle>
					</ModalHeader>
					<form onSubmit={editFormik.handleSubmit}>
						<ModalBody>
							<div className='row g-4'>
								{/* Personal Information */}
								<div className='col-12'>
									<h6 className='mb-3'>
										<Icon icon='Person' className='me-2' />
										{t('Personal Information')}
									</h6>
									<div className='row g-3'>
										<div className='col-md-6'>
											<FormGroup label={t('First Name')}>
												<Input
													name='firstName'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.firstName}
													isValid={
														editFormik.touched.firstName &&
														!editFormik.errors.firstName
													}
													isTouched={
														editFormik.touched.firstName &&
														!!editFormik.errors.firstName
													}
													invalidFeedback={editFormik.errors.firstName}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup label={t('Last Name')}>
												<Input
													name='lastName'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.lastName}
													isValid={
														editFormik.touched.lastName &&
														!editFormik.errors.lastName
													}
													isTouched={
														editFormik.touched.lastName &&
														!!editFormik.errors.lastName
													}
													invalidFeedback={editFormik.errors.lastName}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup label={t('Email')}>
												<Input
													type='email'
													name='email'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.email}
													isValid={
														editFormik.touched.email &&
														!editFormik.errors.email
													}
													isTouched={
														editFormik.touched.email &&
														!!editFormik.errors.email
													}
													invalidFeedback={editFormik.errors.email}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup label={t('Phone')}>
												<Input
													name='phone'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.phone}
													placeholder='+593 99 999 9999'
													isValid={
														editFormik.touched.phone &&
														!editFormik.errors.phone
													}
													isTouched={
														editFormik.touched.phone &&
														!!editFormik.errors.phone
													}
													invalidFeedback={editFormik.errors.phone}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup label={t('Address')}>
												<Textarea
													name='address'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.address}
													rows={2}
													isValid={
														editFormik.touched.address &&
														!editFormik.errors.address
													}
													isTouched={
														editFormik.touched.address &&
														!!editFormik.errors.address
													}
													invalidFeedback={editFormik.errors.address}
												/>
											</FormGroup>
										</div>
									</div>
								</div>

								{/* Health Information */}
								<div className='col-12'>
									<h6 className='mb-3'>
										<Icon icon='FitnessCenter' className='me-2' />
										{t('Health & Fitness')}
									</h6>
									<div className='row g-3'>
										<div className='col-md-4'>
											<FormGroup label={t('Age')}>
												<Input
													type='number'
													name='age'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.age}
													min={16}
													max={100}
													isValid={
														editFormik.touched.age &&
														!editFormik.errors.age
													}
													isTouched={
														editFormik.touched.age &&
														!!editFormik.errors.age
													}
													invalidFeedback={editFormik.errors.age}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup label={t('Height (cm)')}>
												<Input
													type='number'
													name='height'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.height}
													min={120}
													max={250}
													isValid={
														editFormik.touched.height &&
														!editFormik.errors.height
													}
													isTouched={
														editFormik.touched.height &&
														!!editFormik.errors.height
													}
													invalidFeedback={editFormik.errors.height}
												/>
											</FormGroup>
										</div>
										<div className='col-md-4'>
											<FormGroup label={t('Weight (kg)')}>
												<Input
													type='number'
													name='currentWeight'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.currentWeight}
													min={30}
													max={300}
													isValid={
														editFormik.touched.currentWeight &&
														!editFormik.errors.currentWeight
													}
													isTouched={
														editFormik.touched.currentWeight &&
														!!editFormik.errors.currentWeight
													}
													invalidFeedback={
														editFormik.errors.currentWeight
													}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup label={t('Goals')}>
												<Textarea
													name='goals'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.goals}
													rows={2}
													placeholder={t(
														'Fitness goals and objectives...',
													)}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup label={t('Medical Conditions (Optional)')}>
												<Textarea
													name='medicalConditions'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.medicalConditions}
													rows={2}
													placeholder={t(
														'Any medical conditions or allergies...',
													)}
												/>
											</FormGroup>
										</div>
									</div>
								</div>

								{/* Emergency Contact */}
								<div className='col-12'>
									<h6 className='mb-3'>
										<Icon icon='ContactPhone' className='me-2' />
										{t('Emergency Contact')}
									</h6>
									<div className='row g-3'>
										<div className='col-md-6'>
											<FormGroup label={t('Name')}>
												<Input
													name='emergencyContactName'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.emergencyContactName}
													isValid={
														editFormik.touched.emergencyContactName &&
														!editFormik.errors.emergencyContactName
													}
													isTouched={
														editFormik.touched.emergencyContactName &&
														!!editFormik.errors.emergencyContactName
													}
													invalidFeedback={
														editFormik.errors.emergencyContactName
													}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup label={t('Relationship')}>
												<Input
													name='emergencyContactRelationship'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={
														editFormik.values
															.emergencyContactRelationship
													}
													placeholder={t('e.g., Father, Mother, Spouse')}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup label={t('Phone')}>
												<Input
													name='emergencyContactPhone'
													onChange={editFormik.handleChange}
													onBlur={editFormik.handleBlur}
													value={editFormik.values.emergencyContactPhone}
													placeholder='+593 99 999 9999'
													isValid={
														editFormik.touched.emergencyContactPhone &&
														!editFormik.errors.emergencyContactPhone
													}
													isTouched={
														editFormik.touched.emergencyContactPhone &&
														!!editFormik.errors.emergencyContactPhone
													}
													invalidFeedback={
														editFormik.errors.emergencyContactPhone
													}
												/>
											</FormGroup>
										</div>
									</div>
								</div>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button
								color='secondary'
								onClick={() => {
									setEditModalOpen(false);
									setEditingMember(null);
								}}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='primary'
								icon='Save'
								isDisable={!editFormik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{t('Save Changes')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default MembersListPage;
