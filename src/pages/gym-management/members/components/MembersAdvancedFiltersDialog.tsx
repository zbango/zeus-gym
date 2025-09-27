import React from 'react';
import { useTranslation } from 'react-i18next';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../../components/bootstrap/OffCanvas';
import Button from '../../../../components/bootstrap/Button';
import AdvancedFilters, { FilterField } from '../../../../components/common/AdvancedFilters';
import { useDataList } from '../../../../hooks/useDataList';

interface MembersAdvancedFiltersOffCanvasProps {
	isOpen: boolean;
	onClose: () => void;
	advancedFilterFields: FilterField[];
	onAdvancedFiltersChange?: (filters: any) => void;
}

const MembersAdvancedFiltersOffCanvas: React.FC<MembersAdvancedFiltersOffCanvasProps> = ({
	isOpen,
	onClose,
	advancedFilterFields,
	onAdvancedFiltersChange,
}) => {
	const { t } = useTranslation();

	const { advancedFilters, activeFiltersCount, clearAllFilters, handleAdvancedFilterChange } =
		useDataList({
			onAdvancedFiltersChange,
		});

	const handleApply = () => {
		// Apply filters logic would go here
		console.log('Applying filters:', advancedFilters);
		onClose();
	};

	return (
		<OffCanvas
			setIsOpen={onClose}
			isOpen={isOpen}
			titleId='advancedFiltersOffCanvas'
			placement='end'
			size='lg'>
			<OffCanvasHeader setIsOpen={onClose}>
				<OffCanvasTitle id='advancedFiltersOffCanvas'>
					{t('Advanced Filters')}
				</OffCanvasTitle>
			</OffCanvasHeader>
			<OffCanvasBody>
				<AdvancedFilters
					isOpen={true}
					filters={advancedFilters}
					onFilterChange={handleAdvancedFilterChange}
					onClearAll={clearAllFilters}
					activeFiltersCount={activeFiltersCount}
					fields={advancedFilterFields}
				/>
			</OffCanvasBody>
			<div className='offcanvas-footer p-3 border-top'>
				<div className='d-flex gap-2 justify-content-end'>
					<Button color='secondary' onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button color='primary' onClick={handleApply}>
						{t('Apply Filters')}
					</Button>
				</div>
			</div>
		</OffCanvas>
	);
};

export default MembersAdvancedFiltersDialog;
