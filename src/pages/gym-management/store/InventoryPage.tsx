import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockProducts, mockSales } from '../../../common/data/gymMockData';
import { IProduct, ISale } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import classNames from 'classnames';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';

interface ProductAnalytics {
	product: IProduct;
	totalSold: number;
	revenue: number;
	lastSold: string | null;
	turnoverRate: number;
}

const InventoryPage = () => {
	const { t } = useTranslation();
	const { themeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setProducts(mockProducts);

			// Calculate analytics
			const productAnalytics: ProductAnalytics[] = mockProducts.map((product) => {
				const productSales = mockSales.flatMap((sale) =>
					sale.products.filter((p) => p.productId === product.id),
				);

				const totalSold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
				const revenue = productSales.reduce((sum, sale) => sum + sale.total, 0);

				// Find last sale date
				const lastSaleData = mockSales
					.filter((sale) => sale.products.some((p) => p.productId === product.id))
					.sort((a, b) => dayjs(b.saleDate).unix() - dayjs(a.saleDate).unix())[0];

				const lastSold = lastSaleData ? lastSaleData.saleDate : null;

				// Calculate turnover rate (sales per week)
				const weeksAgo = dayjs().diff(dayjs(product.createdDate), 'week') || 1;
				const turnoverRate = totalSold / weeksAgo;

				return {
					product,
					totalSold,
					revenue,
					lastSold,
					turnoverRate,
				};
			});

			setAnalytics(productAnalytics);
			setLoading(false);
		};

		loadData();
	}, []);

	const getStockStatus = (product: IProduct) => {
		if (product.stock === 0) return { color: 'danger', text: t('Out of Stock'), icon: 'Error' };
		if (product.stock <= product.lowStockAlert)
			return { color: 'warning', text: t('Low Stock'), icon: 'Warning' };
		return { color: 'success', text: t('In Stock'), icon: 'CheckCircle' };
	};

	if (loading) {
		return (
			<PageWrapper title={t('Inventory Management')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading inventory...')}</div>
						<div className='text-muted'>{t('Analyzing products and sales')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	const lowStockProducts = products.filter((p) => p.stock <= p.lowStockAlert && p.stock > 0);
	const outOfStockProducts = products.filter((p) => p.stock === 0);
	const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
	const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);

	// Top selling products
	const topSellingProducts = analytics
		.filter((a) => a.totalSold > 0)
		.sort((a, b) => b.totalSold - a.totalSold)
		.slice(0, 5);

	// Slow moving products (low turnover)
	const slowMovingProducts = analytics
		.filter((a) => a.turnoverRate < 1 && a.product.stock > 0)
		.sort((a, b) => a.turnoverRate - b.turnoverRate)
		.slice(0, 5);

	return (
		<PageWrapper title={t('Inventory Overview')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Warehouse' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Complete inventory overview with sales analytics')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color='primary'
						icon='Inventory'
						tag='a'
						to='/gym-management/store/products'>
						{t('Manage Products')}
					</Button>
					<Button
						color='success'
						icon='PointOfSale'
						tag='a'
						to='/gym-management/store/sales'>
						{t('New Sale')}
					</Button>
					<Button
						color={themeStatus}
						icon='Refresh'
						isLight
						onClick={() => window.location.reload()}>
						{t('Refresh')}
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page container='fluid'>
				{/* Alerts */}
				{outOfStockProducts.length > 0 && (
					<Alert color='danger' isLight className='mb-4'>
						<Icon icon='Error' className='me-2' />
						<strong>
							{t('{{count}} products', { count: outOfStockProducts.length })}
						</strong>{' '}
						{t('are out of stock')}:{' '}
						{outOfStockProducts
							.slice(0, 3)
							.map((p) => p.name)
							.join(', ')}
						{outOfStockProducts.length > 3 &&
							t(' and {{count}} more', { count: outOfStockProducts.length - 3 })}
					</Alert>
				)}

				{lowStockProducts.length > 0 && (
					<Alert color='warning' isLight className='mb-4'>
						<Icon icon='Warning' className='me-2' />
						<strong>
							{t('{{count}} products', { count: lowStockProducts.length })}
						</strong>{' '}
						{t('are running low on stock')}:{' '}
						{lowStockProducts
							.slice(0, 3)
							.map((p) => p.name)
							.join(', ')}
						{lowStockProducts.length > 3 &&
							t(' and {{count}} more', { count: lowStockProducts.length - 3 })}
					</Alert>
				)}

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Inventory' size='2x' color='primary' className='mb-2' />
								<div className='h4'>{products.length}</div>
								<div className='text-muted'>{t('Total Products')}</div>
								<small className='text-success'>
									{products.filter((p) => p.stock > 0).length} {t('in stock')}
								</small>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='AttachMoney'
									size='2x'
									color='success'
									className='mb-2'
								/>
								<div className='h4'>{priceFormat(totalValue)}</div>
								<div className='text-muted'>{t('Inventory Value')}</div>
								<small className='text-info'>{t('Current stock value')}</small>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='TrendingUp' size='2x' color='info' className='mb-2' />
								<div className='h4'>{priceFormat(totalRevenue)}</div>
								<div className='text-muted'>{t('Total Revenue')}</div>
								<small className='text-primary'>{t('All-time sales')}</small>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Warning' size='2x' color='warning' className='mb-2' />
								<div className='h4'>
									{lowStockProducts.length + outOfStockProducts.length}
								</div>
								<div className='text-muted'>{t('Stock Alerts')}</div>
								<small className='text-danger'>{t('Needs attention')}</small>
							</CardBody>
						</Card>
					</div>
				</div>

				<div className='row g-4'>
					{/* Product Status Overview */}
					<div className='col-lg-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='Inventory' iconColor='primary'>
									<CardTitle>{t('Product Status Overview')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
								<div className='space-y-3'>
									{analytics.map((item) => {
										const status = getStockStatus(item.product);

										return (
											<div
												key={item.product.id}
												className='d-flex align-items-center justify-content-between p-3 bg-light rounded'>
												<div className='d-flex align-items-center flex-grow-1'>
													<Icon
														icon={status.icon}
														color={status.color as any}
														size='lg'
														className='me-3'
													/>
													<div className='flex-grow-1'>
														<div className='fw-bold'>
															{item.product.name}
														</div>
														<div className='small text-muted'>
															{t('Stock')}: {item.product.stock} •{' '}
															{t('Price')}:{' '}
															{priceFormat(item.product.price)} •{' '}
															{item.totalSold > 0
																? t('Sold: {{count}}', {
																		count: item.totalSold,
																	})
																: t('No sales yet')}
														</div>
													</div>
												</div>
												<div className='text-end'>
													<span className={`badge bg-${status.color}`}>
														{status.text}
													</span>
													<div className='small text-muted mt-1'>
														{t('Value')}:{' '}
														{priceFormat(
															item.product.price * item.product.stock,
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</CardBody>
						</Card>
					</div>

					{/* Analytics */}
					<div className='col-lg-6'>
						{/* Top Selling Products */}
						<Card className='mb-4'>
							<CardHeader>
								<CardLabel icon='TrendingUp' iconColor='success'>
									<CardTitle>{t('Top Selling Products')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{topSellingProducts.length === 0 ? (
									<div className='text-center py-3'>
										<Icon
											icon='BarChart'
											size='2x'
											color='secondary'
											className='mb-2'
										/>
										<div className='text-muted'>
											{t('No sales data available')}
										</div>
									</div>
								) : (
									<div className='space-y-2'>
										{topSellingProducts.map((item, index) => (
											<div
												key={item.product.id}
												className='d-flex align-items-center justify-content-between p-2 rounded bg-light'>
												<div className='d-flex align-items-center'>
													<span
														className={classNames('badge me-2', {
															'bg-warning': index === 0,
															'bg-secondary': index === 1,
															'bg-info': index === 2,
															'bg-light text-dark': index > 2,
														})}>
														#{index + 1}
													</span>
													<div>
														<div className='fw-bold'>
															{item.product.name}
														</div>
														<div className='small text-muted'>
															{t('{{count}} units sold', {
																count: item.totalSold,
															})}
														</div>
													</div>
												</div>
												<div className='text-end'>
													<div className='fw-bold text-success'>
														{priceFormat(item.revenue)}
													</div>
													<div className='small text-muted'>
														{item.turnoverRate.toFixed(1)}/{t('week')}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardBody>
						</Card>

						{/* Slow Moving Products */}
						<Card>
							<CardHeader>
								<CardLabel icon='TrendingDown' iconColor='warning'>
									<CardTitle>{t('Slow Moving Products')}</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody>
								{slowMovingProducts.length === 0 ? (
									<div className='text-center py-3'>
										<Icon
											icon='CheckCircle'
											size='2x'
											color='success'
											className='mb-2'
										/>
										<div className='text-success'>
											{t('All products are selling well!')}
										</div>
									</div>
								) : (
									<div className='space-y-2'>
										{slowMovingProducts.map((item) => (
											<div
												key={item.product.id}
												className='d-flex align-items-center justify-content-between p-2 rounded bg-light'>
												<div>
													<div className='fw-bold'>
														{item.product.name}
													</div>
													<div className='small text-muted'>
														{t('Stock')}: {item.product.stock} •{' '}
														{item.lastSold
															? t('Last sold: {{date}}', {
																	date: dayjs(
																		item.lastSold,
																	).format('DD/MM/YYYY'),
																})
															: t('Never sold')}
													</div>
												</div>
												<div className='text-end'>
													<div className='fw-bold text-warning'>
														{item.turnoverRate.toFixed(1)}/{t('week')}
													</div>
													<div className='small text-muted'>
														{priceFormat(
															item.product.price * item.product.stock,
														)}{' '}
														{t('value')}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default InventoryPage;
