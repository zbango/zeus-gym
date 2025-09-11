import React from 'react';
import { TableColumn } from '../../types/member.types';
import { Member } from '../../types/member.types';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Avatar from '../Avatar';
import Button from '../bootstrap/Button';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '../bootstrap/Dropdown';
import Icon from '../icon/Icon';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';

export const useMembersTableColumns = (): TableColumn<Member>[] => {
	const { t } = useTranslation();
	const { darkModeStatus } = useDarkMode();

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

	return [
		{
			key: 'actions',
			title: '',
			dataIndex: 'id',
			width: 60,
			render: (_, record) => (
				<Button
					isOutline={!darkModeStatus}
					color='dark'
					isLight={darkModeStatus}
					className={classNames({
						'border-light': !darkModeStatus,
					})}
					icon='Visibility'
					aria-label='View details'
				/>
			),
		},
		{
			key: 'member',
			title: t('Member'),
			dataIndex: 'personalInfo.firstName',
			sortable: true,
			render: (_, record) => (
				<div className='d-flex align-items-center'>
					<Avatar size={40} className='me-3' src='' />
					<div>
						<div className='fw-bold'>
							{record.personalInfo.firstName} {record.personalInfo.lastName}
						</div>
						<div className='small text-muted'>
							{t('{{age}} years', { age: record.healthInfo.age })} •{' '}
							{record.healthInfo.height}cm
						</div>
					</div>
				</div>
			),
		},
		{
			key: 'contact',
			title: t('Contact'),
			dataIndex: 'personalInfo.email',
			render: (_, record) => (
				<div>
					<div>{record.personalInfo.email}</div>
					<div className='small text-muted'>{record.personalInfo.phone}</div>
				</div>
			),
		},
		{
			key: 'membership',
			title: t('Membership'),
			dataIndex: 'membershipInfo.plan',
			render: (_, record) => (
				<div>
					<div className='fw-bold'>{record.membershipInfo.plan}</div>
					<div className='small text-muted'>
						{record.membershipInfo.type === 'monthly'
							? t('Expires: {{date}}', {
									date: dayjs(record.membershipInfo.endDate).format('DD/MM/YYYY'),
								})
							: t('{{count}} visits left', {
									count: record.membershipInfo.remainingVisits,
								})}
					</div>
				</div>
			),
		},
		{
			key: 'status',
			title: t('Status'),
			dataIndex: 'membershipInfo.status',
			sortable: true,
			render: (_, record) => (
				<Dropdown>
					<DropdownToggle hasIcon={false}>
						<Button
							isLink
							color={getStatusColor(record.membershipInfo.status)}
							icon='Circle'
							className='text-nowrap'>
							{t(
								record.membershipInfo.status.charAt(0).toUpperCase() +
									record.membershipInfo.status.slice(1),
							)}
						</Button>
					</DropdownToggle>
					<DropdownMenu>
						{['active', 'inactive', 'suspended', 'expired'].map((status) => (
							<DropdownItem key={status}>
								<div>
									<Icon
										icon='Circle'
										color={getStatusColor(status)}
										className='me-2'
									/>
									{t(status.charAt(0).toUpperCase() + status.slice(1))}
								</div>
							</DropdownItem>
						))}
					</DropdownMenu>
				</Dropdown>
			),
		},
		{
			key: 'progress',
			title: t('Progress'),
			dataIndex: 'progressTracking.measurements',
			render: (_, record) => {
				const latestProgress =
					record.progressTracking.measurements[
						record.progressTracking.measurements.length - 1
					];
				return latestProgress ? (
					<div>
						<div className='fw-bold'>{latestProgress.weight}kg</div>
						<div className='small text-muted'>
							{dayjs(latestProgress.date).format('DD/MM/YYYY')}
						</div>
					</div>
				) : (
					<span className='text-muted'>-</span>
				);
			},
		},
		{
			key: 'payment',
			title: t('Payment'),
			dataIndex: 'id',
			render: (_, record) => {
				// This would be calculated based on payment data
				const hasPartialPayment = false; // Mock data
				return hasPartialPayment ? (
					<span className='badge bg-warning'>
						<Icon icon='Warning' size='sm' className='me-1' />
						{t('Pending')}
					</span>
				) : (
					<span className='badge bg-success'>
						<Icon icon='CheckCircle' size='sm' className='me-1' />
						{t('Up to date')}
					</span>
				);
			},
		},
		{
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
						<DropdownItem>
							<div>
								<Icon icon='Visibility' className='me-2' />
								{t('View Profile')}
							</div>
						</DropdownItem>
						<DropdownItem>
							<div>
								<Icon icon='Edit' className='me-2' />
								{t('Edit Member')}
							</div>
						</DropdownItem>
						<DropdownItem>
							<div>
								<Icon icon='TrendingUp' className='me-2' />
								{t('View Progress')}
							</div>
						</DropdownItem>
						<DropdownItem isDivider />
						<DropdownItem>
							<div>
								<Icon icon='Payment' className='me-2' />
								{t('Payment History')}
							</div>
						</DropdownItem>
						<DropdownItem>
							<div>
								<Icon icon='LoginTwoTone' className='me-2' />
								{t('Check-in History')}
							</div>
						</DropdownItem>
						<DropdownItem isDivider />
						<DropdownItem>
							<div className='text-danger'>
								<Icon icon='Delete' className='me-2' />
								{t('Delete Member')}
							</div>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			),
		},
	];
};
