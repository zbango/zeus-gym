// Base types
export interface BaseEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
}

// Member related types
export interface PersonalInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
	name: string;
	phone: string;
	relationship: string;
}

export interface HealthInfo {
	age: number;
	height: number; // in cm
	currentWeight: number; // in kg
	medicalConditions?: string;
	goals?: string;
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
}

// Main Member interface
export interface Member extends BaseEntity {
	personalInfo: PersonalInfo;
	healthInfo: HealthInfo;
	progressTracking: ProgressTracking;
	membershipInfo: MembershipInfo;
	registrationDate: string;
}

// API Request/Response types
export interface CreateMemberRequest {
	personalInfo: Omit<PersonalInfo, 'emergencyContact'> & {
		emergencyContact: Omit<EmergencyContact, 'id'>;
	};
	healthInfo: Omit<HealthInfo, 'id'>;
	membershipInfo: Omit<MembershipInfo, 'id'>;
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
	id: string;
}

export interface MemberListResponse {
	members: Member[];
	total: number;
	page: number;
	limit: number;
}

export interface MemberListParams {
	page?: number;
	limit?: number;
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
