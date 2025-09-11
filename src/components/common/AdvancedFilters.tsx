import React from 'react';
import { useTranslation } from 'react-i18next';
import Collapse from '../../components/bootstrap/Collapse';
import CardBody from '../../components/bootstrap/Card';
import Input from '../../components/bootstrap/forms/Input';
import Select from '../../components/bootstrap/forms/Select';
import Option from '../../components/bootstrap/Option';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import Badge from '../../components/bootstrap/Badge';

export interface FilterField {
	key: string;
	label: string;
	icon: string;
	type: 'select' | 'range' | 'date-range' | 'text';
	options?: Array<{ value: string; label: string }>;
	placeholder?: {
		min?: string;
		max?: string;
		start?: string;
		end?: string;
	};
	unit?: string;
}

export interface AdvancedFiltersProps {
	isOpen: boolean;
	filters: Record<string, any>;
	onFilterChange: (filterKey: string, value: any) => void;
	onClearAll: () => void;
	onApply: () => void;
	activeFiltersCount: number;
	fields: FilterField[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
	isOpen,
	filters,
	onFilterChange,
	onClearAll,
	onApply,
	activeFiltersCount,
	fields,
}) => {
	const { t } = useTranslation();

	const renderFilterField = (field: FilterField) => {
		const { key, label, icon, type, options, placeholder, unit } = field;
		const value = filters[key] || '';

		switch (type) {
			case 'select':
				return (
					<div className='col-md-3' key={key}>
						<label className='form-label fw-bold text-muted small'>
							<Icon icon={icon} className='me-1' />
							{t(label)}
						</label>
						<Select
							value={value}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								onFilterChange(key, e.target.value)
							}
							ariaLabel={t(`Filter by ${label}`)}>
							<Option value=''>{t('All')}</Option>
							{options?.map((option) => (
								<Option key={option.value} value={option.value}>
									{t(option.label)}
								</Option>
							))}
						</Select>
					</div>
				);

			case 'range':
				return (
					<div className='col-md-3' key={key}>
						<label className='form-label fw-bold text-muted small'>
							<Icon icon={icon} className='me-1' />
							{t(label)} {unit && `(${unit})`}
						</label>
						<div className='d-flex gap-2'>
							<Input
								type='number'
								placeholder={t(placeholder?.min || 'Min')}
								value={value?.min || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onFilterChange(key, {
										...value,
										min: e.target.value,
									})
								}
								style={{ fontSize: '0.875rem' }}
							/>
							<Input
								type='number'
								placeholder={t(placeholder?.max || 'Max')}
								value={value?.max || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onFilterChange(key, {
										...value,
										max: e.target.value,
									})
								}
								style={{ fontSize: '0.875rem' }}
							/>
						</div>
					</div>
				);

			case 'date-range':
				return (
					<div className='col-md-3' key={key}>
						<label className='form-label fw-bold text-muted small'>
							<Icon icon={icon} className='me-1' />
							{t(label)}
						</label>
						<div className='d-flex gap-2'>
							<Input
								type='date'
								value={value?.start || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onFilterChange(key, {
										...value,
										start: e.target.value,
									})
								}
								style={{ fontSize: '0.875rem' }}
							/>
							<Input
								type='date'
								value={value?.end || ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onFilterChange(key, {
										...value,
										end: e.target.value,
									})
								}
								style={{ fontSize: '0.875rem' }}
							/>
						</div>
					</div>
				);

			case 'text':
				return (
					<div className='col-md-3' key={key}>
						<label className='form-label fw-bold text-muted small'>
							<Icon icon={icon} className='me-1' />
							{t(label)}
						</label>
						<Input
							type='text'
							placeholder={t(placeholder?.min || 'Enter value')}
							value={value || ''}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								onFilterChange(key, e.target.value)
							}
							style={{ fontSize: '0.875rem' }}
						/>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<Collapse isOpen={isOpen}>
			<CardBody className='border-top bg-light'>
				<div className='row g-4'>{fields.map(renderFilterField)}</div>

				{/* Filter Actions */}
				<div className='d-flex justify-content-between align-items-center mt-4 pt-3 border-top'>
					<div className='d-flex align-items-center gap-2'>
						<Icon icon='FilterList' className='text-muted' />
						<span className='text-muted small'>
							{t('{{count}} active filters', {
								count: activeFiltersCount,
							})}
						</span>
					</div>
					<div className='d-flex gap-2'>
						<Button
							color='secondary'
							size='sm'
							icon='Clear'
							isLight
							onClick={onClearAll}>
							{t('Clear All')}
						</Button>
						<Button color='primary' size='sm' icon='Search' onClick={onApply}>
							{t('Apply Filters')}
						</Button>
					</div>
				</div>
			</CardBody>
		</Collapse>
	);
};

export default AdvancedFilters;
