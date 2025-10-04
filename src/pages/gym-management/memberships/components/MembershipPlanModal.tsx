import React from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../../components/bootstrap/Modal';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import Textarea from '../../../../components/bootstrap/forms/Textarea';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import Checks from '../../../../components/bootstrap/forms/Checks';
import Button from '../../../../components/bootstrap/Button';
import Spinner from '../../../../components/bootstrap/Spinner';
import { IMembershipPlan } from '../../../../types/gym-types';
import { priceFormat } from '../../../../helpers/helpers';

interface MembershipPlanModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: any) => Promise<void>;
	editingPlan: IMembershipPlan | null;
	saving: boolean;
}

const MembershipPlanModal: React.FC<MembershipPlanModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	editingPlan,
	saving,
}) => {
	const { t } = useTranslation();

	const formik = useFormik({
		initialValues: {
			name: '',
			type: 'monthly' as 'monthly' | 'count-based',
			price: '',
			duration: '',
			visitCount: '',
			description: '',
			status: 'active',
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.name) errors.name = t('Plan name is required');
			if (!values.price) errors.price = t('Price is required');

			if (values.type === 'monthly' && !values.duration) {
				errors.duration = t('Duration is required for monthly plans');
			}

			if (values.type === 'count-based' && !values.visitCount) {
				errors.visitCount = t('Visit count is required for count-based plans');
			}

			if (values.price && parseInt(values.price) <= 0) {
				errors.price = t('Price must be greater than 0');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			await onSubmit(values);
			resetForm();
		},
	});

	// Update form values when editingPlan changes
	React.useEffect(() => {
		if (editingPlan) {
			formik.setValues({
				name: editingPlan.name,
				type: editingPlan.type,
				price: editingPlan.price.toString(),
				duration: editingPlan.duration ? editingPlan.duration.toString() : '',
				visitCount: editingPlan.visitCount ? editingPlan.visitCount.toString() : '',
				description: editingPlan.description,
				status: editingPlan.status,
			});
		} else {
			// Reset to initial values for new plan
			formik.setValues({
				name: '',
				type: 'monthly',
				price: '',
				duration: '',
				visitCount: '',
				description: '',
				status: 'active',
			});
		}
	}, [editingPlan]);

	return (
		<Modal setIsOpen={onClose} isOpen={isOpen} titleId='planModal' size='lg' isScrollable>
			<ModalHeader setIsOpen={onClose}>
				<ModalTitle id='planModal'>
					{editingPlan ? t('Edit Membership Plan') : t('Add New Membership Plan')}
				</ModalTitle>
			</ModalHeader>
			<form onSubmit={formik.handleSubmit}>
				<ModalBody>
					<div className='row g-3'>
						<div className='col-md-6'>
							<FormGroup id='name' label={t('Plan Name')}>
								<Input
									name='name'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.name}
									isValid={formik.touched.name && !formik.errors.name}
									isTouched={formik.touched.name && !!formik.errors.name}
									invalidFeedback={formik.errors.name}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='type' label={t('Plan Type')}>
								<Select
									ariaLabel={t('Select plan type')}
									name='type'
									onChange={(e) => {
										formik.handleChange(e);
										// Reset duration/visitCount when type changes
										formik.setFieldValue('duration', '');
										formik.setFieldValue('visitCount', '');
									}}
									onBlur={formik.handleBlur}
									value={formik.values.type}>
									<Option value='monthly'>{t('Monthly Plan')}</Option>
									<Option value='count-based'>{t('Count-based Plan')}</Option>
								</Select>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='price' label={t('Price (USD)')}>
								<Input
									type='number'
									name='price'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.price}
									min={0}
									isValid={formik.touched.price && !formik.errors.price}
									isTouched={formik.touched.price && !!formik.errors.price}
									invalidFeedback={formik.errors.price}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							{formik.values.type === 'monthly' ? (
								<FormGroup id='duration' label={t('Duration (months)')}>
									<Input
										type='number'
										name='duration'
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										value={formik.values.duration}
										min={1}
										max={12}
										isValid={formik.touched.duration && !formik.errors.duration}
										isTouched={
											formik.touched.duration && !!formik.errors.duration
										}
										invalidFeedback={formik.errors.duration}
									/>
								</FormGroup>
							) : (
								<FormGroup id='visitCount' label={t('Number of Visits')}>
									<Input
										type='number'
										name='visitCount'
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										value={formik.values.visitCount}
										min={1}
										max={100}
										isValid={
											formik.touched.visitCount && !formik.errors.visitCount
										}
										isTouched={
											formik.touched.visitCount && !!formik.errors.visitCount
										}
										invalidFeedback={formik.errors.visitCount}
									/>
								</FormGroup>
							)}
						</div>
						<div className='col-12'>
							<FormGroup id='description' label={t('Description')}>
								<Textarea
									name='description'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.description}
									placeholder={t('Describe what this plan includes...')}
									rows={3}
									isValid={
										formik.touched.description && !formik.errors.description
									}
									isTouched={
										formik.touched.description && !!formik.errors.description
									}
									invalidFeedback={formik.errors.description}
								/>
							</FormGroup>
						</div>
						<div className='col-12'>
							<FormGroup>
								<Checks
									id='status'
									type='switch'
									label={
										formik.values.status === 'active'
											? t('Plan is active')
											: t('Plan is inactive')
									}
									name='status'
									onChange={(e) => {
										formik.setFieldValue(
											'status',
											e.target.checked ? 'active' : 'inactive',
										);
									}}
									checked={formik.values.status === 'active'}
								/>
							</FormGroup>
						</div>

						{/* Preview */}
						{formik.values.name && formik.values.price && (
							<div className='col-12'>
								<div className='alert alert-light'>
									<div className='row'>
										<div className='col-12'>
											<strong>{formik.values.name}</strong>
										</div>
										<div className='col-12'>
											{priceFormat(parseInt(formik.values.price || '0'))}
										</div>
										<div className='col-12'>
											<small>
												{formik.values.type === 'monthly'
													? t('Duration: {{duration}} month(s)', {
															duration: formik.values.duration || 1,
															count:
																parseInt(formik.values.duration) ||
																1,
														})
													: t('Visits: {{count}}', {
															count:
																parseInt(
																	formik.values.visitCount,
																) || 1,
														})}
											</small>
										</div>
										{formik.values.description && (
											<div className='col-12'>
												<small>{formik.values.description}</small>
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button
						type='submit'
						color='primary'
						icon={editingPlan ? 'Save' : 'Add'}
						isDisable={!formik.isValid || saving}>
						{saving && <Spinner isSmall inButton />}
						{editingPlan ? t('Update Plan') : t('Create Plan')}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default MembershipPlanModal;
