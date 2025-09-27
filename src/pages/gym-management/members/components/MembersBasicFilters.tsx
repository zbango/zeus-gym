import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../../components/bootstrap/forms/Input';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import Button from '../../../../components/bootstrap/Button';
import Badge from '../../../../components/bootstrap/Badge';

interface MembersBasicFiltersProps {
	searchPlaceholder?: string;
	statusOptions?: Array<{ value: string; label: string }>;
	onSearchChange?: (search: string) => void;
	onStatusChange?: (status: string) => void;
	onAdvancedFiltersClick?: () => void;
	activeFiltersCount?: number;
}

const MembersBasicFilters: React.FC<MembersBasicFiltersProps> = ({
	searchPlaceholder = 'Search members...',
	statusOptions = [],
	onSearchChange,
	onStatusChange,
	onAdvancedFiltersClick,
	activeFiltersCount = 0,
}) => {
	const { t } = useTranslation();
	const [searchInput, setSearchInput] = React.useState('');
	const [statusFilter, setStatusFilter] = React.useState('');

	const handleSearch = (value: string) => {
		setSearchInput(value);
		onSearchChange?.(value);
	};

	const handleStatus = (status: string) => {
		setStatusFilter(status);
		onStatusChange?.(status);
	};

	return (
		<div className='d-flex align-items-center gap-3 flex-wrap'>
			{/* Search Input */}
			<Input
				type='search'
				placeholder={t(searchPlaceholder)}
				value={searchInput}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
				style={{ width: '250px' }}
			/>

			{/* Status Filter */}
			{statusOptions.length > 0 && (
				<Select
					value={statusFilter}
					onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
						handleStatus(e.target.value)
					}
					ariaLabel={t('Filter by status')}
					style={{ width: '150px' }}>
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

export default MembersBasicFilters;
