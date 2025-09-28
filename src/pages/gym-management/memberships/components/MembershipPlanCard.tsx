import React from 'react';
import { useTranslation } from 'react-i18next';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import { IMembershipPlan } from '../../../../types/gym-types';
import classNames from 'classnames';
import { priceFormat } from '../../../../helpers/helpers';

interface MembershipPlanCardProps {
	plan: IMembershipPlan;
	onEdit: (plan: IMembershipPlan) => void;
	onDelete: (planId: string) => void;
	onToggleStatus: (planId: string) => void;
	saving: boolean;
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
	plan,
	onEdit,
	onDelete,
	onToggleStatus,
	saving,
}) => {
	const { t } = useTranslation();

	return (
		<Card
			className={classNames('h-100 position-relative', {
				'border-success': plan.isActive,
				'border-secondary': !plan.isActive,
			})}
			shadow='sm'>
			{/* Status Badge */}
			<div className='position-absolute top-0 end-0 p-2'>
				<span
					className={classNames('badge', {
						'bg-success': plan.isActive,
						'bg-secondary': !plan.isActive,
					})}>
					{plan.isActive ? t('Active') : t('Inactive')}
				</span>
			</div>

			<CardBody className='p-4'>
				{/* Header Section */}
				<div className='text-center mb-4'>
					<div className='mb-2'>
						<span
							className={classNames('badge fs-6', {
								'bg-primary': plan.type === 'monthly',
								'bg-info': plan.type === 'count-based',
							})}>
							{plan.type === 'monthly' ? t('Monthly') : t('Count-based')}
						</span>
					</div>
					<h4 className='mb-2'>{plan.name}</h4>
					<div className='h1 text-primary mb-1'>{priceFormat(plan.price)}</div>
					<small className='text-muted'>
						{plan.type === 'monthly'
							? t('per {{duration}} month(s)', {
									duration: plan.duration,
									count: plan.duration || 0,
								})
							: t('for {{count}} visits', {
									count: plan.visitCount,
								})}
					</small>
				</div>

				{/* Description */}
				<div className='mb-4'>
					<p className='text-muted mb-0'>{plan.description}</p>
				</div>

				{/* Actions Section */}
				<div className='d-flex flex-column gap-3'>
					{/* Action Buttons */}
					<div className='d-flex gap-2'>
						<Button
							color='info'
							icon='Edit'
							className='flex-fill'
							onClick={() => onEdit(plan)}>
							{t('Edit')}
						</Button>
						<Button
							color='danger'
							icon='Delete'
							className='flex-fill'
							onClick={() => onDelete(plan.id)}
							isDisable={saving}>
							{t('Delete')}
						</Button>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default MembershipPlanCard;
