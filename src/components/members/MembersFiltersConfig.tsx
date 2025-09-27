import { FilterField } from '../common/AdvancedFilters';

export const membersAdvancedFilterFields: FilterField[] = [
	{
		key: 'membershipType',
		label: 'Membership Type',
		icon: 'CardMembership',
		type: 'select',
		options: [
			{ value: 'monthly', label: 'Monthly' },
			{ value: 'count-based', label: 'Count-based' },
		],
	},
	{
		key: 'ageRange',
		label: 'Age Range',
		icon: 'Cake',
		type: 'range',
		placeholder: {
			min: 'Min',
			max: 'Max',
		},
	},
	{
		key: 'weightRange',
		label: 'Weight Range',
		icon: 'Scale',
		type: 'range',
		unit: 'kg',
		placeholder: {
			min: 'Min',
			max: 'Max',
		},
	},
	{
		key: 'heightRange',
		label: 'Height Range',
		icon: 'Height',
		type: 'range',
		unit: 'cm',
		placeholder: {
			min: 'Min',
			max: 'Max',
		},
	},
	{
		key: 'paymentStatus',
		label: 'Payment Status',
		icon: 'Payment',
		type: 'select',
		options: [
			{ value: 'up-to-date', label: 'Up to date' },
			{ value: 'pending', label: 'Pending' },
			{ value: 'overdue', label: 'Overdue' },
		],
	},
	{
		key: 'gender',
		label: 'Gender',
		icon: 'Person',
		type: 'select',
		options: [
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' },
		],
	},
	{
		key: 'registrationDateRange',
		label: 'Registration Date',
		icon: 'CalendarToday',
		type: 'date-range',
		placeholder: {
			start: 'Start Date',
			end: 'End Date',
		},
	},
];

export const membersStatusOptions = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
	{ value: 'suspended', label: 'Suspended' },
	{ value: 'expired', label: 'Expired' },
];
