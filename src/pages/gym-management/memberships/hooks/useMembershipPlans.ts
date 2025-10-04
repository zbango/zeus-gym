import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { IMembershipPlan } from '../../../../types/gym-types';
import {
	useGetMembershipPlansQuery,
	useCreateMembershipPlanMutation,
	useUpdateMembershipPlanMutation,
	useDeleteMembershipPlanMutation,
	useToggleMembershipPlanStatusMutation,
} from '../../../../store/api/membershipPlansApi';

export const useMembershipPlans = () => {
	const { t } = useTranslation();
	const [showModal, setShowModal] = useState(false);
	const [editingPlan, setEditingPlan] = useState<IMembershipPlan | null>(null);

	// API hooks
	const { data: plansData, isLoading: loading, error } = useGetMembershipPlansQuery({});
	const [createPlan, { isLoading: creatingPlan }] = useCreateMembershipPlanMutation();
	const [updatePlan, { isLoading: updatingPlan }] = useUpdateMembershipPlanMutation();
	const [deletePlan, { isLoading: deletingPlan }] = useDeleteMembershipPlanMutation();
	const [toggleStatus, { isLoading: togglingStatus }] = useToggleMembershipPlanStatusMutation();

	const plans = plansData?.plans || [];
	const saving = creatingPlan || updatingPlan || deletingPlan || togglingStatus;

	const handleAddPlan = () => {
		setEditingPlan(null);
		setShowModal(true);
	};

	const handleEditPlan = (plan: IMembershipPlan) => {
		setEditingPlan(plan);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingPlan(null);
	};

	const handleSubmitPlan = async (values: any) => {
		try {
			const planData = {
				name: values.name,
				type: values.type,
				price: parseInt(values.price),
				duration: values.type === 'monthly' ? parseInt(values.duration) : undefined,
				visitCount: values.type === 'count-based' ? parseInt(values.visitCount) : undefined,
				description: values.description,
				status: values.status,
			};

			if (editingPlan) {
				await updatePlan({ id: editingPlan.id, ...planData }).unwrap();
				toast.success(
					t('Plan "{{name}}" has been updated successfully!', {
						name: values.name,
					}),
				);
			} else {
				await createPlan(planData).unwrap();
				toast.success(
					t('Plan "{{name}}" has been created successfully!', {
						name: values.name,
					}),
				);
			}

			setShowModal(false);
			setEditingPlan(null);
		} catch (error: any) {
			toast.error(
				error?.data?.message ||
					t('An error occurred while saving the plan. Please try again.'),
			);
		}
	};

	const handleToggleStatus = async (planId: string) => {
		try {
			const plan = plans.find((p) => p.id === planId);
			if (plan) {
				await toggleStatus({
					id: planId,
					status: plan.status === 'active' ? 'inactive' : 'active',
				}).unwrap();
				toast.success(t('Plan status has been updated successfully!'));
			}
		} catch (error: any) {
			toast.error(
				error?.data?.message || t('An error occurred while updating the plan status.'),
			);
		}
	};

	const handleDeletePlan = async (planId: string) => {
		if (!confirm(t('Are you sure you want to delete this plan?'))) return;

		try {
			await deletePlan(planId).unwrap();
			toast.success(t('Plan has been deleted successfully!'));
		} catch (error: any) {
			toast.error(error?.data?.message || t('An error occurred while deleting the plan.'));
		}
	};

	return {
		// State
		loading,
		plans,
		showModal,
		editingPlan,
		saving,

		// Actions
		handleAddPlan,
		handleEditPlan,
		handleCloseModal,
		handleSubmitPlan,
		handleToggleStatus,
		handleDeletePlan,
	};
};
