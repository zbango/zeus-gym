import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockSales, mockProducts } from '../../../common/data/gymMockData';
import { ISale, IProduct } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';

interface CartItem {
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

const SalesPage = () => {
	const { t } = useTranslation();
	const { themeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [sales, setSales] = useState<ISale[]>([]);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);
	const [showNewSaleModal, setShowNewSaleModal] = useState(false);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [processing, setProcessing] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setSales(mockSales);
			setProducts(mockProducts);
			setLoading(false);
		};

		loadData();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(sales);

	const saleFormik = useFormik({
		initialValues: {
			customerName: '',
			paymentMethod: 'cash' as 'cash' | 'transfer',
		},
		validate: () => {
			const errors: any = {};

			if (cart.length === 0) {
				errors.cart = t('Add at least one product to the cart');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setProcessing(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

				const newSale: ISale = {
					id: `sale-${Date.now()}`,
					products: cart,
					totalAmount,
					paymentMethod: values.paymentMethod,
					saleDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
					soldBy: 'admin', // In real app, get from auth context
					customerName: values.customerName || undefined,
				};

				setSales((prev) => [newSale, ...prev]);

				// Update product stock
				setProducts((prev) =>
					prev.map((product) => {
						const cartItem = cart.find((item) => item.productId === product.id);
						if (cartItem) {
							return { ...product, stock: product.stock - cartItem.quantity };
						}
						return product;
					}),
				);

				setAlert({
					type: 'success',
					message: t('Sale completed successfully! Total: {{total}}', {
						total: priceFormat(totalAmount),
					}),
				});

				// Reset everything
				resetForm();
				setCart([]);
				setShowNewSaleModal(false);
			} catch {
				setAlert({
					type: 'danger',
					message: t('An error occurred while processing the sale. Please try again.'),
				});
			} finally {
				setProcessing(false);
			}
		},
	});

	const addToCart = (productId: string, quantity: number = 1) => {
		const product = products.find((p) => p.id === productId);
		if (!product) return;

		if (product.stock < quantity) {
			setAlert({
				type: 'warning',
				message: t('Not enough stock for {{product}}. Available: {{stock}}', {
					product: product.name,
					stock: product.stock,
				}),
			});
			return;
		}

		setCart((prev) => {
			const existingItem = prev.find((item) => item.productId === productId);

			if (existingItem) {
				const newQuantity = existingItem.quantity + quantity;
				if (newQuantity > product.stock) {
					setAlert({
						type: 'warning',
						message: t('Cannot add more {{product}}. Max available: {{stock}}', {
							product: product.name,
							stock: product.stock,
						}),
					});
					return prev;
				}

				return prev.map((item) =>
					item.productId === productId
						? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
						: item,
				);
			} else {
				return [
					...prev,
					{
						productId,
						productName: product.name,
						quantity,
						unitPrice: product.price,
						total: quantity * product.price,
					},
				];
			}
		});
	};

	const updateCartQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}

		const product = products.find((p) => p.id === productId);
		if (!product) return;

		if (quantity > product.stock) {
			setAlert({
				type: 'warning',
				message: t('Cannot set quantity to {{quantity}}. Max available: {{stock}}', {
					quantity,
					stock: product.stock,
				}),
			});
			return;
		}

