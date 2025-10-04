import React from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '../../../../components/bootstrap/Badge';
import Button from '../../../../components/bootstrap/Button';

interface ActiveFilterBadgesProps {
	activeFilters: Record<string, any>;
	onRemoveFilter: (filterKey: string) => void;
	onClearAll: () => void;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
	activeFilters,
	onRemoveFilter,
	onClearAll,
}) => {
	const { t } = useTranslation();

	// Helper function to format filter values for display
	const formatFilterValue = (key: string, value: any): string => {
		switch (key) {
			case 'membershipType':
				return value === 'monthly' ? t('Monthly') : t('Count-based');
			case 'paymentStatus':
				switch (value) {
					case 'up-to-date':
						return t('Up to date');
					case 'pending':
						return t('Pending');
					case 'overdue':
						return t('Overdue');
					default:
						return value;
				}
			case 'gender':
				switch (value) {
					case 'male':
						return t('Male');
					case 'female':
						return t('Female');
					case 'other':
						return t('Other');
					default:
						return value;
				}
			case 'ageRange':
				if (value?.min && value?.max) {
					return `${value.min}-${value.max} ${t('years')}`;
				} else if (value?.min) {
					return `≥${value.min} ${t('years')}`;
				} else if (value?.max) {
					return `≤${value.max} ${t('years')}`;
				}
				return '';
			case 'weightRange':
				if (value?.min && value?.max) {
					return `${value.min}-${value.max} kg`;
				} else if (value?.min) {
					return `≥${value.min} kg`;
				} else if (value?.max) {
					return `≤${value.max} kg`;
				}
				return '';
			case 'heightRange':
				if (value?.min && value?.max) {
					return `${value.min}-${value.max} cm`;
				} else if (value?.min) {
					return `≥${value.min} cm`;
				} else if (value?.max) {
					return `≤${value.max} cm`;
				}
				return '';
			case 'registrationDateRange':
				if (value?.start && value?.end) {
					return `${value.start} - ${value.end}`;
				} else if (value?.start) {
					return `≥${value.start}`;
				} else if (value?.end) {
					return `≤${value.end}`;
				}
				return '';
			default:
				return String(value);
		}
	};

	// Helper function to get filter label
	const getFilterLabel = (key: string): string => {
		const labels: Record<string, string> = {
			membershipType: t('Membership Type'),
			paymentStatus: t('Payment Status'),
			gender: t('Gender'),
			ageRange: t('Age Range'),
			weightRange: t('Weight Range'),
			heightRange: t('Height Range'),
			registrationDateRange: t('Registration Date'),
			status: t('Status'),
		};
		return labels[key] || key;
	};

	// Get active filters as array
	const activeFilterEntries = Object.entries(activeFilters).filter(([key, value]) => {
		if (!value) return false;
		if (typeof value === 'object' && !Array.isArray(value)) {
			// For range objects, check if any property has a value
			return Object.values(value).some((v) => v && v !== '');
		}
		return value !== '' && value !== null && value !== undefined;
	});

	if (activeFilterEntries.length === 0) {
		return null;
	}

	return (
		<div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
			<span className='text-muted small me-2'>
				<i className='fa fa-filter me-1' />
				{t('Active Filters')}:
			</span>

			{activeFilterEntries.map(([key, value]) => {
				const displayValue = formatFilterValue(key, value);
				if (!displayValue) return null;

				return (
					<Badge
						key={key}
						color='info'
						className='d-flex align-items-center gap-1'
						style={{ fontSize: '0.8rem' }}>
						<span>
							{getFilterLabel(key)}: {displayValue}
						</span>
						<Button
							color='light'
							size='sm'
							icon='Close'
							className='p-0'
							style={{
								width: '16px',
								height: '16px',
								fontSize: '0.7rem',
								border: 'none',
								background: 'transparent',
							}}
							onClick={() => onRemoveFilter(key)}
						/>
					</Badge>
				);
			})}

			{activeFilterEntries.length > 1 && (
				<Button
					color='secondary'
					size='sm'
					icon='Clear'
					isLight
					onClick={onClearAll}
					className='ms-2'>
					{t('Clear All')}
				</Button>
			)}
		</div>
	);
};

export default ActiveFilterBadges;
