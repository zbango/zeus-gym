import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
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
import useDarkMode from '../../../hooks/useDarkMode';
import Avatar from '../../../components/Avatar';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../contexts/authContext';

const GymSettingsPage = () => {
	const { t } = useTranslation();
	const { gymUser: user, gymLogout: logout, isGymAdmin: isAdmin } = useContext(AuthContext);
	const { themeStatus } = useDarkMode();
	const navigate = useNavigate();

	const handleLogout = () => {
		if (confirm(t('Are you sure you want to logout?'))) {
			logout();
			navigate('/auth-pages/login');
		}
	};

	if (!user) {
		return (
			<PageWrapper title={t('Settings')}>
				<Page container='fluid'>
					<div className='text-center py-5'>
						<Icon icon='Error' size='3x' color='danger' className='mb-3' />
						<div className='h4'>{t('User not found')}</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper title={t('Settings')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Settings' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('System settings and user account information')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='danger' icon='Logout' onClick={handleLogout}>
						{t('Logout')}
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
				<div className='row g-4'>
					{/* User Profile Card */}
					<div className='col-lg-4'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='Person' iconColor='primary'>
									<CardTitle>{t('User Profile')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody className='text-center'>
								<Avatar
									src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
									size={120}
									className='mb-3'
								/>
								<div className='h4 mb-2'>{user.name}</div>
								<div className='text-muted mb-3'>@{user.username}</div>
								<div className='mb-3'>
									<span
										className={`badge bg-${isAdmin ? 'danger' : 'info'} fs-6`}>
										{user?.role?.toUpperCase()}
									</span>
								</div>
								<div className='text-muted mb-2'>
									<Icon icon='Email' className='me-2' />
									{user.email}
								</div>
								<div className='text-muted mb-2'>
									<Icon icon='CalendarToday' className='me-2' />
									{t('Joined {{date}}', {
										date: dayjs(user.createdAt).format('MMM DD, YYYY'),
									})}
								</div>
								{user.lastLogin && (
									<div className='text-muted'>
										<Icon icon='Login' className='me-2' />
										{t('Last login: {{date}}', {
											date: dayjs(user.lastLogin).format(
												'MMM DD, YYYY HH:mm',
											),
										})}
									</div>
								)}
							</CardBody>
						</Card>
					</div>

					{/* User Permissions */}
					<div className='col-lg-8'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='Security' iconColor='info'>
									<CardTitle>{t('Permissions & Access')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-12'>
										<div className='d-flex align-items-center mb-3'>
											<Icon
												icon='AdminPanelSettings'
												size='2x'
												color='primary'
												className='me-3'
											/>
											<div>
												<div className='h5 mb-1'>
													{t('Role: {{role}}', {
														role:
															user.role.charAt(0).toUpperCase() +
															user.role.slice(1),
													})}
												</div>
												<div className='text-muted'>
													{isAdmin
														? t(
																'Full administrative access to all system features',
															)
														: t(
																'Staff member with limited access based on assigned permissions',
															)}
												</div>
											</div>
										</div>
									</div>

									<div className='col-12'>
										<div className='h6 mb-3'>{t('Available Permissions:')}</div>
										{user.permissions.includes('all') ? (
											<div className='alert alert-warning'>
												<Icon icon='Star' className='me-2' />
												<strong>{t('All Permissions')}</strong> -{' '}
												{t('Full access to all system features')}
											</div>
										) : (
											<div className='row g-2'>
												{user.permissions.map((permission) => (
													<div key={permission} className='col-md-6'>
														<div className='d-flex align-items-center p-2 bg-light rounded'>
															<Icon
																icon='CheckCircle'
																color='success'
																className='me-2'
															/>
															<span className='small'>
																{permission
																	.replace(/\./g, ' ')
																	.replace(/\b\w/g, (l) =>
																		l.toUpperCase(),
																	)}
															</span>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* System Information */}
					<div className='col-12'>
						<Card>
							<CardHeader>
								<CardLabel icon='Info' iconColor='success'>
									<CardTitle>{t('System Information')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-4'>
									<div className='col-md-3'>
										<div className='text-center'>
											<Icon
												icon='FitnessCenter'
												size='2x'
												color='primary'
												className='mb-2'
											/>
											<div className='h6'>{t('Gym Management')}</div>
											<div className='text-muted small'>
												{t('System v1.0.0')}
											</div>
										</div>
									</div>
									<div className='col-md-3'>
										<div className='text-center'>
											<Icon
												icon='Language'
												size='2x'
												color='info'
												className='mb-2'
											/>
											<div className='h6'>{t('Ecuador')}</div>
											<div className='text-muted small'>
												{t('USD Currency')}
											</div>
										</div>
									</div>
									<div className='col-md-3'>
										<div className='text-center'>
											<Icon
												icon='Schedule'
												size='2x'
												color='warning'
												className='mb-2'
											/>
											<div className='h6'>{t('Current Time')}</div>
											<div className='text-muted small'>
												{dayjs().format('HH:mm:ss')}
											</div>
										</div>
									</div>
									<div className='col-md-3'>
										<div className='text-center'>
											<Icon
												icon='Today'
												size='2x'
												color='success'
												className='mb-2'
											/>
											<div className='h6'>{t('Today')}</div>
											<div className='text-muted small'>
												{dayjs().format('MMM DD, YYYY')}
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Quick Actions */}
					<div className='col-12'>
						<Card>
							<CardHeader>
								<CardLabel icon='Speed' iconColor='warning'>
									<CardTitle>{t('Quick Actions')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								<div className='row g-3'>
									<div className='col-md-4'>
										<Button
											color='primary'
											size='lg'
											className='w-100'
											icon='Dashboard'
											tag='a'
											to='/gym-management/dashboard'>
											{t('Go to Dashboard')}
										</Button>
									</div>
									<div className='col-md-4'>
										<Button
											color='success'
											size='lg'
											className='w-100'
											icon='PersonAdd'
											tag='a'
											to='/gym-management/members/add'>
											{t('Add New Member')}
										</Button>
									</div>
									<div className='col-md-4'>
										<Button
											color='info'
											size='lg'
											className='w-100'
											icon='PointOfSale'
											tag='a'
											to='/gym-management/store/sales'>
											{t('New Sale')}
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Security Warning */}
					<div className='col-12'>
						<div className='alert alert-info'>
							<Icon icon='Security' className='me-2' />
							<strong>{t('Security Notice:')}</strong>{' '}
							{t(
								'Always logout when using shared computers. Your session will automatically expire after extended periods of inactivity.',
							)}
						</div>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default GymSettingsPage;