		setCart((prev) =>
			prev.map((item) =>
				item.productId === productId
					? { ...item, quantity, total: quantity * item.unitPrice }
					: item,
			),
		);
	};

	const removeFromCart = (productId: string) => {
		setCart((prev) => prev.filter((item) => item.productId !== productId));
	};

	const getTotalCartValue = () => {
		return cart.reduce((sum, item) => sum + item.total, 0);
	};

	// Auto-hide alerts
	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => {
				setAlert(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

	if (loading) {
		return (
			<PageWrapper title={t('Sales Management')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading sales...')}</div>
						<div className='text-muted'>{t('Please wait')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	const todaySales = sales.filter((sale) => dayjs(sale.saleDate).isSame(dayjs(), 'day'));
	const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
	const thisMonthSales = sales.filter((sale) => dayjs(sale.saleDate).isSame(dayjs(), 'month'));
	const monthlyRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

	return (
		<PageWrapper title={t('Sales Management')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='PointOfSale' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Process new sales and view transaction history')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={() => setShowNewSaleModal(true)}>
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
				{alert && (
					<Alert color={alert.type} isLight className='mb-4'>
						<Icon
							icon={
								alert.type === 'success'
									? 'CheckCircle'
									: alert.type === 'warning'
										? 'Warning'
										: 'Error'
							}
							className='me-2'
						/>
						{alert.message}
					</Alert>
				)}

				{/* Summary Cards */}
				<div className='row g-4 mb-4'>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='PointOfSale'
									size='2x'
									color='primary'
									className='mb-2'
								/>
								<div className='h4'>{sales.length}</div>
								<div className='text-muted'>{t('Total Sales')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Today' size='2x' color='info' className='mb-2' />
								<div className='h4'>{todaySales.length}</div>
								<div className='text-muted'>{t("Today's Sales")}</div>
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
								<div className='h4'>{priceFormat(todayRevenue)}</div>
								<div className='text-muted'>{t("Today's Revenue")}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon
									icon='TrendingUp'
									size='2x'
									color='warning'
									className='mb-2'
								/>
								<div className='h4'>{priceFormat(monthlyRevenue)}</div>
								<div className='text-muted'>{t('Monthly Revenue')}</div>
							</CardBody>
						</Card>
					</div>
				</div>

				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Receipt' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('Sales History')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search sales...')}
								className='me-2'
								style={{ width: '250px' }}
							/>
							<Button color='info' icon='FilterList' isLight>
								{t('Filters')}
							</Button>
						</CardActions>
					</CardHeader>
					<CardBody className='table-responsive' isScrollable>
						<table className='table table-modern table-hover'>
							<thead>
								<tr>
									<th
										onClick={() => requestSort('saleDate')}
										className='cursor-pointer text-decoration-underline'>
										{t('Date & Time')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('saleDate')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Customer')}</th>
									<th>{t('Products')}</th>
									<th
										onClick={() => requestSort('totalAmount')}
										className='cursor-pointer text-decoration-underline'>
										{t('Total')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('totalAmount')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Payment Method')}</th>
									<th>{t('Sold By')}</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(items, currentPage, perPage).map((sale) => (
									<tr key={sale.id}>
										<td>
											<div>
												<div className='fw-bold'>
													{dayjs(sale.saleDate).format('DD/MM/YYYY')}
												</div>
												<div className='small text-muted'>
													{dayjs(sale.saleDate).format('HH:mm:ss')}
												</div>
											</div>
										</td>
										<td>
											<div>
												{sale.customerName ? (
													<div className='fw-bold'>
														{sale.customerName}
													</div>
												) : (
													<div className='text-muted'>
														{t('Walk-in Customer')}
													</div>
												)}
											</div>
										</td>
										<td>
											<div>
												{sale.products
													.slice(0, 2)
													.map((product: any, index: number) => (
														<div key={index} className='small'>
															{product.quantity}x{' '}
															{product.productName}
														</div>
													))}
												{sale.products.length > 2 && (
													<div className='small text-muted'>
														{t('+{{count}} more items', {
															count: sale.products.length - 2,
														})}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className='fw-bold text-success'>
												{priceFormat(sale.totalAmount)}
											</div>
										</td>
										<td>
											<span
												className={`badge bg-${
													sale.paymentMethod === 'cash'
														? 'success'
														: 'info'
												}`}>
												{sale.paymentMethod === 'cash'
													? t('Cash')
													: t('Bank Transfer')}
											</span>
										</td>
										<td>
											<div className='text-muted'>{sale.soldBy}</div>
										</td>
										<td>
											<Button color='info' size='sm' icon='Receipt' isLight>
												{t('Receipt')}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardBody>
					<PaginationButtons
						data={items}
						label='sales'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* New Sale Modal */}
				<Modal
					setIsOpen={setShowNewSaleModal}
					isOpen={showNewSaleModal}
					titleId='newSaleModal'
					size='xl'
					isScrollable>
					<ModalHeader setIsOpen={setShowNewSaleModal}>
						<ModalTitle id='newSaleModal'>{t('New Sale - Point of Sale')}</ModalTitle>
					</ModalHeader>
					<form onSubmit={saleFormik.handleSubmit}>
						<ModalBody>
							<div className='row g-4'>
								{/* Product Selection */}
								<div className='col-md-8'>
									<Card>
										<CardHeader>
											<CardLabel icon='Inventory' iconColor='primary'>
												<CardTitle>{t('Products')}</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
											<div className='row g-3'>
												{products
													.filter((product) => product.stock > 0)
													.map((product) => (
														<div key={product.id} className='col-md-6'>
															<Card
																className='h-100 cursor-pointer'
																onClick={() =>
																	addToCart(product.id)
																}>
																<CardBody>
																	<div className='d-flex justify-content-between align-items-start'>
																		<div className='flex-grow-1'>
																			<div className='fw-bold'>
																				{product.name}
																			</div>
																			<div className='small text-muted mb-2'>
																				{
																					product.description
																				}
																			</div>
																			<div className='fw-bold text-success'>
																				{priceFormat(
																					product.price,
																				)}
																			</div>
																			<div className='small text-muted'>
																				{t('Stock')}:{' '}
																				{product.stock}
																			</div>
																		</div>
																		<Button
																			color='primary'
																			size='sm'
																			icon='Add'
																			onClick={(e: any) => {
																				e.stopPropagation();
																				addToCart(
																					product.id,
																				);
																			}}>
																			{t('Add')}
																		</Button>
																	</div>
																</CardBody>
															</Card>
														</div>
													))}
											</div>
										</CardBody>
									</Card>
								</div>

								{/* Shopping Cart */}
								<div className='col-md-4'>
									<Card>
										<CardHeader>
											<CardLabel icon='ShoppingCart' iconColor='success'>
												<CardTitle>
													{t('Cart')} ({cart.length})
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
											{cart.length === 0 ? (
												<div className='text-center py-4'>
													<Icon
														icon='ShoppingCart'
														size='3x'
														color='secondary'
														className='mb-2'
													/>
													<div className='text-muted'>
														{t('Cart is empty')}
													</div>
													<small className='text-muted'>
														{t('Add products to begin sale')}
													</small>
												</div>
											) : (
												<div className='space-y-3'>
													{cart.map((item) => (
														<div
															key={item.productId}
															className='border rounded p-3'>
															<div className='d-flex justify-content-between align-items-start mb-2'>
																<div className='fw-bold'>
																	{item.productName}
																</div>
																<Button
																	color='danger'
																	size='sm'
																	icon='Delete'
																	isLight
																	onClick={() =>
																		removeFromCart(
																			item.productId,
																		)
																	}
																/>
															</div>
															<div className='row g-2 align-items-center'>
																<div className='col-4'>
																	<small className='text-muted'>
																		{t('Qty')}:
																	</small>
																	<Input
																		type='number'
																		size='sm'
																		value={item.quantity}
																		min={1}
																		max={
																			products.find(
																				(p) =>
																					p.id ===
																					item.productId,
																			)?.stock || 1
																		}
																		onChange={(e: any) =>
																			updateCartQuantity(
																				item.productId,
																				parseInt(
																					e.target.value,
																				) || 1,
																			)
																		}
																	/>
																</div>
																<div className='col-8 text-end'>
																	<div className='small text-muted'>
																		{item.quantity} ×{' '}
																		{priceFormat(
																			item.unitPrice,
																		)}
																	</div>
																	<div className='fw-bold text-success'>
																		{priceFormat(item.total)}
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											)}
										</CardBody>
									</Card>

									{/* Cart Summary */}
									{cart.length > 0 && (
										<Card className='mt-3'>
											<CardBody>
												<div className='d-flex justify-content-between align-items-center mb-3'>
													<span className='h5 mb-0'>{t('Total')}:</span>
													<span className='h4 mb-0 text-success'>
														{priceFormat(getTotalCartValue())}
													</span>
												</div>

												<div className='row g-3'>
													<div className='col-12'>
														<FormGroup
															id='customerName'
															label={t('Customer Name (Optional)')}>
															<Input
																name='customerName'
																onChange={saleFormik.handleChange}
																value={
																	saleFormik.values.customerName
																}
																placeholder={t('Customer name...')}
															/>
														</FormGroup>
													</div>
													<div className='col-12'>
														<FormGroup
															id='paymentMethod'
															label={t('Payment Method')}>
															<Select
																ariaLabel={t(
																	'Select payment method',
																)}
																name='paymentMethod'
																onChange={saleFormik.handleChange}
																value={
																	saleFormik.values.paymentMethod
																}>
																<Option value='cash'>
																	{t('Cash')}
																</Option>
																<Option value='transfer'>
																	{t('Bank Transfer')}
																</Option>
															</Select>
														</FormGroup>
													</div>
												</div>
											</CardBody>
										</Card>
									)}
								</div>
							</div>
						</ModalBody>
						<ModalFooter>
							<Button
								color='secondary'
								onClick={() => {
									setShowNewSaleModal(false);
									setCart([]);
									saleFormik.resetForm();
								}}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='success'
								icon='PointOfSale'
								isDisable={cart.length === 0 || processing}>
								{processing && <Spinner isSmall inButton />}
								{t('Process Sale')} - {priceFormat(getTotalCartValue())}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default SalesPage;
