import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Page from '../../layout/Page/Page';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import Input from '../../components/bootstrap/forms/Input';
import Select from '../../components/bootstrap/forms/Select';
import Option from '../../components/bootstrap/Option';
import Button from '../../components/bootstrap/Button';
import Breadcrumb from '../../components/bootstrap/Breadcrumb';
import Spinner from '../../components/bootstrap/Spinner';
import Badge from '../../components/bootstrap/Badge';
import AdvancedFilters, { FilterField } from './AdvancedFilters';
import {
	useDataList,
	DataListParams,
	AdvancedFilters as AdvancedFiltersType,
} from '../../hooks/useDataList';
import classNames from 'classnames';

export interface BreadcrumbItem {
	title: string;
	to: string;
}

export interface DataListPageProps<T = any> {
	// Page configuration
	title: string;
	className?: string;

	// Breadcrumb
	breadcrumbs: BreadcrumbItem[];

	// Search & Filters
	searchPlaceholder?: string;
	statusOptions?: Array<{ value: string; label: string }>;

	// Advanced Filters
	advancedFilterFields?: FilterField[];
	onAdvancedFiltersChange?: (filters: AdvancedFiltersType) => void;

	// Actions
	onRefresh?: () => void;
	primaryAction?: {
		label: string;
		icon: string;
		color:
			| 'primary'
			| 'secondary'
			| 'success'
			| 'info'
			| 'warning'
			| 'danger'
			| 'light'
			| 'dark';
		onClick?: () => void;
		to?: string;
	};

	// Custom content
	headerActions?: ReactNode;
	customFilters?: ReactNode;
	children?: ReactNode;
}

const DataListPage = <T extends Record<string, any>>({
	title,
	className = 'pt-4',
	breadcrumbs,
	searchPlaceholder = 'Search...',
	statusOptions = [],
	advancedFilterFields = [],
	onAdvancedFiltersChange,
	onRefresh,
	primaryAction,
	headerActions,
	customFilters,
	children,
}: DataListPageProps<T>) => {
	const { t } = useTranslation();

	// Use the generic data list hook
	const {
		params,
		advancedFilters,
		showAdvancedFilters,
		searchInput,
		setSearch,
		setStatusFilter,
		setShowAdvancedFilters,
		activeFiltersCount,
		clearAllFilters,
		handleSearchChange,
		handleAdvancedFilterChange,
		handlePaginationChange: internalHandlePaginationChange,
	} = useDataList({
		onAdvancedFiltersChange,
	});

	// Handle pagination with external handler
	const handlePaginationChange = (page: number, size: number) => {
		internalHandlePaginationChange(page, size);
	};

	// Note: Loading state is now handled by the child components (DynamicTable)

	return (
		<PageWrapper title={t(title)} className={className}>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb list={breadcrumbs} isToHome={false} />
				</SubHeaderLeft>
				<SubHeaderRight>
					{primaryAction && (
						<Button
							color={primaryAction.color}
							icon={primaryAction.icon}
							tag={primaryAction.to ? 'a' : 'button'}
							to={primaryAction.to}
							onClick={primaryAction.onClick}>
							{t(primaryAction.label)}
						</Button>
					)}
					{onRefresh && (
						<Button color='light' icon='Refresh' isLight onClick={onRefresh}>
							{t('Refresh')}
						</Button>
					)}
					{headerActions}
				</SubHeaderRight>
			</SubHeader>

			<Page container='fluid'>
				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Group' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t(title)}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<div className='d-flex align-items-center gap-3'>
								<Input
									type='search'
									placeholder={t(searchPlaceholder)}
									value={searchInput}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleSearchChange(e.target.value)
									}
									style={{ width: '250px' }}
								/>

								{statusOptions.length > 0 && (
									<Select
										value={params.status || ''}
										onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
											setStatusFilter(e.target.value)
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

								{customFilters}

								{advancedFilterFields.length > 0 && (
									<Button
										color='info'
										icon='FilterList'
										isLight
										onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
										className={classNames({
											'border-info': showAdvancedFilters,
										})}>
										{t('More Filters')}
										{activeFiltersCount > 0 && (
											<Badge
												color='info'
												className='ms-2'
												style={{ fontSize: '0.7rem' }}>
												{activeFiltersCount}
											</Badge>
										)}
									</Button>
								)}
							</div>
						</CardActions>
					</CardHeader>

					{/* Advanced Filters Panel */}
					{advancedFilterFields.length > 0 && (
						<AdvancedFilters
							isOpen={showAdvancedFilters}
							filters={advancedFilters}
							onFilterChange={handleAdvancedFilterChange}
							onClearAll={clearAllFilters}
							onApply={() => {
								// Apply filters logic would go here
								console.log('Applying filters:', advancedFilters);
							}}
							activeFiltersCount={activeFiltersCount}
							fields={advancedFilterFields}
						/>
					)}

					<CardBody className='p-0'>
						{/* Table will be rendered here by the parent component */}
						{children}
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default DataListPage;
