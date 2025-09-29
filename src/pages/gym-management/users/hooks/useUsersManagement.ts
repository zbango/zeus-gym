import { useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { IGymUser } from '../../../../types/gym-types';
import AuthContext from '../../../../contexts/authContext';
import {
	useGetUsersQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
} from '../../../../store/api/usersApi';

export const useUsersManagement = () => {
	const { t } = useTranslation();
	const { user: currentUser, hasGymPermission: hasPermission } = useContext(AuthContext);

	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	const [showModal, setShowModal] = useState(false);
	const [editingUser, setEditingUser] = useState<IGymUser | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	// RTK Query hooks
	const {
		data: usersData,
		isLoading: loading,
		error: usersError,
		refetch: refetchUsers,
	} = useGetUsersQuery({
		page: currentPage,
		pageSize: perPage,
		search: searchTerm,
	});

	const [createUser, { isLoading: creatingUser }] = useCreateUserMutation();
	const [updateUser, { isLoading: updatingUser }] = useUpdateUserMutation();

	// Extract users from API response
	const users = usersData?.users || [];
	const saving = creatingUser || updatingUser;

	const handleAddUser = useCallback(() => {
		setEditingUser(null);
		setShowModal(true);
	}, []);

	const handleEditUser = useCallback((user: IGymUser) => {
		setEditingUser(user);
		setShowModal(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setShowModal(false);
		setEditingUser(null);
	}, []);

	const handleSubmitUser = useCallback(
		async (values: any) => {
			try {
				if (editingUser) {
					// Update existing user
					await updateUser({
						id: editingUser.id,
						fullName: values.name,
						username: values.username,
						email: values.email,
						phone: values.phone,
						role: values.role,
						action: 'update',
					}).unwrap();
					toast.success(
						t('User "{{name}}" has been updated successfully!', {
							name: values.name,
						}),
					);
				} else {
					// Create new user
					await createUser({
						fullName: values.name,
						username: values.username,
						email: values.email,
						phone: values.phone,
						role: values.role,
						action: 'create',
					}).unwrap();
					toast.success(
						t('User "{{name}}" has been created successfully!', {
							name: values.name,
						}),
					);
				}
			} catch (error) {
				console.error('Error saving user:', error);
				toast.error(t('An error occurred while saving the user. Please try again.'));
				throw error; // Re-throw to let the form handle it
			}
		},
		[editingUser, createUser, updateUser, t],
	);

	const handleRefresh = useCallback(async () => {
		try {
			await refetchUsers();
			toast.success(t('Users list refreshed successfully!'));
		} catch (error) {
			console.error('Failed to refresh users:', error);
			toast.error(t('Failed to refresh users list.'));
		}
	}, [refetchUsers, t]);

	const handleSearchChange = useCallback((search: string) => {
		setSearchTerm(search);
	}, []);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handlePerPageChange = useCallback((newPerPage: number) => {
		setPerPage(newPerPage);
		setCurrentPage(1);
	}, []);

	return {
		// State
		loading,
		users,
		currentPage,
		perPage,
		showModal,
		editingUser,
		saving,
		searchTerm,
		hasPermission,
		currentUserId: (currentUser as any)?.id,

		// Actions
		handleAddUser,
		handleEditUser,
		handleCloseModal,
		handleSubmitUser,
		handleRefresh,
		handleSearchChange,
		handlePageChange,
		handlePerPageChange,
	};
};
