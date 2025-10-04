// Base types
export interface BaseEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
}

// API Payload types for customer registration
export interface CustomerRegistrationPayload {
	// Personal Information
	name: string;
	lastName: string;
	dateOfBirth: string;
	email?: string;
	phone?: string;
	address?: string;
	identification?: string;
	medicalConditions?: string;

	// Progress Information (Required)
	age: number;
	gender: 'male' | 'female';
	height: number; // in cm
	weight: number; // in kg
	chest?: number; // in cm
	waist?: number; // in cm
	hip?: number; // in cm
	arms?: number; // in cm
	thighs?: number; // in cm

	// Membership Information (Required)
	membershipPlanId: string;
	startDate: string;
	totalAmount: number;

	// Payment Information (Required)
	initialPaymentAmount: number;
	paymentMethod: 'cash' | 'transfer';
	paymentReference?: string;
	paymentNotes?: string;
}

// API Payload types for customer update
export interface CustomerUpdatePayload {
	name?: string;
	lastName?: string;
	dateOfBirth?: string;
	email?: string;
	phone?: string;
	address?: string;
	identification?: string;
	medicalConditions?: string;
	status?: 'active' | 'inactive' | 'suspended';
}

// Legacy types for backward compatibility
export interface PersonalInfo {
	name: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	birthDate: string;
	identification: string;
}

export interface HealthInfo {
	age: number;
	gender: string;
	height: number; // in cm
	currentWeight: number; // in kg
	chest?: number; // in cm
	waist?: number; // in cm
	hips?: number; // in cm
	arms?: number; // in cm
	thighs?: number; // in cm
	medicalConditions?: string;
}

export interface ProgressMeasurement {
	date: string;
	weight: number;
	bodyFat?: number;
	chest?: number;
	waist?: number;
	arms?: number;
	notes?: string;
}

export interface ProgressTracking {
	measurements: ProgressMeasurement[];
}

export interface MembershipInfo {
	type: 'monthly' | 'count-based';
	plan: string;
	startDate: string;
	endDate?: string;
	remainingVisits?: number;
	status: 'active' | 'inactive' | 'suspended' | 'expired';
	totalAmount?: number;
	paidAmount?: number;
	remainingAmount?: number;
}

// Main Member interface
export interface Member extends BaseEntity {
	personalInfo: PersonalInfo;
	healthInfo: HealthInfo;
	progressTracking: ProgressTracking;
	membershipInfo: MembershipInfo;
	registrationDate: string;
	status: 'active' | 'inactive' | 'suspended' | 'expired';
}

// API Request/Response types
export interface CreateMemberRequest extends CustomerRegistrationPayload {}

export interface UpdateMemberRequest extends CustomerUpdatePayload {
	id: string;
}

// Legacy types for backward compatibility
export interface LegacyCreateMemberRequest {
	personalInfo: PersonalInfo;
	healthInfo: Omit<HealthInfo, 'id'>;
	membershipInfo: Omit<MembershipInfo, 'id'>;
}

export interface LegacyUpdateMemberRequest extends Partial<LegacyCreateMemberRequest> {
	id: string;
}

export interface MemberListResponse {
	members: Member[];
	total: number;
	page: number;
	limit: number;
}

export interface MemberListParams {
	page: number;
	limit: number;
	search?: string;
	status?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

// Table configuration types
export interface TableColumn<T = any> {
	key: string;
	title: string;
	dataIndex: keyof T | string;
	width?: number;
	sortable?: boolean;
	filterable?: boolean;
	render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableConfig<T = any> {
	columns: TableColumn<T>[];
	rowKey: keyof T;
	pagination?: {
		pageSize: number;
		showSizeChanger: boolean;
		showQuickJumper: boolean;
	};
	selection?: {
		type: 'checkbox' | 'radio';
		onSelect?: (selectedRows: T[]) => void;
	};
}
