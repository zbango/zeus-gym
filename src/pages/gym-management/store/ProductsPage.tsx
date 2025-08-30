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
import Textarea from '../../../components/bootstrap/forms/Textarea';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import useSortableData from '../../../hooks/useSortableData';
import useDarkMode from '../../../hooks/useDarkMode';
import { mockProducts } from '../../../common/data/gymMockData';
import { IProduct } from '../../../types/gym-types';
import Spinner from '../../../components/bootstrap/Spinner';
import classNames from 'classnames';
import { priceFormat } from '../../../helpers/helpers';
import Alert from '../../../components/bootstrap/Alert';

const ProductsPage = () => {
	const { t } = useTranslation();
	const { themeStatus, darkModeStatus } = useDarkMode();
	const [loading, setLoading] = useState(true);
	const [products, setProducts] = useState<IProduct[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);
	const [showModal, setShowModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
	const [saving, setSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setProducts(mockProducts);
			setLoading(false);
		};

		loadProducts();
	}, []);

	const { items, requestSort, getClassNamesFor } = useSortableData(products);

	// Filter products based on search
	const filteredProducts = items.filter(
		(product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const formik = useFormik({
		initialValues: {
			name: '',
			price: '',
			stock: '',
			description: '',
			lowStockAlert: '',
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.name) errors.name = t('Product name is required');
			if (!values.price) errors.price = t('Price is required');
			if (!values.stock) errors.stock = t('Stock quantity is required');
			if (!values.lowStockAlert) errors.lowStockAlert = t('Low stock alert is required');

			if (values.price && parseInt(values.price) <= 0) {
				errors.price = t('Price must be greater than 0');
			}

			if (values.stock && parseInt(values.stock) < 0) {
				errors.stock = t('Stock cannot be negative');
			}

			if (values.lowStockAlert && parseInt(values.lowStockAlert) < 0) {
				errors.lowStockAlert = t('Low stock alert cannot be negative');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			setSaving(true);

			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1500));

				const productData: IProduct = {
					id: editingProduct ? editingProduct.id : `product-${Date.now()}`,
					name: values.name,
					price: parseInt(values.price),
					stock: parseInt(values.stock),
					description: values.description || undefined,
					lowStockAlert: parseInt(values.lowStockAlert),
					createdDate: editingProduct
						? editingProduct.createdDate
						: dayjs().format('YYYY-MM-DD'),
				};

				if (editingProduct) {
					setProducts((prev) =>
						prev.map((product) =>
							product.id === editingProduct.id ? productData : product,
						),
					);
					setAlert({
						type: 'success',
						message: t('Product "{{name}}" has been updated successfully!', {
							name: values.name,
						}),
					});
				} else {
					setProducts((prev) => [productData, ...prev]);
					setAlert({
						type: 'success',
						message: t('Product "{{name}}" has been added successfully!', {
							name: values.name,
						}),
					});
				}

				resetForm();
				setShowModal(false);
				setEditingProduct(null);
			} catch (error) {
				setAlert({
					type: 'danger',
					message: t('An error occurred while saving the product. Please try again.'),
				});
			} finally {
				setSaving(false);
			}
		},
	});

	const handleEditProduct = (product: IProduct) => {
		setEditingProduct(product);
		formik.setValues({
			name: product.name,
			price: product.price.toString(),
			stock: product.stock.toString(),
			description: product.description || '',
			lowStockAlert: product.lowStockAlert.toString(),
		});
		setShowModal(true);
	};

	const handleAddProduct = () => {
		setEditingProduct(null);
		formik.resetForm();
		setShowModal(true);
	};

	const handleDeleteProduct = async (productId: string) => {
		if (!confirm(t('Are you sure you want to delete this product?'))) return;

		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setProducts((prev) => prev.filter((product) => product.id !== productId));
		setAlert({
			type: 'success',
			message: t('Product has been deleted successfully!'),
		});
		setSaving(false);
	};

	const handleUpdateStock = async (productId: string, newStock: number) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setProducts((prev) =>
			prev.map((product) =>
				product.id === productId ? { ...product, stock: newStock } : product,
			),
		);
		setSaving(false);
	};

	const getStockStatus = (product: IProduct) => {
		if (product.stock === 0) return { color: 'danger', text: t('Out of Stock') };
		if (product.stock <= product.lowStockAlert)
			return { color: 'warning', text: t('Low Stock') };
		return { color: 'success', text: t('In Stock') };
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
			<PageWrapper title={t('Products Management')}>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>{t('Loading products...')}</div>
						<div className='text-muted'>{t('Please wait')}</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	const lowStockProducts = products.filter((p) => p.stock <= p.lowStockAlert);
	const outOfStockProducts = products.filter((p) => p.stock === 0);
	const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

	return (
		<PageWrapper title={t('Products Management')}>
			<SubHeader>
				<SubHeaderLeft>
					<Icon icon='Inventory' className='me-2' size='2x' />
					<span className='text-muted'>
						{t('Manage your gym store inventory and products')}
					</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='success' icon='Add' onClick={handleAddProduct}>
						{t('Add Product')}
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
							icon={alert.type === 'success' ? 'CheckCircle' : 'Error'}
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
								<Icon icon='Inventory' size='2x' color='primary' className='mb-2' />
								<div className='h4'>{products.length}</div>
								<div className='text-muted'>{t('Total Products')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Warning' size='2x' color='warning' className='mb-2' />
								<div className='h4'>{lowStockProducts.length}</div>
								<div className='text-muted'>{t('Low Stock')}</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-xl-3 col-md-6'>
						<Card className='mb-0'>
							<CardBody className='text-center'>
								<Icon icon='Error' size='2x' color='danger' className='mb-2' />
								<div className='h4'>{outOfStockProducts.length}</div>
								<div className='text-muted'>{t('Out of Stock')}</div>
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
							</CardBody>
						</Card>
					</div>
				</div>

				{/* Low Stock Alerts */}
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

				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='Inventory' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								{t('Product Inventory')}
							</CardTitle>
						</CardLabel>
						<CardActions>
							<Input
								type='search'
								placeholder={t('Search products...')}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
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
										onClick={() => requestSort('name')}
										className='cursor-pointer text-decoration-underline'>
										{t('Product')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('name')}
											icon='FilterList'
										/>
									</th>
									<th
										onClick={() => requestSort('price')}
										className='cursor-pointer text-decoration-underline'>
										{t('Price')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('price')}
											icon='FilterList'
										/>
									</th>
									<th
										onClick={() => requestSort('stock')}
										className='cursor-pointer text-decoration-underline'>
										{t('Stock')}{' '}
										<Icon
											size='lg'
											className={getClassNamesFor('stock')}
											icon='FilterList'
										/>
									</th>
									<th>{t('Status')}</th>
									<th>{t('Low Stock Alert')}</th>
									<th>{t('Total Value')}</th>
									<th>{t('Created')}</th>
									<td aria-labelledby='Actions' />
								</tr>
							</thead>
							<tbody>
								{dataPagination(filteredProducts, currentPage, perPage).map(
									(product) => {
										const stockStatus = getStockStatus(product);

										return (
											<tr key={product.id}>
												<td>
													<div>
														<div className='fw-bold'>
															{product.name}
														</div>
														{product.description && (
															<div className='small text-muted'>
																{product.description}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className='fw-bold'>
														{priceFormat(product.price)}
													</div>
												</td>
												<td>
													<div className='d-flex align-items-center'>
														<span
															className={classNames('fw-bold me-2', {
																'text-danger': product.stock === 0,
																'text-warning':
																	product.stock <=
																		product.lowStockAlert &&
																	product.stock > 0,
																'text-success':
																	product.stock >
																	product.lowStockAlert,
															})}>
															{product.stock}
														</span>
														<div className='d-flex gap-1'>
															<Button
																color='success'
																size='sm'
																icon='Add'
																isLight
																onClick={() =>
																	handleUpdateStock(
																		product.id,
																		product.stock + 1,
																	)
																}
																isDisable={saving}>
																+1
															</Button>
															<Button
																color='warning'
																size='sm'
																icon='Remove'
																isLight
																onClick={() =>
																	handleUpdateStock(
																		product.id,
																		Math.max(
																			0,
																			product.stock - 1,
																		),
																	)
																}
																isDisable={
																	saving || product.stock === 0
																}>
																-1
															</Button>
														</div>
													</div>
												</td>
												<td>
													<span
														className={`badge bg-${stockStatus.color}`}>
														{stockStatus.text}
													</span>
												</td>
												<td>
													<span className='text-muted'>
														{product.lowStockAlert}
													</span>
												</td>
												<td>
													<div className='fw-bold'>
														{priceFormat(product.price * product.stock)}
													</div>
												</td>
												<td>
													<span className='text-muted'>
														{dayjs(product.createdDate).format(
															'DD/MM/YYYY',
														)}
													</span>
												</td>
												<td>
													<div className='d-flex gap-1'>
														<Button
															color='info'
															size='sm'
															icon='Edit'
															isLight
															onClick={() =>
																handleEditProduct(product)
															}>
															{t('Edit')}
														</Button>
														<Button
															color='danger'
															size='sm'
															icon='Delete'
															isLight
															onClick={() =>
																handleDeleteProduct(product.id)
															}
															isDisable={saving}>
															{t('Delete')}
														</Button>
													</div>
												</td>
											</tr>
										);
									},
								)}
							</tbody>
						</table>
					</CardBody>
					<PaginationButtons
						data={filteredProducts}
						label='products'
						setCurrentPage={setCurrentPage}
						currentPage={currentPage}
						perPage={perPage}
						setPerPage={setPerPage}
					/>
				</Card>

				{/* Add/Edit Product Modal */}
				<Modal setIsOpen={setShowModal} isOpen={showModal} titleId='productModal' size='lg'>
					<ModalHeader setIsOpen={setShowModal}>
						<ModalTitle id='productModal'>
							{editingProduct ? t('Edit Product') : t('Add New Product')}
						</ModalTitle>
					</ModalHeader>
					<form onSubmit={formik.handleSubmit}>
						<ModalBody>
							<div className='row g-3'>
								<div className='col-md-6'>
									<FormGroup
										id='name'
										label={t('Product Name')}
										isRequired
										invalidFeedback={formik.errors.name}>
										<Input
											name='name'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.name}
											placeholder='e.g., Proteína Whey 2kg'
											isValid={formik.touched.name && !formik.errors.name}
											isTouched={formik.touched.name && !!formik.errors.name}
											invalidFeedback={formik.errors.name}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='price'
										label={t('Price (USD)')}
										isRequired
										invalidFeedback={formik.errors.price}>
										<Input
											type='number'
											name='price'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.price}
											placeholder='85'
											min='0'
											isValid={formik.touched.price && !formik.errors.price}
											isTouched={
												formik.touched.price && !!formik.errors.price
											}
											invalidFeedback={formik.errors.price}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='stock'
										label={t('Stock Quantity')}
										isRequired
										invalidFeedback={formik.errors.stock}>
										<Input
											type='number'
											name='stock'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.stock}
											placeholder='15'
											min='0'
											isValid={formik.touched.stock && !formik.errors.stock}
											isTouched={
												formik.touched.stock && !!formik.errors.stock
											}
											invalidFeedback={formik.errors.stock}
										/>
									</FormGroup>
								</div>
								<div className='col-md-6'>
									<FormGroup
										id='lowStockAlert'
										label={t('Low Stock Alert')}
										isRequired
										invalidFeedback={formik.errors.lowStockAlert}>
										<Input
											type='number'
											name='lowStockAlert'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.lowStockAlert}
											placeholder='5'
											min='0'
											isValid={
												formik.touched.lowStockAlert &&
												!formik.errors.lowStockAlert
											}
											isTouched={
												formik.touched.lowStockAlert &&
												!!formik.errors.lowStockAlert
											}
											invalidFeedback={formik.errors.lowStockAlert}
										/>
									</FormGroup>
								</div>
								<div className='col-12'>
									<FormGroup id='description' label={t('Description (Optional)')}>
										<Textarea
											name='description'
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											value={formik.values.description}
											placeholder={t('Product description...')}
											rows={3}
										/>
									</FormGroup>
								</div>

								{/* Preview */}
								{formik.values.name &&
									formik.values.price &&
									formik.values.stock && (
										<div className='col-12'>
											<div className='alert alert-info'>
												<h6>{t('Product Preview')}:</h6>
												<strong>{formik.values.name}</strong> -{' '}
												{priceFormat(parseInt(formik.values.price || '0'))}
												<br />
												<small>
													{t('Stock')}: {formik.values.stock} {t('units')}{' '}
													•{t('Alert when')} ≤{' '}
													{formik.values.lowStockAlert} {t('units')}
													<br />
													{t('Total Value')}:{' '}
													{priceFormat(
														parseInt(formik.values.price || '0') *
															parseInt(formik.values.stock || '0'),
													)}
													{formik.values.description && (
														<>
															<br />
															{t('Description')}:{' '}
															{formik.values.description}
														</>
													)}
												</small>
											</div>
										</div>
									)}
							</div>
						</ModalBody>
						<ModalFooter>
							<Button color='secondary' onClick={() => setShowModal(false)}>
								{t('Cancel')}
							</Button>
							<Button
								type='submit'
								color='primary'
								icon={editingProduct ? 'Save' : 'Add'}
								isDisable={!formik.isValid || saving}>
								{saving && <Spinner isSmall inButton />}
								{editingProduct ? t('Update Product') : t('Add Product')}
							</Button>
						</ModalFooter>
					</form>
				</Modal>
			</Page>
		</PageWrapper>
	);
};

export default ProductsPage;
