import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Icon from '../../components/icon/Icon';
import Button from '../../components/bootstrap/Button';
import Page from '../../layout/Page/Page';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import useDarkMode from '../../hooks/useDarkMode';
import { mockMembers, mockCheckIns } from '../../common/data/gymMockData';
import { IMember, ICheckIn } from '../../types/gym-types';
import Spinner from '../../components/bootstrap/Spinner';
import classNames from 'classnames';
import Avatar from '../../components/Avatar';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Alert from '../../components/bootstrap/Alert';

const CheckInPage = () => {
	const { themeStatus, darkModeStatus } = useDarkMode();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [members, setMembers] = useState<IMember[]>([]);
	const [checkIns, setCheckIns] = useState<ICheckIn[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedMember, setSelectedMember] = useState<IMember | null>(null);
	const [showCheckInModal, setShowCheckInModal] = useState(false);
	const [showCheckOutModal, setShowCheckOutModal] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setMembers(mockMembers);
			setCheckIns(mockCheckIns);
			setLoading(false);
		};

		loadData();
	}, []);

	// Filter active members based on search
	const filteredMembers = members.filter(
		(member) =>
			member.membershipInfo.status === 'active' &&
			(member.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.personalInfo.phone.includes(searchTerm)),
	);

	// Get current checked-in members
	const currentlyCheckedIn = checkIns.filter((checkin) => !checkin.checkOutTime);

	// Get today's check-ins
	const todayCheckIns = checkIns.filter((checkin) =>
		dayjs(checkin.checkInTime).isSame(dayjs(), 'day'),
	);

	const handleCheckIn = async (member: IMember) => {
		setProcessing(true);

		// Check if member is already checked in
		const alreadyCheckedIn = currentlyCheckedIn.find(
			(checkin) => checkin.memberId === member.id,
		);
		if (alreadyCheckedIn) {
			setAlert({
				type: 'warning',
				message: `${member.personalInfo.firstName} is already checked in!`,
			});
			setProcessing(false);
			setShowCheckInModal(false);
			return;
		}

		// Check membership validity
		if (member.membershipInfo.type === 'monthly') {
			if (dayjs().isAfter(dayjs(member.membershipInfo.endDate))) {
				setAlert({
					type: 'danger',
					message: `${member.personalInfo.firstName}'s membership has expired!`,
				});
				setProcessing(false);
				setShowCheckInModal(false);
				return;
			}
		} else if (member.membershipInfo.type === 'count-based') {
			if ((member.membershipInfo.remainingVisits || 0) <= 0) {
				setAlert({
					type: 'danger',
					message: `${member.personalInfo.firstName} has no remaining visits!`,
				});
				setProcessing(false);
				setShowCheckInModal(false);
				return;
			}
		}

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const newCheckIn: ICheckIn = {
			id: `checkin-${Date.now()}`,
			memberId: member.id,
			memberName: `${member.personalInfo.firstName} ${member.personalInfo.lastName}`,
			checkInTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
			membershipType: member.membershipInfo.type,
			visitDeducted: member.membershipInfo.type === 'count-based',
		};

		setCheckIns((prev) => [newCheckIn, ...prev]);

		// Update member's remaining visits if count-based
		if (member.membershipInfo.type === 'count-based') {
			setMembers((prev) =>
				prev.map((m) =>
					m.id === member.id
						? {
								...m,
								membershipInfo: {
									...m.membershipInfo,
									remainingVisits: (m.membershipInfo.remainingVisits || 0) - 1,
								},
							}
						: m,
				),
			);
		}

		setAlert({
			type: 'success',
			message: `${member.personalInfo.firstName} checked in successfully!`,
		});

		setProcessing(false);
		setShowCheckInModal(false);
		setSelectedMember(null);
	};

	const handleCheckOut = async (checkInId: string) => {
		setProcessing(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const checkInRecord = checkIns.find((checkin) => checkin.id === checkInId);
		if (checkInRecord) {
			const duration = dayjs().diff(dayjs(checkInRecord.checkInTime), 'minutes');

			setCheckIns((prev) =>
				prev.map((checkin) =>
					checkin.id === checkInId
						? {
								...checkin,
								checkOutTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
								duration,
							}
						: checkin,
				),
			);

			setAlert({
				type: 'success',
				message: `${checkInRecord.memberName} checked out successfully! Duration: ${duration} minutes`,
			});
		}

		setProcessing(false);
		setShowCheckOutModal(false);
		setSelectedMember(null);
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
			<PageWrapper title='Check-in System'>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>Loading check-in system...</div>
						<div className='text-muted'>Preparing member data</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title='Check-in System'>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='LoginTwoTone' className='me-2' size='2x' />
					<span className='text-muted'>
						Gym Check-in System • {currentlyCheckedIn.length} currently inside •{' '}
						{todayCheckIns.length} total today
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color={themeStatus}
						icon='Refresh'
						onClick={() => window.location.reload()}>
						Refresh
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				{alert && (
					<Alert color={alert.type} isLight className='mb-4'>
						<Icon
							icon={
								alert.type === 'success'
									? 'CheckCircle'
									: alert.type === 'warning'
										? 'Warning'
										: 'Error'
							}
							className='me-2'
						/>
						{alert.message}
					</Alert>
				)}

				<div className='row g-4'>
					{/* Check-in Section */}
					<div className='col-md-8'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='PersonSearch' iconColor='primary'>
									<CardTitle>Member Check-in</CardTitle>
								</CardLabel>
								<CardActions>
									<FormGroup className='mb-0'>
										<Input
											type='search'
											placeholder='Search by name, email, or phone...'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											style={{ width: '300px' }}
										/>
									</FormGroup>
								</CardActions>
							</CardHeader>
							<CardBody>
								{searchTerm.length < 2 ? (
									<div className='text-center py-5'>
										<Icon
											icon='Search'
											size='3x'
											color='muted'
											className='mb-3'
										/>
										<div className='h5 text-muted'>Search for a member</div>
										<div className='text-muted'>
											Type at least 2 characters to search for members
										</div>
									</div>
								) : filteredMembers.length === 0 ? (
									<div className='text-center py-5'>
										<Icon
											icon='PersonOff'
											size='3x'
											color='muted'
											className='mb-3'
										/>
										<div className='h5 text-muted'>No members found</div>
										<div className='text-muted'>
											Try adjusting your search terms
										</div>
									</div>
								) : (
									<div className='row g-3'>
										{filteredMembers.slice(0, 6).map((member) => {
											const alreadyCheckedIn = currentlyCheckedIn.find(
												(checkin) => checkin.memberId === member.id,
											);
											const isExpired =
												member.membershipInfo.type === 'monthly'
													? dayjs().isAfter(
															dayjs(member.membershipInfo.endDate),
														)
													: (member.membershipInfo.remainingVisits ||
															0) <= 0;

											return (
												<div key={member.id} className='col-md-6'>
													<Card
														className={classNames('h-100', {
															'border-success': alreadyCheckedIn,
															'border-warning': isExpired,
														})}>
														<CardBody>
															<div className='d-flex align-items-center'>
																<Avatar
																	size={50}
																	className='me-3'
																/>
																<div className='flex-grow-1'>
																	<div className='fw-bold'>
																		{
																			member.personalInfo
																				.firstName
																		}{' '}
																		{
																			member.personalInfo
																				.lastName
																		}
																	</div>
																	<div className='small text-muted'>
																		{member.personalInfo.email}
																	</div>
																	<div className='small text-muted'>
																		{member.membershipInfo.plan}{' '}
																		•
																		{member.membershipInfo
																			.type === 'monthly'
																			? ` Expires: ${dayjs(member.membershipInfo.endDate).format('DD/MM')}`
																			: ` ${member.membershipInfo.remainingVisits} visits left`}
																	</div>
																</div>
																<div>
																	{alreadyCheckedIn ? (
																		<Button
																			color='warning'
																			size='sm'
																			icon='Logout'
																			onClick={() => {
																				setSelectedMember(
																					member,
																				);
																				setShowCheckOutModal(
																					true,
																				);
																			}}>
																			Check Out
																		</Button>
																	) : isExpired ? (
																		<Button
																			color='secondary'
																			size='sm'
																			icon='Warning'
																			isDisable>
																			{member.membershipInfo
																				.type === 'monthly'
																				? 'Expired'
																				: 'No Visits'}
																		</Button>
																	) : (
																		<Button
																			color='success'
																			size='sm'
																			icon='Login'
																			onClick={() => {
																				setSelectedMember(
																					member,
																				);
																				setShowCheckInModal(
																					true,
																				);
																			}}>
																			Check In
																		</Button>
																	)}
																</div>
															</div>
														</CardBody>
													</Card>
												</div>
											);
										})}
									</div>
								)}
							</CardBody>
						</Card>
					</div>

					{/* Currently Checked-in Members */}
					<div className='col-md-4'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='FitnessCenter' iconColor='success'>
									<CardTitle>
										Currently Inside ({currentlyCheckedIn.length})
									</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{currentlyCheckedIn.length === 0 ? (
									<div className='text-center py-4'>
										<Icon
											icon='PersonOff'
											size='2x'
											color='muted'
											className='mb-2'
										/>
										<div className='text-muted'>
											No one is currently checked in
										</div>
									</div>
								) : (
									<div className='space-y-3'>
										{currentlyCheckedIn.map((checkin) => {
											const member = members.find(
												(m) => m.id === checkin.memberId,
											);
											const duration = dayjs().diff(
												dayjs(checkin.checkInTime),
												'minutes',
											);

											return (
												<div
													key={checkin.id}
													className='d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2'>
													<div className='d-flex align-items-center'>
														<Avatar size={32} className='me-2' />
														<div>
															<div className='fw-bold small'>
																{checkin.memberName}
															</div>
															<div
																className='text-muted'
																style={{ fontSize: '0.75rem' }}>
																{dayjs(checkin.checkInTime).format(
																	'HH:mm',
																)}{' '}
																• {duration}min
															</div>
														</div>
													</div>
													<Button
														color='warning'
														size='sm'
														icon='Logout'
														isLight
														onClick={() => handleCheckOut(checkin.id)}>
														Out
													</Button>
												</div>
											);
										})}
									</div>
								)}
							</CardBody>
						</Card>

						{/* Today's Activity */}
						<Card className='mt-4'>
							<CardHeader>
								<CardLabel icon='Today' iconColor='info'>
									<CardTitle>Today's Activity</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='text-center'>
									<div className='h3 text-primary'>{todayCheckIns.length}</div>
									<div className='text-muted'>Total Check-ins</div>
								</div>
								<hr />
								<div className='text-center'>
									<div className='h4 text-success'>
										{currentlyCheckedIn.length}
									</div>
									<div className='text-muted'>Currently Inside</div>
								</div>
								<hr />
								<div className='text-center'>
									<div className='h4 text-info'>
										{todayCheckIns.filter((c) => c.checkOutTime).length}
									</div>
									<div className='text-muted'>Completed Sessions</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Check-in Confirmation Modal */}
				<Modal
					setIsOpen={setShowCheckInModal}
					isOpen={showCheckInModal}
					titleId='checkInModal'
					size='md'>
					<ModalHeader setIsOpen={setShowCheckInModal}>
						<ModalTitle id='checkInModal'>Confirm Check-in</ModalTitle>
					</ModalHeader>
					<ModalBody>
						{selectedMember && (
							<div className='text-center'>
								<Avatar size={80} className='mb-3' />
								<h5>
									{selectedMember.personalInfo.firstName}{' '}
									{selectedMember.personalInfo.lastName}
								</h5>
								<p className='text-muted'>{selectedMember.membershipInfo.plan}</p>
								<div className='alert alert-info'>
									<div className='d-flex justify-content-between'>
										<span>Membership Type:</span>
										<strong>
											{selectedMember.membershipInfo.type === 'monthly'
												? 'Monthly'
												: 'Count-based'}
										</strong>
									</div>
									{selectedMember.membershipInfo.type === 'monthly' ? (
										<div className='d-flex justify-content-between'>
											<span>Expires:</span>
											<strong>
												{dayjs(
													selectedMember.membershipInfo.endDate,
												).format('DD/MM/YYYY')}
											</strong>
										</div>
									) : (
										<div className='d-flex justify-content-between'>
											<span>Remaining Visits:</span>
											<strong>
												{selectedMember.membershipInfo.remainingVisits}
											</strong>
										</div>
									)}
								</div>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button color='secondary' onClick={() => setShowCheckInModal(false)}>
							Cancel
						</Button>
						<Button
							color='success'
							icon='Login'
							onClick={() => selectedMember && handleCheckIn(selectedMember)}
							isDisable={processing}>
							{processing && <Spinner isSmall inButton />}
							Confirm Check-in
						</Button>
					</ModalFooter>
				</Modal>

				{/* Check-out Confirmation Modal */}
				<Modal
					setIsOpen={setShowCheckOutModal}
					isOpen={showCheckOutModal}
					titleId='checkOutModal'
					size='md'>
					<ModalHeader setIsOpen={setShowCheckOutModal}>
						<ModalTitle id='checkOutModal'>Confirm Check-out</ModalTitle>
					</ModalHeader>
					<ModalBody>
						{selectedMember && (
							<div className='text-center'>
								<Avatar size={80} className='mb-3' />
								<h5>
									{selectedMember.personalInfo.firstName}{' '}
									{selectedMember.personalInfo.lastName}
								</h5>
								{(() => {
									const checkin = currentlyCheckedIn.find(
										(c) => c.memberId === selectedMember.id,
									);
									const duration = checkin
										? dayjs().diff(dayjs(checkin.checkInTime), 'minutes')
										: 0;
									return (
										<div className='alert alert-success'>
											<div className='d-flex justify-content-between'>
												<span>Check-in Time:</span>
												<strong>
													{checkin
														? dayjs(checkin.checkInTime).format('HH:mm')
														: '-'}
												</strong>
											</div>
											<div className='d-flex justify-content-between'>
												<span>Duration:</span>
												<strong>{duration} minutes</strong>
											</div>
										</div>
									);
								})()}
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button color='secondary' onClick={() => setShowCheckOutModal(false)}>
							Cancel
						</Button>
						<Button
							color='warning'
							icon='Logout'
							onClick={() => {
								const checkin = currentlyCheckedIn.find(
									(c) => c.memberId === selectedMember?.id,
								);
								if (checkin) handleCheckOut(checkin.id);
							}}
							isDisable={processing}>
							{processing && <Spinner isSmall inButton />}
							Confirm Check-out
						</Button>
					</ModalFooter>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default CheckInPage;
