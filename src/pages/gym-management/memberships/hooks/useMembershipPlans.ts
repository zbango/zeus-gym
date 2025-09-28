import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockMembershipPlans } from '../../../../common/data/gymMockData';
import { IMembershipPlan } from '../../../../types/gym-types';

export const useMembershipPlans = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [plans, setPlans] = useState<IMembershipPlan[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingPlan, setEditingPlan] = useState<IMembershipPlan | null>(null);
	const [saving, setSaving] = useState(false);
	const [alert, setAlert] = useState<{
		type: 'success' | 'warning' | 'danger';
		message: string;
	} | null>(null);

	// Load plans on mount
	useEffect(() => {
		const loadPlans = async () => {
			setLoading(true);
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setPlans(mockMembershipPlans);
			setLoading(false);
		};

		loadPlans();
	}, []);

	// Auto-hide alerts
	useEffect(() => {
		if (alert) {
			const timer = setTimeout(() => {
				setAlert(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [alert]);

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
		setSaving(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const planData: IMembershipPlan = {
				id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
				name: values.name,
				type: values.type,
				price: parseInt(values.price),
				duration: values.type === 'monthly' ? parseInt(values.duration) : undefined,
				visitCount: values.type === 'count-based' ? parseInt(values.visitCount) : undefined,
				description: values.description,
				isActive: values.isActive,
			};

			if (editingPlan) {
				setPlans((prev) =>
					prev.map((plan) => (plan.id === editingPlan.id ? planData : plan)),
				);
				setAlert({
					type: 'success',
					message: t('Plan "{{name}}" has been updated successfully!', {
						name: values.name,
					}),
				});
			} else {
				setPlans((prev) => [planData, ...prev]);
				setAlert({
					type: 'success',
					message: t('Plan "{{name}}" has been created successfully!', {
						name: values.name,
					}),
				});
			}

			setShowModal(false);
			setEditingPlan(null);
		} catch (error) {
			setAlert({
				type: 'danger',
				message: t('An error occurred while saving the plan. Please try again.'),
			});
		} finally {
			setSaving(false);
		}
	};

	const handleToggleStatus = async (planId: string) => {
		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setPlans((prev) =>
			prev.map((plan) => (plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan)),
		);
		setSaving(false);
	};

	const handleDeletePlan = async (planId: string) => {
		if (!confirm(t('Are you sure you want to delete this plan?'))) return;

		setSaving(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 500));

		setPlans((prev) => prev.filter((plan) => plan.id !== planId));
		setAlert({
			type: 'success',
			message: t('Plan has been deleted successfully!'),
		});
		setSaving(false);
	};

	return {
		// State
		loading,
		plans,
		showModal,
		editingPlan,
		saving,
		alert,

		// Actions
		handleAddPlan,
		handleEditPlan,
		handleCloseModal,
		handleSubmitPlan,
		handleToggleStatus,
		handleDeletePlan,
	};
};
