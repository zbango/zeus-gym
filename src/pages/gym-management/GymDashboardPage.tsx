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
import {
	mockDashboardStats,
	mockMembers,
	mockPayments,
	mockCheckIns,
	mockProducts,
} from '../../common/data/gymMockData';
import { IDashboardStats, ICheckIn, IPayment } from '../../types/gym-types';
import Spinner from '../../components/bootstrap/Spinner';
import classNames from 'classnames';
import { priceFormat } from '../../helpers/helpers';
import Avatar from '../../components/Avatar';

const GymDashboardPage = () => {
	console.log('🏋️ GymDashboardPage: Component rendered!');
	const { themeStatus, darkModeStatus } = useDarkMode();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);

	// Debug any unmounting
	useEffect(() => {
		console.log('🏋️ GymDashboardPage: Component mounted');
		return () => {
			console.log('🚨 GymDashboardPage: Component unmounting - something is causing this!');
		};
	}, []);
	const [stats, setStats] = useState<IDashboardStats | null>(null);
	const [recentCheckIns, setRecentCheckIns] = useState<ICheckIn[]>([]);
	const [pendingPayments, setPendingPayments] = useState<IPayment[]>([]);

	useEffect(() => {
		const loadDashboardData = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setStats(mockDashboardStats);
			setRecentCheckIns(mockCheckIns.slice(0, 5));
			setPendingPayments(mockPayments.filter((p) => p.status === 'partial'));
			setLoading(false);
		};

		loadDashboardData();
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'success';
			case 'expired':
				return 'danger';
			case 'suspended':
				return 'warning';
			default:
				return 'secondary';
		}
	};

	if (loading) {
		return (
			<PageWrapper title={t('Gym Dashboard')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading dashboard...')}</div>
						<div className='text-muted'>{t('Preparing your gym management data')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('Gym Dashboard')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='FitnessCenter' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Welcome to your gym management dashboard. Today: {{date}}', {
							date: dayjs().format('dddd, MMMM D, YYYY'),
						})}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color={themeStatus}
						icon='Refresh'
						onClick={() => window.location.reload()}>
						{t('Refresh Data')}
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				{/* Stats Cards Row */}
				<div className='row g-4 mb-4'>
					<div className='col-xl-3 col-md-6'>
						<Card stretch className='mb-0'>
							<CardBody>
								<div className='d-flex align-items-center'>
									<div className='flex-shrink-0'>
										<Icon icon='Group' size='3x' color='primary' />
									</div>
									<div className='flex-grow-1 ms-3'>
										<div className='fw-bold h4 mb-0'>{stats?.totalMembers}</div>
										<div className='text-muted'>{t('Total Members')}</div>
										<small className='text-success'>
											<Icon icon='TrendingUp' size='sm' className='me-1' />
											{t('{{count}} active', { count: stats?.activeMembers })}
										</small>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card stretch className='mb-0'>
							<CardBody>
								<div className='d-flex align-items-center'>
									<div className='flex-shrink-0'>
										<Icon icon='AttachMoney' size='3x' color='success' />
									</div>
									<div className='flex-grow-1 ms-3'>
										<div className='fw-bold h4 mb-0'>
											{priceFormat(stats?.monthlyRevenue || 0)}
										</div>
										<div className='text-muted'>{t('Monthly Revenue')}</div>
										<small className='text-info'>
											<Icon
												icon='AccountBalanceWallet'
												size='sm'
												className='me-1'
											/>
											{t('This month')}
										</small>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card stretch className='mb-0'>
							<CardBody>
								<div className='d-flex align-items-center'>
									<div className='flex-shrink-0'>
										<Icon icon='LoginTwoTone' size='3x' color='info' />
									</div>
									<div className='flex-grow-1 ms-3'>
										<div className='fw-bold h4 mb-0'>
											{stats?.dailyCheckIns}
										</div>
										<div className='text-muted'>{t("Today's Check-ins")}</div>
										<small className='text-primary'>
											<Icon icon='Today' size='sm' className='me-1' />
											{t('Currently active')}
										</small>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card stretch className='mb-0'>
							<CardBody>
								<div className='d-flex align-items-center'>
									<div className='flex-shrink-0'>
										<Icon icon='Warning' size='3x' color='warning' />
									</div>
									<div className='flex-grow-1 ms-3'>
										<div className='fw-bold h4 mb-0'>
											{stats?.pendingPayments}
										</div>
										<div className='text-muted'>{t('Pending Payments')}</div>
										<small className='text-warning'>
											<Icon icon='Schedule' size='sm' className='me-1' />
											{t('Requires attention')}
										</small>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Alerts Row */}
				<div className='row g-4 mb-4'>
					<div className='col-md-6'>
						<Card stretch className='mb-0'>
							<CardHeader>
								<CardLabel icon='Warning' iconColor='warning'>
									<CardTitle>{t('Alerts')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div
									className='alert alert-warning d-flex align-items-center'
									role='alert'>
									<Icon icon='Inventory' className='me-2' />
									<div>
										{t('{{count}} products are running low on stock', {
											count: stats?.lowStockProducts,
										})}
									</div>
								</div>
								<div
									className='alert alert-info d-flex align-items-center'
									role='alert'>
									<Icon icon='Schedule' className='me-2' />
									<div>
										{t('{{count}} memberships expire this week', {
											count: stats?.expiringMemberships,
										})}
									</div>
								</div>
								{pendingPayments.length > 0 && (
									<div
										className='alert alert-danger d-flex align-items-center'
										role='alert'>
										<Icon icon='Payment' className='me-2' />
										<div>
											{t('{{count}} members have pending payments', {
												count: pendingPayments.length,
											})}
										</div>
									</div>
								)}
							</CardBody>
						</Card>
					</div>
					<div className='col-md-6'>
						<Card stretch className='mb-0'>
							<CardHeader>
								<CardLabel icon='TrendingUp' iconColor='success'>
									<CardTitle>{t('Quick Stats')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-6'>
										<div className='bg-light rounded p-3 text-center'>
											<Icon
												icon='Store'
												size='2x'
												color='primary'
												className='mb-2'
											/>
											<div className='fw-bold'>15</div>
											<small className='text-muted'>{t('Products')}</small>
										</div>
									</div>
									<div className='col-6'>
										<div className='bg-light rounded p-3 text-center'>
											<Icon
												icon='Receipt'
												size='2x'
												color='success'
												className='mb-2'
											/>
											<div className='fw-bold'>8</div>
											<small className='text-muted'>{t('Sales Today')}</small>
										</div>
									</div>
									<div className='col-6'>
										<div className='bg-light rounded p-3 text-center'>
											<Icon
												icon='Schedule'
												size='2x'
												color='warning'
												className='mb-2'
											/>
											<div className='fw-bold'>3</div>
											<small className='text-muted'>
												{t('Renewals Due')}
											</small>
										</div>
									</div>
									<div className='col-6'>
										<div className='bg-light rounded p-3 text-center'>
											<Icon
												icon='PersonAdd'
												size='2x'
												color='info'
												className='mb-2'
											/>
											<div className='fw-bold'>2</div>
											<small className='text-muted'>{t('New Members')}</small>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Recent Activity Row */}
				<div className='row g-4'>
					<div className='col-md-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='LoginTwoTone' iconColor='info'>
									<CardTitle>{t('Recent Check-ins')}</CardTitle>
								</CardLabel>
								<CardActions>
									<Button
										color='info'
										isLight
										size='sm'
										icon='Visibility'
										tag='a'
										to='/gym-management/checkin'>
										{t('View All')}
									</Button>
								</CardActions>
							</CardHeader>
							<CardBody>
								<div className='table-responsive'>
									<table className='table table-modern table-hover'>
										<thead>
											<tr>
												<th>{t('Member')}</th>
												<th>{t('Time')}</th>
												<th>{t('Status')}</th>
											</tr>
										</thead>
										<tbody>
											{recentCheckIns.map((checkin) => (
												<tr key={checkin.id}>
													<td>
														<div className='d-flex align-items-center'>
															<Avatar size={32} className='me-2' />
															<div>
																<div className='fw-bold'>
																	{checkin.memberName}
																</div>
																<small className='text-muted'>
																	{checkin.membershipType ===
																	'monthly'
																		? t('Monthly')
																		: t('Count-based')}
																</small>
															</div>
														</div>
													</td>
													<td>
														<div>
															<div>
																{dayjs(checkin.checkInTime).format(
																	'HH:mm',
																)}
															</div>
															<small className='text-muted'>
																{dayjs(checkin.checkInTime).format(
																	'DD/MM',
																)}
															</small>
														</div>
													</td>
													<td>
														{checkin.checkOutTime ? (
															<span className='badge bg-success'>
																<Icon
																	icon='CheckCircle'
																	size='sm'
																	className='me-1'
																/>
																{t('Complete')}
															</span>
														) : (
															<span className='badge bg-info'>
																<Icon
																	icon='FitnessCenter'
																	size='sm'
																	className='me-1'
																/>
																{t('Training')}
															</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-md-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='Payment' iconColor='warning'>
									<CardTitle>{t('Pending Payments')}</CardTitle>
								</CardLabel>
								<CardActions>
									<Button
										color='warning'
										isLight
										size='sm'
										icon='Visibility'
										tag='a'
										to='/gym-management/memberships/payments'>
										{t('View All')}
									</Button>
								</CardActions>
							</CardHeader>
							<CardBody>
								{pendingPayments.length === 0 ? (
									<div className='text-center py-4'>
										<Icon
											icon='CheckCircle'
											size='3x'
											color='success'
											className='mb-2'
										/>
										<div className='text-muted'>
											{t('All payments are up to date!')}
										</div>
									</div>
								) : (
									<div className='table-responsive'>
										<table className='table table-modern table-hover'>
											<thead>
												<tr>
													<th>{t('Member')}</th>
													<th>{t('Amount')}</th>
													<th>{t('Due Date')}</th>
												</tr>
											</thead>
											<tbody>
												{pendingPayments.map((payment) => {
													const member = mockMembers.find(
														(m) => m.id === payment.memberId,
													);
													return (
														<tr key={payment.id}>
															<td>
																<div>
																	<div className='fw-bold'>
																		{
																			member?.personalInfo
																				.firstName
																		}{' '}
																		{
																			member?.personalInfo
																				.lastName
																		}
																	</div>
																	<small className='text-muted'>
																		{member?.personalInfo.email}
																	</small>
																</div>
															</td>
															<td>
																<div>
																	<div className='text-danger fw-bold'>
																		{priceFormat(
																			payment.remainingAmount,
																		)}
																	</div>
																	<small className='text-muted'>
																		{t('of {{amount}}', {
																			amount: priceFormat(
																				payment.totalAmount,
																			),
																		})}
																	</small>
																</div>
															</td>
															<td>
																<span
																	className={classNames('badge', {
																		'bg-danger': dayjs(
																			payment.dueDate,
																		).isBefore(dayjs(), 'day'),
																		'bg-warning': dayjs(
																			payment.dueDate,
																		).isSame(dayjs(), 'day'),
																		'bg-info': dayjs(
																			payment.dueDate,
																		).isAfter(dayjs(), 'day'),
																	})}>
																	{dayjs(payment.dueDate).format(
																		'DD/MM/YYYY',
																	)}
																</span>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default GymDashboardPage;
