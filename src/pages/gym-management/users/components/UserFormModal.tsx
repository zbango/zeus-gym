import React from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../../components/bootstrap/Modal';
import FormGroup from '../../../../components/bootstrap/forms/FormGroup';
import Input from '../../../../components/bootstrap/forms/Input';
import Select from '../../../../components/bootstrap/forms/Select';
import Option from '../../../../components/bootstrap/Option';
import Button from '../../../../components/bootstrap/Button';
import Spinner from '../../../../components/bootstrap/Spinner';
import { IGymUser } from '../../../../types/gym-types';

interface UserFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	editingUser: IGymUser | null;
	onSubmit: (values: any) => Promise<void>;
	saving: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
	isOpen,
	onClose,
	editingUser,
	onSubmit,
	saving,
}) => {
	const { t } = useTranslation();

	const formik = useFormik({
		initialValues: {
			name: '',
			username: '',
			email: '',
			phone: '',
			role: 'staff' as 'admin' | 'staff',
		},
		validate: (values) => {
			const errors: any = {};

			if (!values.name) errors.name = t('Name is required');
			if (!values.username) errors.username = t('Username is required');
			if (!values.email) errors.email = t('Email is required');
			if (!values.phone) errors.phone = t('Phone is required');

			// Email validation
			if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
				errors.email = t('Invalid email address');
			}

			// Phone validation (basic)
			if (values.phone && !/^[\d\s\-\+\(\)]+$/.test(values.phone)) {
				errors.phone = t('Invalid phone number');
			}

			return errors;
		},
		onSubmit: async (values, { resetForm }) => {
			try {
				// Add action property to payload
				const payload = {
					...values,
					action: editingUser ? 'update' : 'create',
				};
				await onSubmit(payload);
				resetForm();
				onClose();
			} catch (error) {
				// Error handling is done in the parent component
			}
		},
	});

	// Update form values when editing user changes
	React.useEffect(() => {
		if (editingUser) {
			formik.setValues({
				name: editingUser.fullName,
				username: editingUser.username,
				email: editingUser.email,
				phone: (editingUser as any).phone || '',
				role: editingUser.role,
			});
		} else {
			formik.resetForm();
		}
	}, [editingUser]);

	return (
		<Modal setIsOpen={onClose} isOpen={isOpen} titleId='userModal' size='lg' isScrollable>
			<ModalHeader setIsOpen={onClose}>
				<ModalTitle id='userModal'>
					{editingUser ? t('Edit User') : t('Add New User')}
				</ModalTitle>
			</ModalHeader>
			<form onSubmit={formik.handleSubmit}>
				<ModalBody>
					<div className='row g-3'>
						<div className='col-md-6'>
							<FormGroup id='name' label={t('Full Name')}>
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
							<FormGroup id='username' label={t('Username')}>
								<Input
									name='username'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.username}
									isValid={formik.touched.username && !formik.errors.username}
									isTouched={formik.touched.username && !!formik.errors.username}
									invalidFeedback={formik.errors.username}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='email' label={t('Email Address')}>
								<Input
									type='email'
									name='email'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.email}
									isValid={formik.touched.email && !formik.errors.email}
									isTouched={formik.touched.email && !!formik.errors.email}
									invalidFeedback={formik.errors.email}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='phone' label={t('Phone Number')}>
								<Input
									name='phone'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.phone}
									isValid={formik.touched.phone && !formik.errors.phone}
									isTouched={formik.touched.phone && !!formik.errors.phone}
									invalidFeedback={formik.errors.phone}
								/>
							</FormGroup>
						</div>
						<div className='col-md-6'>
							<FormGroup id='role' label={t('Role')}>
								<Select
									ariaLabel={t('Select role')}
									name='role'
									onChange={formik.handleChange}
									value={formik.values.role}>
									<Option value='staff'>{t('Staff')}</Option>
									<Option value='admin'>{t('Administrator')}</Option>
								</Select>
							</FormGroup>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button
						type='submit'
						color='primary'
						icon={editingUser ? 'Save' : 'PersonAdd'}
						isDisable={!formik.isValid || saving}>
						{saving && <Spinner isSmall inButton />}
						{editingUser ? t('Update User') : t('Create User')}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	);
};

export default UserFormModal;
