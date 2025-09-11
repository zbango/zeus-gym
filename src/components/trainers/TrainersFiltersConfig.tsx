import { FilterField } from '../common/AdvancedFilters';

export const trainersAdvancedFilterFields: FilterField[] = [
	{
		key: 'specialization',
		label: 'Specialization',
		icon: 'FitnessCenter',
		type: 'select',
		options: [
			{ value: 'strength', label: 'Strength Training' },
			{ value: 'cardio', label: 'Cardio' },
			{ value: 'yoga', label: 'Yoga' },
			{ value: 'pilates', label: 'Pilates' },
			{ value: 'crossfit', label: 'CrossFit' },
		],
	},
	{
		key: 'experienceRange',
		label: 'Experience Range',
		icon: 'Work',
		type: 'range',
		unit: 'years',
		placeholder: {
			min: 'Min',
			max: 'Max',
		},
	},
	{
		key: 'certification',
		label: 'Certification',
		icon: 'School',
		type: 'select',
		options: [
			{ value: 'certified', label: 'Certified' },
			{ value: 'uncertified', label: 'Uncertified' },
		],
	},
	{
		key: 'availability',
		label: 'Availability',
		icon: 'Schedule',
		type: 'select',
		options: [
			{ value: 'available', label: 'Available' },
			{ value: 'busy', label: 'Busy' },
			{ value: 'offline', label: 'Offline' },
		],
	},
	{
		key: 'ratingRange',
		label: 'Rating Range',
		icon: 'Star',
		type: 'range',
		placeholder: {
			min: 'Min',
			max: 'Max',
		},
	},
	{
		key: 'hireDateRange',
		label: 'Hire Date',
		icon: 'CalendarToday',
		type: 'date-range',
		placeholder: {
			start: 'Start Date',
			end: 'End Date',
		},
	},
];

export const trainersStatusOptions = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
	{ value: 'on-leave', label: 'On Leave' },
	{ value: 'terminated', label: 'Terminated' },
];
