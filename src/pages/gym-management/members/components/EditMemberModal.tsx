import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useUpdateMemberMutation } from '../../../../store/api/membersApi';
import { UpdateMemberRequest } from '../../../../types/member.types';
import { extractErrorMessage } from '../../../../helpers/errorUtils';
import Modal, { ModalBody, ModalHeader } from '../../../../components/bootstrap/Modal';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import Textarea from '../../../../components/bootstrap/forms/Textarea';
import Button from '../../../../components/bootstrap/Button';
import Spinner from '../../../../components/bootstrap/Spinner';

interface EditMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	member: any;
	onSuccess?: () => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
	isOpen,
	onClose,
	member,
	onSuccess,
}) => {
	const { t } = useTranslation();
	const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();

	const [initialValues, setInitialValues] = useState({
		name: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		dateOfBirth: '',
		identification: '',
		medicalConditions: '',
	});

	// Populate form when member data changes
	useEffect(() => {
		if (member) {
			setInitialValues({
				name: member.personalInfo?.name || '',
				lastName: member.personalInfo?.lastName || '',
				email: member.personalInfo?.email || '',
				phone: member.personalInfo?.phone || '',
				address: member.personalInfo?.address || '',
				dateOfBirth: member.personalInfo?.birthDate || '',
				identification: member.personalInfo?.identification || '',
				medicalConditions: member.healthInfo?.medicalConditions || '',
			});
		}
	}, [member]);

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validate: (values) => {
			const errors: any = {};

			// Required fields
			if (!values.name) errors.name = t('Name is required');
			if (!values.lastName) errors.lastName = t('Last name is required');
			if (!values.dateOfBirth) errors.dateOfBirth = t('Date of birth is required');
			if (!values.identification) errors.identification = t('Identification is required');

			// Email validation
			if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
				errors.email = t('Invalid email address');
			}

			return errors;
		},
		onSubmit: async (values) => {
			try {
				const updateData: UpdateMemberRequest = {
					id: member.id,
					name: values.name,
					lastName: values.lastName,
					dateOfBirth: values.dateOfBirth,
					email: values.email,
					phone: values.phone,
					address: values.address,
					identification: values.identification,
					medicalConditions: values.medicalConditions,
				};

				await updateMember(updateData).unwrap();

				toast.success(
					t('Member {{name}} has been successfully updated!', {
						name: `${values.name} ${values.lastName}`,
					}),
				);

				onSuccess?.();
				onClose();
			} catch (error: any) {
				console.error('Error updating member:', error);

				const errorMessage = extractErrorMessage(
					error,
					t('An error occurred while updating the member. Please try again.'),
				);

				toast.error(errorMessage);
			}
		},
	});

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='lg' isScrollable>
			<ModalHeader setIsOpen={onClose}>
				<h4 className='modal-title'>
					{t('Edit Member')}: {member?.personalInfo?.name}{' '}
					{member?.personalInfo?.lastName}
				</h4>
			</ModalHeader>
			<ModalBody>
				<form onSubmit={formik.handleSubmit}>
					<div className='row g-3'>
						<div className='col-md-6'>
							<FormGroup id='name' label={t('Name')}>
								<Input
									name='name'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.name}
									isValid={formik.isValid}
									isTouched={formik.touched.name && !!formik.errors.name}
									invalidFeedback={formik.errors.name}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='lastName' label={t('Last Name')}>
								<Input
									name='lastName'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.lastName}
									isValid={formik.isValid}
									isTouched={formik.touched.lastName && !!formik.errors.lastName}
									invalidFeedback={formik.errors.lastName}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='email' label={t('Email')}>
								<Input
									type='email'
									name='email'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.email}
									isValid={formik.isValid}
									isTouched={formik.touched.email && !!formik.errors.email}
									invalidFeedback={formik.errors.email}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='phone' label={t('Phone')}>
								<Input
									type='tel'
									name='phone'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.phone}
									placeholder='+593 999 123 456'
									isValid={formik.isValid}
									isTouched={formik.touched.phone && !!formik.errors.phone}
									invalidFeedback={formik.errors.phone}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='dateOfBirth' label={t('Date of Birth')}>
								<Input
									type='date'
									name='dateOfBirth'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.dateOfBirth}
									isValid={formik.isValid}
									isTouched={
										formik.touched.dateOfBirth && !!formik.errors.dateOfBirth
									}
									invalidFeedback={formik.errors.dateOfBirth}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='identification' label={t('Identification')}>
								<Input
									name='identification'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.identification}
									placeholder={t('ID number or passport')}
									isValid={formik.isValid}
									isTouched={
										formik.touched.identification &&
										!!formik.errors.identification
									}
									invalidFeedback={formik.errors.identification}
								/>
							</FormGroup>
						</div>
						<div className='col-12'>
							<FormGroup id='address' label={t('Address')}>
								<Textarea
									name='address'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.address}
									rows={2}
									placeholder={t('Full address...')}
								/>
							</FormGroup>
						</div>
						<div className='col-12'>
							<FormGroup id='medicalConditions' label={t('Medical Conditions')}>
								<Textarea
									name='medicalConditions'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.medicalConditions}
									rows={2}
									placeholder={t(
										'Any medical conditions or injuries to be aware of...',
									)}
								/>
							</FormGroup>
						</div>
					</div>

					<div className='d-flex justify-content-end gap-3 mt-4'>
						<Button
							type='button'
							color='secondary'
							onClick={onClose}
							isDisable={isUpdating}>
							{t('Cancel')}
						</Button>
						<Button
							type='submit'
							color='primary'
							icon='Save'
							isDisable={!formik.isValid || isUpdating}>
							{isUpdating && <Spinner isSmall inButton />}
							{isUpdating ? t('Updating...') : t('Update Member')}
						</Button>
					</div>
				</form>
			</ModalBody>
		</Modal>
	);
};

export default EditMemberModal;
