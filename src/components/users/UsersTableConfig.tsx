import React from 'react';
import { TableColumn } from '../../types/member.types';
import { IGymUser } from '../../types/gym-types';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { toast } from 'react-toastify';
import Button from '../bootstrap/Button';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../bootstrap/Dropdown';
import Icon from '../icon/Icon';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import { useDeleteUserMutation, useToggleUserStatusMutation } from '../../store/api/usersApi';

export const useUsersTableColumns = (
	onEditUser?: (user: IGymUser) => void,
	hasPermission?: (permission: string) => boolean,
	currentUserId?: string,
): TableColumn<IGymUser>[] => {
	const { t } = useTranslation();
	const { darkModeStatus } = useDarkMode();
	const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
	const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

	const handleDeleteUser = async (user: IGymUser) => {
		try {
			await deleteUser(user.username).unwrap();
			toast.success(
				t('User "{{name}}" has been deleted successfully!', {
					name: user.fullName,
				}),
			);
		} catch (error) {
			toast.error(t('Failed to delete user. Please try again.'));
			console.error('Delete user error:', error);
		}
	};

	const handleToggleUserStatus = async (user: IGymUser) => {
		try {
			await toggleUserStatus({
				username: user.username,
				status: user.status === 'active' ? 'inactive' : 'active',
			}).unwrap();
			toast.success(t('User status updated successfully!'));
		} catch (error) {
			toast.error(t('Failed to update user status. Please try again.'));
			console.error('Toggle user status error:', error);
		}
	};

	return [
		{
			key: 'user',
			title: t('User'),
			dataIndex: 'name',
			sortable: true,
			render: (_, record) => (
				<div className='d-flex align-items-center'>
					<div>
						<div className='fw-bold'>{record.fullName}</div>
						<div className='small text-muted'>
							@{record.username} • {record.email}
						</div>
					</div>
				</div>
			),
		},
		{
			key: 'role',
			title: t('Role'),
			dataIndex: 'role',
			sortable: true,
			render: (_, record) => (
				<span
					className={classNames('badge', {
						'bg-danger': record.role === 'admin',
						'bg-info': record.role === 'staff',
					})}>
					{record.role === 'admin' ? t('ADMIN') : t('STAFF')}
				</span>
			),
		},
		{
			key: 'status',
			title: t('Status'),
			dataIndex: 'status',
			sortable: true,
			render: (_, record) => (
				<span
					className={`badge bg-${record.status === 'active' ? 'success' : 'secondary'}`}>
					{record.status === 'active' ? t('Active') : t('Inactive')}
				</span>
			),
		},
		{
			key: 'lastLogin',
			title: t('Last Login'),
			dataIndex: 'lastLogin',
			render: (_, record) => (
				<div className='text-muted small'>
					{record.lastLogin ? (
						<>
							{dayjs(record.lastLogin).format('DD/MM/YYYY')}
							<br />
							{dayjs(record.lastLogin).format('HH:mm')}
						</>
					) : (
						t('Never')
					)}
				</div>
			),
		},
		{
			key: 'created',
			title: t('Created'),
			dataIndex: 'createdAt',
			sortable: true,
			render: (_, record) => (
				<div className='text-muted small'>
					{dayjs(record.createdAt).format('DD/MM/YYYY')}
					<br />
					{dayjs(record.createdAt).format('HH:mm')}
				</div>
			),
		},
		/* 		{
			key: 'moreActions',
			title: '',
			dataIndex: 'id',
			width: 50,
			render: (_, record) => (
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
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								onEditUser?.(record);
							}}>
							<div>
								<Icon icon='Edit' className='me-2' />
								{t('Edit User')}
							</div>
						</DropdownItem>

						{record.id !== currentUserId && (
							<DropdownItem
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									if (isToggling) return;
									handleToggleUserStatus(record);
								}}>
								<div className={isToggling ? 'opacity-50' : ''}>
									<Icon
										icon={record.status === 'active' ? 'Block' : 'CheckCircle'}
										className='me-2'
									/>
									{isToggling
										? t('Updating...')
										: record.status === 'active'
											? t('Deactivate')
											: t('Activate')}
								</div>
							</DropdownItem>
						)}
						<DropdownItem isDivider />
						{record.id !== currentUserId && (
							<DropdownItem
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									if (isDeleting) return;
									if (
										confirm(
											t('Are you sure you want to delete user "{{name}}"?', {
												name: record.fullName,
											}),
										)
									) {
										handleDeleteUser(record);
									}
								}}>
								<div className={`text-danger ${isDeleting ? 'opacity-50' : ''}`}>
									<Icon icon='Delete' className='me-2' />
									{isDeleting ? t('Deleting...') : t('Delete User')}
								</div>
							</DropdownItem>
						)}
					</DropdownMenu>
				</Dropdown>
			),
		}, */
	];
};
