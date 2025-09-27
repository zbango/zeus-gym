import React, { useState, useMemo } from 'react';
import { TableColumn, TableConfig } from '../../types/member.types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Button from '../bootstrap/Button';
import Icon from '../icon/Icon';

interface DynamicTableProps<T = any> {
	data: T[];
	columns: TableColumn<T>[];
	loading?: boolean;
	rowKey: keyof T;
	pagination?: {
		current: number;
		pageSize: number;
		total: number;
		onChange: (page: number, pageSize: number) => void;
	};
	selection?: {
		type: 'checkbox' | 'radio';
		selectedRowKeys: string[];
		onSelectChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
	};
	onRow?: (
		record: T,
		index: number,
	) => {
		onClick?: () => void;
		onDoubleClick?: () => void;
	};
	className?: string;
}

const DynamicTable = <T extends Record<string, any>>({
	data,
	columns,
	loading = false,
	rowKey,
	pagination,
	selection,
	onRow,
	className,
}: DynamicTableProps<T>) => {
	const { t } = useTranslation();
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: 'asc' | 'desc';
	} | null>(null);

	// Handle sorting
	const handleSort = (columnKey: string) => {
		setSortConfig((prev) => {
			if (prev?.key === columnKey) {
				return prev.direction === 'asc' ? { key: columnKey, direction: 'desc' } : null;
			}
			return { key: columnKey, direction: 'asc' };
		});
	};

	// Sort data
	const sortedData = useMemo(() => {
		if (!sortConfig) return data;

		return [...data].sort((a, b) => {
			const aValue = getNestedValue(a, sortConfig.key);
			const bValue = getNestedValue(b, sortConfig.key);

			if (aValue < bValue) {
				return sortConfig.direction === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}, [data, sortConfig]);

	// Handle selection
	const handleSelectAll = (checked: boolean) => {
		if (!selection) return;

		if (checked) {
			const allKeys = data.map((item) => String(item[rowKey]));
			selection.onSelectChange(allKeys, data);
		} else {
			selection.onSelectChange([], []);
		}
	};

	const handleSelectRow = (checked: boolean, record: T) => {
		if (!selection) return;

		const key = String(record[rowKey]);
		const newSelectedKeys = checked
			? [...selection.selectedRowKeys, key]
			: selection.selectedRowKeys.filter((k) => k !== key);

		const newSelectedRows = data.filter((item) =>
			newSelectedKeys.includes(String(item[rowKey])),
		);

		selection.onSelectChange(newSelectedKeys, newSelectedRows);
	};

	const isRowSelected = (record: T) => {
		return selection?.selectedRowKeys.includes(String(record[rowKey])) || false;
	};

	const isAllSelected =
		selection &&
		data.length > 0 &&
		data.every((item) => selection.selectedRowKeys.includes(String(item[rowKey])));

	const isIndeterminate =
		selection && data.length > 0 && selection.selectedRowKeys.length > 0 && !isAllSelected;

	// Pagination helpers
	const getTotalPages = () => {
		if (!pagination) return 0;
		return Math.ceil(pagination.total / pagination.pageSize);
	};

	const getPageNumbers = () => {
		const totalPages = getTotalPages();
		const current = pagination?.current || 1;
		const pages: (number | string)[] = [];

		if (totalPages <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show first page
			pages.push(1);

			if (current > 4) {
				pages.push('...');
			}

			// Show pages around current page
			const start = Math.max(2, current - 1);
			const end = Math.min(totalPages - 1, current + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (current < totalPages - 3) {
				pages.push('...');
			}

			// Show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const handlePageChange = (page: number) => {
		if (pagination && page >= 1 && page <= getTotalPages()) {
			pagination.onChange(page, pagination.pageSize);
		}
	};

	const handlePageSizeChange = (pageSize: number) => {
		if (pagination) {
			pagination.onChange(1, pageSize);
		}
	};

	return (
		<div className={className}>
			<div className='table-responsive'>
				<table className='table table-modern table-hover'>
					<thead>
						<tr>
							{selection && (
								<th style={{ width: 50 }}>
									{selection.type === 'checkbox' && (
										<div className='form-check'>
											<input
												className='form-check-input'
												type='checkbox'
												checked={isAllSelected}
												ref={(input) => {
													if (input)
														input.indeterminate =
															isIndeterminate || false;
												}}
												onChange={(e) => handleSelectAll(e.target.checked)}
											/>
										</div>
									)}
								</th>
							)}
							{columns.map((column) => (
								<th
									key={column.key}
									style={{ width: column.width }}
									className={classNames({
										'cursor-pointer': column.sortable,
										'text-decoration-underline': column.sortable,
									})}
									onClick={() => column.sortable && handleSort(column.key)}>
									{column.title}
									{column.sortable && (
										<span className='ms-1'>
											{sortConfig?.key === column.key
												? sortConfig.direction === 'asc'
													? '↑'
													: '↓'
												: '↕'}
										</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td
									colSpan={columns.length + (selection ? 1 : 0)}
									className='text-center py-4'>
									<div className='spinner-border' role='status'>
										<span className='visually-hidden'>{t('Loading...')}</span>
									</div>
								</td>
							</tr>
						) : sortedData.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length + (selection ? 1 : 0)}
									className='text-center py-4'>
									<div className='text-muted'>{t('No data available')}</div>
								</td>
							</tr>
						) : (
							sortedData.map((record, index) => (
								<tr
									key={String(record[rowKey])}
									className={classNames({
										'table-active': isRowSelected(record),
									})}>
									{selection && (
										<td>
											<div className='form-check'>
												<input
													className='form-check-input'
													type={selection.type}
													checked={isRowSelected(record)}
													onChange={(e) =>
														handleSelectRow(e.target.checked, record)
													}
												/>
											</div>
										</td>
									)}
									{columns.map((column) => (
										<td key={column.key}>
											{column.render
												? column.render(
														getNestedValue(
															record,
															column.dataIndex as string,
														),
														record,
														index,
													)
												: getNestedValue(
														record,
														column.dataIndex as string,
													)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{pagination && (
				<div className='d-flex justify-content-between align-items-center mt-3 px-3'>
					{/* Page size selector */}
					<div className='d-flex align-items-center gap-2'>
						<span className='text-muted small'>{t('Show')}</span>
						<select
							className='form-select form-select-sm'
							style={{ width: 'auto' }}
							value={pagination.pageSize}
							onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
						<span className='text-muted small'>{t('entries')}</span>
					</div>

					{/* Pagination info */}
					<div className='text-muted small'>
						{t('Showing {{start}} to {{end}} of {{total}} entries', {
							start: (pagination.current - 1) * pagination.pageSize + 1,
							end: Math.min(
								pagination.current * pagination.pageSize,
								pagination.total,
							),
							total: pagination.total,
						})}
					</div>

					{/* Pagination controls */}
					<div className='d-flex align-items-center gap-1'>
						{/* First page */}
						<Button
							size='sm'
							color='light'
							icon='FirstPage'
							isDisable={pagination.current === 1}
							onClick={() => handlePageChange(1)}
							aria-label={t('First page')}
						/>

						{/* Previous page */}
						<Button
							size='sm'
							color='light'
							icon='ChevronLeft'
							isDisable={pagination.current === 1}
							onClick={() => handlePageChange(pagination.current - 1)}
							aria-label={t('Previous page')}
						/>

						{/* Page numbers */}
						{getPageNumbers().map((page, index) => (
							<React.Fragment key={index}>
								{page === '...' ? (
									<span className='px-2 text-muted'>...</span>
								) : (
									<Button
										size='sm'
										color={page === pagination.current ? 'primary' : 'light'}
										onClick={() => handlePageChange(page as number)}
										aria-label={t('Page {{page}}', { page })}>
										{page}
									</Button>
								)}
							</React.Fragment>
						))}

						{/* Next page */}
						<Button
							size='sm'
							color='light'
							icon='ChevronRight'
							isDisable={pagination.current === getTotalPages()}
							onClick={() => handlePageChange(pagination.current + 1)}
							aria-label={t('Next page')}
						/>

						{/* Last page */}
						<Button
							size='sm'
							color='light'
							icon='LastPage'
							isDisable={pagination.current === getTotalPages()}
							onClick={() => handlePageChange(getTotalPages())}
							aria-label={t('Last page')}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => current?.[key], obj);
}

export default DynamicTable;
