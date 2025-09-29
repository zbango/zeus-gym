import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../components/icon/Icon';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import { IGymUser } from '../../../../types/gym-types';

interface UsersListStatsProps {
	users: IGymUser[];
}

const UsersListStats: React.FC<UsersListStatsProps> = ({ users }) => {
	const { t } = useTranslation();

	const adminUsers = users.filter((u) => u.role === 'admin');
	const staffUsers = users.filter((u) => u.role === 'staff');
	const activeUsers = users.filter((u) => u.isActive);

	const stats = [
		{
			icon: 'SupervisorAccount',
			color: 'primary',
			value: users.length,
			label: t('Total Users'),
		},
		{
			icon: 'AdminPanelSettings',
			color: 'danger',
			value: adminUsers.length,
			label: t('Administrators'),
		},
		{
			icon: 'Person',
			color: 'info',
			value: staffUsers.length,
			label: t('Staff Members'),
		},
		{
			icon: 'CheckCircle',
			color: 'success',
			value: activeUsers.length,
			label: t('Active Users'),
		},
	];

	return (
		<div className='row g-4 mb-4 mt-4'>
			{stats.map((stat, index) => (
				<div key={index} className='col-xl-3 col-md-6'>
					<Card className='mb-0'>
						<CardBody className='text-center'>
							<Icon icon={stat.icon} size='2x' color={stat.color} className='mb-2' />
							<div className='h4'>{stat.value}</div>
							<div className='text-muted'>{stat.label}</div>
						</CardBody>
					</Card>
				</div>
			))}
		</div>
	);
};

export default UsersListStats;
