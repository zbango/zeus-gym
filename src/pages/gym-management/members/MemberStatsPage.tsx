import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Avatar from '../../../components/Avatar';
import Icon from '../../../components/icon/Icon';
import Spinner from '../../../components/bootstrap/Spinner';
import { useGetMemberByIdQuery } from '../../../store/api/membersApi';
import { Member } from '../../../types/member.types';

const MemberStatsPage = () => {
	const { t } = useTranslation();
	const { memberId } = useParams<{ memberId: string }>();
	const navigate = useNavigate();
	const [member, setMember] = useState<Member | null>(null);

	// Get member data
	const {
		data: memberData,
		isLoading,
		error,
	} = useGetMemberByIdQuery(memberId!, {
		skip: !memberId,
	});

	useEffect(() => {
		if (memberData) {
			setMember(memberData);
		}
	}, [memberData]);

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

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return 'CheckCircle';
			case 'expired':
				return 'Cancel';
			case 'suspended':
				return 'Pause';
			case 'inactive':
				return 'RemoveCircle';
			default:
				return 'Help';
		}
	};

	if (isLoading) {
		return (
			<PageWrapper title={t('Loading...')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '100vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading member data...')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	if (error || !member) {
		return (
			<PageWrapper title={t('Member Not Found')}>
				<Page container='fluid'>
					<div
						className='d-flex justify-content-center align-items-center'
						style={{ minHeight: '100vh' }}>
						<div className='text-center'>
							<Icon icon='PersonOff' size='4x' className='text-muted mb-4' />
							<h2 className='mb-3'>{t('Member Not Found')}</h2>
							<p className='text-muted mb-4'>
								{t(
									'The member you are looking for does not exist or has been removed.',
								)}
							</p>
							<button
								className='btn btn-primary'
								onClick={() => (window.location.href = '/')}>
								{t('Go to Home')}
							</button>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper
			title={`${member.personalInfo.firstName} ${member.personalInfo.lastName} - Stats`}>
			<Page container='fluid'>
				{/* Header Section */}
				<div className='row mb-4'>
					<div className='col-12'>
						<Card>
							<CardBody>
								<div className='d-flex align-items-center gap-4'>
									<Avatar size={100} className='flex-shrink-0' src='' />
									<div className='flex-grow-1'>
										<h1 className='mb-2'>
											{member.personalInfo.firstName}{' '}
											{member.personalInfo.lastName}
										</h1>
										<p className='text-muted mb-3'>
											{member.personalInfo.email}
										</p>
										<div className='d-flex align-items-center gap-3'>
											<div className='d-flex align-items-center gap-2'>
												<Icon
													icon={getStatusIcon(
														member.membershipInfo.status,
													)}
													color={getStatusColor(
														member.membershipInfo.status,
													)}
													size='sm'
												/>
												<span
													className={`text-${getStatusColor(member.membershipInfo.status)} fw-bold`}>
													{t(
														member.membershipInfo.status
															.charAt(0)
															.toUpperCase() +
															member.membershipInfo.status.slice(1),
													)}
												</span>
											</div>
											<div className='text-muted'>
												{t('Member since')}:{' '}
												{dayjs(member.registrationDate).format('MMMM YYYY')}
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Stats Grid */}
				<div className='row g-4'>
					{/* Membership Information */}
					<div className='col-lg-6'>
						<Card>
							<CardHeader>
								<CardLabel icon='CardMembership' iconColor='info'>
									<CardTitle>{t('Membership Information')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-6'>
										<small className='text-muted'>{t('Plan')}</small>
										<div className='fw-bold h5'>
											{member.membershipInfo.plan}
										</div>
									</div>
									<div className='col-6'>
										<small className='text-muted'>{t('Type')}</small>
										<div>
											{member.membershipInfo.type === 'monthly'
												? t('Monthly')
												: t('Count-based')}
										</div>
									</div>
									<div className='col-6'>
										<small className='text-muted'>{t('Start Date')}</small>
										<div>
											{dayjs(member.membershipInfo.startDate).format(
												'DD/MM/YYYY',
											)}
										</div>
									</div>
									{member.membershipInfo.endDate && (
										<div className='col-6'>
											<small className='text-muted'>{t('End Date')}</small>
											<div>
												{dayjs(member.membershipInfo.endDate).format(
													'DD/MM/YYYY',
												)}
											</div>
										</div>
									)}
									{member.membershipInfo.remainingVisits && (
										<div className='col-12'>
											<small className='text-muted'>
												{t('Remaining Visits')}
											</small>
											<div className='fw-bold h4 text-primary'>
												{member.membershipInfo.remainingVisits}
											</div>
										</div>
									)}
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Health Stats */}
					<div className='col-lg-6'>
						<Card>
							<CardHeader>
								<CardLabel icon='FitnessCenter' iconColor='success'>
									<CardTitle>{t('Health Stats')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-4'>
										<small className='text-muted'>{t('Age')}</small>
										<div className='fw-bold h4'>{member.healthInfo.age}</div>
									</div>
									<div className='col-4'>
										<small className='text-muted'>{t('Height')}</small>
										<div className='fw-bold h4'>
											{member.healthInfo.height} cm
										</div>
									</div>
									<div className='col-4'>
										<small className='text-muted'>{t('Weight')}</small>
										<div className='fw-bold h4'>
											{member.healthInfo.currentWeight} kg
										</div>
									</div>
									{member.healthInfo.goals && (
										<div className='col-12'>
											<small className='text-muted'>
												{t('Fitness Goals')}
											</small>
											<div className='mt-1'>{member.healthInfo.goals}</div>
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
								<CardLabel icon='TrendingUp' iconColor='primary'>
									<CardTitle>{t('Progress Tracking')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{member.progressTracking.measurements.length > 0 ? (
									<div className='table-responsive'>
										<table className='table table-hover'>
											<thead>
												<tr>
													<th>{t('Date')}</th>
													<th>{t('Weight')}</th>
													<th>{t('Body Fat')}</th>
													<th>{t('Chest')}</th>
													<th>{t('Waist')}</th>
													<th>{t('Notes')}</th>
												</tr>
											</thead>
											<tbody>
												{member.progressTracking.measurements
													.sort(
														(a, b) =>
															new Date(b.date).getTime() -
															new Date(a.date).getTime(),
													)
													.map((measurement, index) => (
														<tr key={index}>
															<td>
																{dayjs(measurement.date).format(
																	'DD/MM/YYYY',
																)}
															</td>
															<td className='fw-bold'>
																{measurement.weight} kg
															</td>
															<td>
																{measurement.bodyFat
																	? `${measurement.bodyFat}%`
																	: '-'}
															</td>
															<td>
																{measurement.chest
																	? `${measurement.chest} cm`
																	: '-'}
															</td>
															<td>
																{measurement.waist
																	? `${measurement.waist} cm`
																	: '-'}
															</td>
															<td className='text-muted'>
																{measurement.notes || '-'}
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
											className='text-muted mb-3'
										/>
										<p className='text-muted'>
											{t('No progress measurements recorded yet.')}
										</p>
									</div>
								)}
							</CardBody>
						</Card>
					</div>

					{/* Contact Information */}
					<div className='col-lg-6'>
						<Card>
							<CardHeader>
								<CardLabel icon='Person' iconColor='secondary'>
									<CardTitle>{t('Contact Information')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-12'>
										<small className='text-muted'>{t('Email')}</small>
										<div>{member.personalInfo.email}</div>
									</div>
									<div className='col-12'>
										<small className='text-muted'>{t('Phone')}</small>
										<div>{member.personalInfo.phone}</div>
									</div>
									<div className='col-12'>
										<small className='text-muted'>{t('Address')}</small>
										<div>{member.personalInfo.address || '-'}</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Emergency Contact */}
					<div className='col-lg-6'>
						<Card>
							<CardHeader>
								<CardLabel icon='Emergency' iconColor='danger'>
									<CardTitle>{t('Emergency Contact')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-12'>
										<small className='text-muted'>{t('Name')}</small>
										<div className='fw-bold'>
											{member.personalInfo.emergencyContact.name}
										</div>
									</div>
									<div className='col-12'>
										<small className='text-muted'>{t('Phone')}</small>
										<div>{member.personalInfo.emergencyContact.phone}</div>
									</div>
									<div className='col-12'>
										<small className='text-muted'>{t('Relationship')}</small>
										<div>
											{member.personalInfo.emergencyContact.relationship}
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Footer */}
				<div className='row mt-4'>
					<div className='col-12'>
						<Card>
							<CardBody className='text-center'>
								<p className='text-muted mb-0'>
									{t('Generated on')}: {dayjs().format('DD/MM/YYYY HH:mm')}
								</p>
								<small className='text-muted'>
									{t('This information is for personal use only')}
								</small>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default MemberStatsPage;
