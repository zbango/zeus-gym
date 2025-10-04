import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Button from '../bootstrap/Button';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import { Payment } from '../../store/api/paymentsApi';
import { priceFormat } from '../../helpers/helpers';

export interface PaymentsTableColumn {
	key: string;
	title: string;
	dataIndex?: string;
	sortable?: boolean;
	width?: number;
	render?: (value: any, record: Payment, index: number) => React.ReactNode;
}

export const usePaymentsTableColumns = (
	onViewDetails?: (payment: Payment) => void,
	onAddPayment?: (payment: Payment) => void,
	onSendReminder?: (payment: Payment) => void,
): PaymentsTableColumn[] => {
	const { t } = useTranslation();
	const { darkModeStatus } = useDarkMode();

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'partial':
				return 'warning';
			case 'pending':
				return 'danger';
			default:
				return 'secondary';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return t('Completed');
			case 'partial':
				return t('Partial');
			case 'pending':
				return t('Pending');
			default:
				return status;
		}
	};

	return [
		{
			key: 'actions',
			title: '',
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
					onClick={() => onViewDetails?.(record)}
					aria-label={t('View details')}
				/>
			),
		},
		{
			key: 'customer',
			title: t('Customer'),
			dataIndex: 'customerName',
			sortable: true,
			render: (_, record) => (
				<div>
					<div className='fw-bold'>{record.customerName}</div>
					<div className='small text-muted'>{record.customerEmail}</div>
					<div className='small text-muted'>{record.customerPhone}</div>
				</div>
			),
		},
		{
			key: 'plan',
			title: t('Plan'),
			dataIndex: 'membershipPlanName',
			render: (_, record) => (
				<div>
					<div className='fw-bold'>{record.membershipPlanName}</div>
				</div>
			),
		},
		{
			key: 'totalAmount',
			title: t('Total Amount'),
			dataIndex: 'membershipTotalAmount',
			render: (_, record) => (
				<div className='fw-bold'>{priceFormat(record.membershipTotalAmount)}</div>
			),
		},
		{
			key: 'paidAmount',
			title: t('Paid Amount'),
			dataIndex: 'paidAmount',
			render: (_, record) => (
				<div className='fw-bold text-success'>{priceFormat(record.paidAmount)}</div>
			),
		},
		{
			key: 'remaining',
			title: t('Remaining'),
			dataIndex: 'remaining',
			render: (_, record) => (
				<div
					className={classNames('fw-bold', {
						'text-success': record.remaining === 0,
						'text-warning':
							record.remaining > 0 && record.remaining < record.membershipTotalAmount,
						'text-danger': record.remaining === record.membershipTotalAmount,
					})}>
					{priceFormat(record.remaining)}
				</div>
			),
		},
		{
			key: 'status',
			title: t('Status'),
			dataIndex: 'status',
			sortable: true,
			render: (_, record) => (
				<span className={`badge bg-${getStatusColor(record.status)}`}>
					{getStatusText(record.status)}
				</span>
			),
		},
		{
			key: 'createdAt',
			title: t('Created Date'),
			dataIndex: 'createdAt',
			sortable: true,
			render: (_, record) => (
				<span className='text-nowrap'>{dayjs(record.createdAt).format('DD/MM/YYYY')}</span>
			),
		},
	];
};
