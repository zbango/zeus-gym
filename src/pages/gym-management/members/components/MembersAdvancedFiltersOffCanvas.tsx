import React, { useEffect, useState, useRef } from 'react';
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

	// Local state for advanced filters
	const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>(initialFilters);
	const isUserInteractingRef = useRef(false);
	const lastInitialFiltersRef = useRef<string>('');

	// Reset user interaction flag when component opens
	useEffect(() => {
		if (isOpen) {
			isUserInteractingRef.current = false;
		}
	}, [isOpen]);

	// Sync with parent when initialFilters change (e.g., when cleared from ActiveFilterBadges)
	// But only if the user is not actively interacting with the form
	useEffect(() => {
		const currentInitialFiltersString = JSON.stringify(initialFilters);

		// Only sync if the initialFilters actually changed from the parent
		if (
			lastInitialFiltersRef.current !== currentInitialFiltersString &&
			!isUserInteractingRef.current
		) {
			console.log(
				'🔄 MembersAdvancedFiltersOffCanvas: Syncing with parent filters:',
				initialFilters,
			);
			setAdvancedFilters(initialFilters);
			lastInitialFiltersRef.current = currentInitialFiltersString;
		}
	}, [initialFilters]);

	// Calculate active filters count
	const activeFiltersCount = Object.values(advancedFilters).reduce((count, value) => {
		if (value !== null && value !== undefined && value !== '') {
			if (typeof value === 'object' && value !== null) {
				// Handle range objects
				if (value.min || value.max || value.start || value.end) {
					return count + 1;
				}
			} else {
				return count + 1;
			}
		}
		return count;
	}, 0);

	// Handle individual filter changes
	const handleAdvancedFilterChange = (filterKey: string, value: any) => {
		// Set user interacting flag
		isUserInteractingRef.current = true;

		const newFilters = {
			...advancedFilters,
			[filterKey]: value,
		};
		setAdvancedFilters(newFilters);
		onAdvancedFiltersChange?.(newFilters);

		// Reset user interaction flag after a short delay
		setTimeout(() => {
			isUserInteractingRef.current = false;
		}, 100);
	};

	// Clear all filters
	const clearAllFilters = () => {
		console.log('🧹 MembersAdvancedFiltersOffCanvas: Clearing all filters');
		isUserInteractingRef.current = false;
		setAdvancedFilters({});
		onAdvancedFiltersChange?.({});
	};

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
			placement='end'>
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
											<i className={`fa fa-${icon} me-1`} />
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
											<i className={`fa fa-${icon} me-1`} />
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
											<i className={`fa fa-${icon} me-1`} />
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
											<i className={`fa fa-${icon} me-1`} />
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
							<i className='fa fa-filter' />
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
						isDisable={activeFiltersCount === 0}>
						<i className='fa fa-times me-1' />
						{t('Clear All')}
					</Button>
					<div className='d-flex gap-2'>
						<Button color='secondary' onClick={onClose}>
							{t('Cancel')}
						</Button>
						<Button color='primary' onClick={handleApply}>
							<i className='fa fa-search me-1' />
							{t('Apply Filters')}
						</Button>
					</div>
				</div>
			</div>
		</OffCanvas>
	);
};

export default MembersAdvancedFiltersOffCanvas;
