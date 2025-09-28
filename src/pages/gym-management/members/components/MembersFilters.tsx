import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import Button from '../../../../components/bootstrap/Button';
import Badge from '../../../../components/bootstrap/Badge';

interface MembersFiltersProps {
	statusOptions?: Array<{ value: string; label: string }>;
	onStatusChange?: (status: string) => void;
	onAdvancedFiltersClick?: () => void;
	activeFiltersCount?: number;
	className?: string;
}

const MembersFilters: React.FC<MembersFiltersProps> = ({
	statusOptions = [],
	onStatusChange,
	onAdvancedFiltersClick,
	activeFiltersCount = 0,
	className = '',
}) => {
	const { t } = useTranslation();
	const [statusFilter, setStatusFilter] = React.useState('');

	const handleStatus = (status: string) => {
		setStatusFilter(status);
		onStatusChange?.(status);
	};

	return (
		<div className={`d-flex align-items-center gap-3 flex-wrap ${className}`}>
			{/* Status Filter */}
			{statusOptions.length > 0 && (
				<Select
					value={statusFilter}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						handleStatus(e.target.value)
					}
					ariaLabel={t('Filter by status')}
					style={{ width: '175px' }}>
					<Option value=''>{t('All Status')}</Option>
					{statusOptions.map((option) => (
						<Option key={option.value} value={option.value}>
							{t(option.label)}
						</Option>
					))}
				</Select>
			)}

			{/* Advanced Filters Button */}
			<Button color='info' icon='FilterList' isLight onClick={onAdvancedFiltersClick}>
				{t('More Filters')}
				{activeFiltersCount > 0 && (
					<Badge color='info' className='ms-2' style={{ fontSize: '0.7rem' }}>
						{activeFiltersCount}
					</Badge>
				)}
			</Button>
		</div>
	);
};

export default MembersFilters;
