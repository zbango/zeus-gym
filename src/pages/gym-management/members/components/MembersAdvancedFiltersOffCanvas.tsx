import React from 'react';
import { useTranslation } from 'react-i18next';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../../components/bootstrap/OffCanvas';
import Button from '../../../../components/bootstrap/Button';
import Input from '../../../../components/bootstrap/forms/Input';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import { FilterField } from '../../../../components/common/AdvancedFilters';
import { useDataList } from '../../../../hooks/useDataList';

interface MembersAdvancedFiltersOffCanvasProps {
	isOpen: boolean;
	onClose: () => void;
	advancedFilterFields: FilterField[];
	onAdvancedFiltersChange?: (filters: any) => void;
	initialFilters?: Record<string, any>;
}

const MembersAdvancedFiltersOffCanvas: React.FC<MembersAdvancedFiltersOffCanvasProps> = ({
	isOpen,
	onClose,
	advancedFilterFields,
	onAdvancedFiltersChange,
	initialFilters = {},
}) => {
	const { t } = useTranslation();

	const { advancedFilters, activeFiltersCount, clearAllFilters, handleAdvancedFilterChange } =
		useDataList({
			initialAdvancedFilters: initialFilters,
			onAdvancedFiltersChange,
		});

	const handleApply = () => {
		// Apply filters logic would go here
		console.log('Applying filters:', advancedFilters);
		onClose();
	};

	return (
		<OffCanvas
			setOpen={onClose}
			isOpen={isOpen}
			titleId='advancedFiltersOffCanvas'
			placement='end'
			size='lg'>
			<OffCanvasHeader setOpen={onClose}>
				<OffCanvasTitle id='advancedFiltersOffCanvas'>
					{t('Advanced Filters')}
				</OffCanvasTitle>
			</OffCanvasHeader>
			<OffCanvasBody>
				<div className='row g-3'>
					{advancedFilterFields.map((field) => {
						const { key, label, icon, type, options, placeholder, unit } = field;
						const value = advancedFilters[key] || '';

						switch (type) {
							case 'select':
								return (
									<div className='col-12 col-md-6' key={key}>
										<label className='form-label fw-bold text-muted small'>
											<i className={`fa fa-${icon} me-1`}></i>
											{t(label)}
										</label>
										<Select
											value={value}
											onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
												handleAdvancedFilterChange(key, e.target.value)
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
									<div className='col-12 col-md-6' key={key}>
										<label className='form-label fw-bold text-muted small'>
											<i className={`fa fa-${icon} me-1`}></i>
											{t(label)} {unit && `(${unit})`}
										</label>
										<div className='d-flex gap-2'>
											<Input
												type='number'
												placeholder={t(placeholder?.min || 'Min')}
												value={value?.min || ''}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) =>
													handleAdvancedFilterChange(key, {
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
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) =>
													handleAdvancedFilterChange(key, {
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
									<div className='col-12 col-md-6' key={key}>
										<label className='form-label fw-bold text-muted small'>
											<i className={`fa fa-${icon} me-1`}></i>
											{t(label)}
										</label>
										<div className='d-flex gap-2'>
											<Input
												type='date'
												value={value?.start || ''}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) =>
													handleAdvancedFilterChange(key, {
														...value,
														start: e.target.value,
													})
												}
												style={{ fontSize: '0.875rem' }}
											/>
											<Input
												type='date'
												value={value?.end || ''}
												onChange={(
													e: React.ChangeEvent<HTMLInputElement>,
												) =>
													handleAdvancedFilterChange(key, {
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
									<div className='col-12 col-md-6' key={key}>
										<label className='form-label fw-bold text-muted small'>
											<i className={`fa fa-${icon} me-1`}></i>
											{t(label)}
										</label>
										<Input
											type='text'
											placeholder={t(placeholder?.min || 'Enter value')}
											value={value || ''}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleAdvancedFilterChange(key, e.target.value)
											}
											style={{ fontSize: '0.875rem' }}
										/>
									</div>
								);

							default:
								return null;
						}
					})}
				</div>

				{/* Active Filters Summary */}
				{activeFiltersCount > 0 && (
					<div className='mt-4 pt-3 border-top'>
						<div className='d-flex align-items-center gap-2 text-muted'>
							<i className='fa fa-filter'></i>
							<span className='small'>
								{t('{{count}} active filters', {
									count: activeFiltersCount,
								})}
							</span>
						</div>
					</div>
				)}
			</OffCanvasBody>
			<div className='offcanvas-footer p-3 border-top bg-light'>
				<div className='d-flex gap-2 justify-content-between'>
					<Button
						color='secondary'
						onClick={clearAllFilters}
						disabled={activeFiltersCount === 0}>
						<i className='fa fa-times me-1'></i>
						{t('Clear All')}
					</Button>
					<div className='d-flex gap-2'>
						<Button color='secondary' onClick={onClose}>
							{t('Cancel')}
						</Button>
						<Button color='primary' onClick={handleApply}>
							<i className='fa fa-search me-1'></i>
							{t('Apply Filters')}
						</Button>
					</div>
				</div>
			</div>
		</OffCanvas>
	);
};

export default MembersAdvancedFiltersOffCanvas;
