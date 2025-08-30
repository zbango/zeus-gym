import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
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
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Checks from '../../../components/bootstrap/forms/Checks';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockGymUsers } from '../../../common/data/gymMockData';
import { IGymUser } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import classNames from 'classnames';
import Alert from '../../../components/bootstrap/Alert';
import Avatar from '../../../components/Avatar';
import AuthContext from '../../../contexts/authContext';

const ALL_PERMISSIONS = [
	'users.create',
	'users.edit',
	'users.delete',
	'members.create',
	'members.edit',
	'members.delete',
	'payments.create',
	'payments.edit',
	'store.create',
	'store.edit',
	'reports.view',
	'renewals.create',
];

const UsersManagementPage = () => {
	const { t } = useTranslation();
	const { user: currentUser, hasGymPermission: hasPermission } = useContext(AuthContext);
	const { themeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<IGymUser[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<IGymUser | null>(null);
	const [saving, setSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	// Check if current user has permission to manage users
	useEffect(() => {
		if (!hasPermission('users.create') && !hasPermission('all')) {
			setAlert({
				type: 'danger',
				message: t('You do not have permission to access user management.'),
			});
		}
	}, [hasPermission, t]);

	useEffect(() => {
		const loadUsers = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setUsers(mockGymUsers);
			setLoading(false);
		};

		loadUsers();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(users);

	// Filter users based on search
	const filteredUsers = items.filter(
		(user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.role.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const formik = useFormik({
		initialValues: {
			name: '',
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			role: 'staff' as 'admin' | 'staff',
			permissions: [] as string[],
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.name) errors.name = t('Name is required');
			if (!values.username) errors.username = t('Username is required');
			if (!values.email) errors.email = t('Email is required');

			if (!editingUser) {
				if (!values.password) errors.password = t('Password is required');
				if (!values.confirmPassword)
					errors.confirmPassword = t('Confirm password is required');
				if (
					values.password &&
					values.confirmPassword &&
					values.password !== values.confirmPassword
				) {
					errors.confirmPassword = t('Passwords do not match');
				}
			}

			if (values.password && values.password.length < 6) {
				errors.password = t('Password must be at least 6 characters');
			}

			// Check if username is unique
			const usernameExists = users.some(
				(user) => user.username === values.username && user.id !== editingUser?.id,
			);
			if (usernameExists) {
				errors.username = t('Username already exists');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const userData: IGymUser = {
					id: editingUser ? editingUser.id : `user-${Date.now()}`,
					name: values.name,
					username: values.username,
					email: values.email,
					role: values.role,
					permissions: values.role === 'admin' ? ['all'] : values.permissions,
					password: values.password || editingUser?.password || '',
					isActive: editingUser ? editingUser.isActive : true,
					lastLogin: editingUser ? editingUser.lastLogin : null,
					createdAt: editingUser
						? editingUser.createdAt
						: dayjs().format('YYYY-MM-DD HH:mm:ss'),
				};

				if (editingUser) {
					setUsers((prev) =>
						prev.map((user) => (user.id === editingUser.id ? userData : user)),
					);
					setAlert({
						type: 'success',
						message: t('User "{{name}}" has been updated successfully!', {
							name: values.name,
						}),
					});
				} else {
					setUsers((prev) => [userData, ...prev]);
					setAlert({
						type: 'success',
						message: t('User "{{name}}" has been created successfully!', {
							name: values.name,
						}),
					});
				}

				resetForm();
				setShowModal(false);
				setEditingUser(null);
			} catch {
				setAlert({
					type: 'danger',
					message: t('An error occurred while saving the user. Please try again.'),
				});
			} finally {
				setSaving(false);
			}
		},
	});

	const handleEditUser = (user: IGymUser) => {
		setEditingUser(user);
		formik.setValues({
			name: user.name,
			username: user.username,
			email: user.email,
			password: '',
			confirmPassword: '',
			role: user.role,
			permissions: user.permissions.filter((p) => p !== 'all'),
		});
		setShowModal(true);
	};

	const handleAddUser = () => {
		setEditingUser(null);
		formik.resetForm();
		setShowModal(true);
	};

	const handleToggleUserStatus = async (userId: string) => {
		if (userId === (currentUser as any)?.id) {
			setAlert({
				type: 'warning',
				message: t('You cannot deactivate your own account.'),
			});
			return;
		}

		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setUsers((prev) =>
			prev.map((user) => (user.id === userId ? { ...user, isActive: !user.isActive } : user)),
		);
		setSaving(false);
	};

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (userId === (currentUser as any)?.id) {
			setAlert({
				type: 'warning',
				message: t('You cannot delete your own account.'),
			});
			return;
		}

		if (!confirm(t('Are you sure you want to delete user "{{name}}"?', { name: userName })))
			return;

		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setUsers((prev) => prev.filter((user) => user.id !== userId));
		setAlert({
			type: 'success',
			message: t('User "{{name}}" has been deleted successfully!', { name: userName }),
		});
		setSaving(false);
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
			<PageWrapper title={t('User Management')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading users...')}</div>
						<div className='text-muted'>{t('Please wait')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	if (!hasPermission('users.create') && !hasPermission('all')) {
		return (
			<PageWrapper title={t('User Management')}>
				<Page container='fluid'>
					<Alert color='danger' className='text-center'>
						<Icon icon='Block' size='2x' className='mb-3' />
						<div className='h4'>{t('Access Denied')}</div>
						<div>{t('You do not have permission to access user management.')}</div>
					</Alert>
				</Page>
			</PageWrapper>
		);
	}

	const adminUsers = users.filter((u) => u.role === 'admin');
	const staffUsers = users.filter((u) => u.role === 'staff');
	const activeUsers = users.filter((u) => u.isActive);

	return (
		<PageWrapper title={t('User Management')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='SupervisorAccount' className='me-2' size='2x' />
					<span className='text-muted'>{t('Manage admin and staff user accounts')}</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					{hasPermission('users.create') && (
						<Button color='success' icon='PersonAdd' onClick={handleAddUser}>
							{t('Add User')}
						</Button>
					)}
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

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='SupervisorAccount'
									size='2x'
									color='primary'
									className='mb-2'
								/>
								<div className='h4'>{users.length}</div>
								<div className='text-muted'>{t('Total Users')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='AdminPanelSettings'
									size='2x'
									color='danger'
									className='mb-2'
								/>
								<div className='h4'>{adminUsers.length}</div>
								<div className='text-muted'>{t('Administrators')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Person' size='2x' color='info' className='mb-2' />
								<div className='h4'>{staffUsers.length}</div>
								<div className='text-muted'>{t('Staff Members')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='CheckCircle'
									size='2x'
									color='success'
									className='mb-2'
								/>
								<div className='h4'>{activeUsers.length}</div>
								<div className='text-muted'>{t('Active Users')}</div>
							</CardBody>
						</Card>
					</div>
				</div>

				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='SupervisorAccount' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('System Users')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search users...')}
								value={searchTerm}
								onChange={(e: any) => setSearchTerm(e.target.value)}
								className='me-2'
								style={{ width: '250px' }}
							/>
						</CardActions>
					</CardHeader>
					<CardBody className='table-responsive' isScrollable>
						<table className='table table-modern table-hover'>
							<thead>
								<tr>
									<th>{t('User')}</th>
									<th
										onClick={() => requestSort('role')}
										className='cursor-pointer text-decoration-underline'>
										{t('Role')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('role')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Permissions')}</th>
									<th>{t('Status')}</th>
									<th>{t('Last Login')}</th>
									<th>{t('Created')}</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(filteredUsers, currentPage, perPage).map((user) => (
									<tr key={user.id}>
										<td>
											<div className='d-flex align-items-center'>
												<Avatar
													src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
													size={40}
													className='me-3'
												/>
												<div>
													<div className='fw-bold'>{user.name}</div>
													<div className='small text-muted'>
														@{user.username} • {user.email}
													</div>
												</div>
											</div>
										</td>
										<td>
											<span
												className={classNames('badge', {
													'bg-danger': user.role === 'admin',
													'bg-info': user.role === 'staff',
												})}>
												{user.role === 'admin' ? t('ADMIN') : t('STAFF')}
											</span>
										</td>
										<td>
											<div className='small'>
												{user.permissions.includes('all') ? (
													<span className='badge bg-warning'>
														{t('All Permissions')}
													</span>
												) : (
													<div>
														{user.permissions
															.slice(0, 2)
															.map((perm: string) => (
																<span
																	key={perm}
																	className='badge bg-light text-dark me-1 mb-1'>
																	{perm
																		.replace(/\./g, ' ')
																		.replace(/\b\w/g, (l) =>
																			l.toUpperCase(),
																		)}
																</span>
															))}
														{user.permissions.length > 2 && (
															<span className='text-muted'>
																{t('+{{count}} more', {
																	count:
																		user.permissions.length - 2,
																})}
															</span>
														)}
													</div>
												)}
											</div>
										</td>
										<td>
											<span
												className={`badge bg-${
													user.isActive ? 'success' : 'secondary'
												}`}>
												{user.isActive ? t('Active') : t('Inactive')}
											</span>
										</td>
										<td>
											<div className='text-muted small'>
												{user.lastLogin ? (
													<>
														{dayjs(user.lastLogin).format('DD/MM/YYYY')}
														<br />
														{dayjs(user.lastLogin).format('HH:mm')}
													</>
												) : (
													t('Never')
												)}
											</div>
										</td>
										<td>
											<div className='text-muted small'>
												{dayjs(user.createdAt).format('DD/MM/YYYY')}
											</div>
										</td>
										<td>
											<div className='d-flex gap-1'>
												{hasPermission('users.edit') && (
													<Button
														color='info'
														size='sm'
														icon='Edit'
														isLight
														onClick={() => handleEditUser(user)}>
														{t('Edit')}
													</Button>
												)}
												{hasPermission('users.edit') &&
													user.id !== (currentUser as any)?.id && (
														<Button
															color={
																user.isActive
																	? 'warning'
																	: 'success'
															}
															size='sm'
															icon={
																user.isActive
																	? 'Block'
																	: 'CheckCircle'
															}
															isLight
															onClick={() =>
																handleToggleUserStatus(user.id)
															}
															isDisable={saving}>
															{user.isActive
																? t('Deactivate')
																: t('Activate')}
														</Button>
													)}
												{hasPermission('users.delete') &&
													user.id !== (currentUser as any)?.id && (
														<Button
															color='danger'
															size='sm'
															icon='Delete'
															isLight
															onClick={() =>
																handleDeleteUser(user.id, user.name)
															}
															isDisable={saving}>
															{t('Delete')}
														</Button>
													)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardBody>
					<PaginationButtons
						data={filteredUsers}
						label='users'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* Add/Edit User Modal */}
				<Modal
					setIsOpen={setShowModal}
					isOpen={showModal}
					titleId='userModal'
					size='lg'
					isScrollable>
					<ModalHeader setIsOpen={setShowModal}>
						<ModalTitle id='userModal'>
							{editingUser ? t('Edit User') : t('Add New User')}
						</ModalTitle>
					</ModalHeader>
					<form onSubmit={formik.handleSubmit}>
						<ModalBody>
							<div className='row g-3'>
								<div className='col-md-6'>
									<FormGroup id='name' label={t('Full Name')}>
										<Input
											name='name'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.name}
											placeholder={t('e.g., Juan Pérez')}
											isValid={formik.touched.name && !formik.errors.name}
											isTouched={formik.touched.name && !!formik.errors.name}
											invalidFeedback={formik.errors.name}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='username' label={t('Username')}>
										<Input
											name='username'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.username}
											placeholder={t('e.g., jperez')}
											isValid={
												formik.touched.username && !formik.errors.username
											}
											isTouched={
												formik.touched.username && !!formik.errors.username
											}
											invalidFeedback={formik.errors.username}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='email' label={t('Email Address')}>
										<Input
											type='email'
											name='email'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.email}
											placeholder='juan@email.com'
											isValid={formik.touched.email && !formik.errors.email}
											isTouched={
												formik.touched.email && !!formik.errors.email
											}
											invalidFeedback={formik.errors.email}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup id='role' label={t('Role')}>
										<Select
											ariaLabel={t('Select role')}
											name='role'
											onChange={formik.handleChange}
											value={formik.values.role}>
											<Option value='staff'>{t('Staff')}</Option>
											<Option value='admin'>{t('Administrator')}</Option>
										</Select>
									</FormGroup>
								</div>

								{!editingUser && (
									<>
										<div className='col-md-6'>
											<FormGroup id='password' label={t('Password')}>
												<Input
													type='password'
													name='password'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.password}
													placeholder={t('Enter password')}
													isValid={
														formik.touched.password &&
														!formik.errors.password
													}
													isTouched={
														formik.touched.password &&
														!!formik.errors.password
													}
													invalidFeedback={formik.errors.password}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												id='confirmPassword'
												label={t('Confirm Password')}>
												<Input
													type='password'
													name='confirmPassword'
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.confirmPassword}
													placeholder={t('Confirm password')}
													isValid={
														formik.touched.confirmPassword &&
														!formik.errors.confirmPassword
													}
													isTouched={
														formik.touched.confirmPassword &&
														!!formik.errors.confirmPassword
													}
													invalidFeedback={formik.errors.confirmPassword}
												/>
											</FormGroup>
										</div>
									</>
								)}

								{formik.values.role === 'staff' && (
									<div className='col-12'>
										<FormGroup id='permissions' label={t('Permissions')}>
											<div className='row g-2'>
												{ALL_PERMISSIONS.map((permission) => (
													<div key={permission} className='col-md-6'>
														<Checks
															type='checkbox'
															id={permission}
															label={permission
																.replace(/\./g, ' ')
																.replace(/\b\w/g, (l) =>
																	l.toUpperCase(),
																)}
															name='permissions'
															value={permission}
															onChange={formik.handleChange}
															checked={formik.values.permissions.includes(
																permission,
															)}
														/>
													</div>
												))}
											</div>
										</FormGroup>
									</div>
								)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color='secondary' onClick={() => setShowModal(false)}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='primary'
								icon={editingUser ? 'Save' : 'PersonAdd'}
								isDisable={!formik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{editingUser ? t('Update User') : t('Create User')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default UsersManagementPage;
