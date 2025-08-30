import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
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
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Textarea from '../../../components/bootstrap/forms/Textarea';
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
														<DropdownItem>
															<Icon
																icon='Visibility'
																className='me-2'
															/>
															{t('View Profile')}
														</DropdownItem>
														<DropdownItem>
															<Icon icon='Edit' className='me-2' />
															{t('Edit Member')}
														</DropdownItem>
														<DropdownItem>
															<Icon
																icon='TrendingUp'
																className='me-2'
															/>
															{t('View Progress')}
														</DropdownItem>
														<DropdownItem isDivider />
														<DropdownItem>
															<Icon icon='Payment' className='me-2' />
															{t('Payment History')}
														</DropdownItem>
														<DropdownItem>
															<Icon
																icon='LoginTwoTone'
																className='me-2'
															/>
															{t('Check-in History')}
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
					size='lg'
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
			</Page>
		</PageWrapper>
	);
};

export default MembersListPage;
