// Gym Management System Types

export interface IMember {
	id: string;
	personalInfo: {
		name: string;
		lastName: string;
		email: string;
		phone: string;
		address: string;
		birthDate: string;
		identification: string;
		emergencyContact: {
			name: string;
			phone: string;
			relationship: string;
		};
	};
	healthInfo: {
		age: number;
		gender: string;
		height: number; // cm
		currentWeight: number; // kg
		chest?: number; // cm
		waist?: number; // cm
		hips?: number; // cm
		arms?: number; // cm
		thighs?: number; // cm
		medicalConditions?: string;
		goals: string;
	};
	progressTracking: {
		measurements: {
			date: string;
			weight: number;
			bodyFat?: number;
			muscle?: number;
			chest?: number;
			waist?: number;
			hips?: number;
			arms?: number;
			thighs?: number;
			notes?: string;
		}[];
	};
	membershipInfo: {
		type: 'monthly' | 'count-based';
		plan: string;
		startDate: string;
		endDate?: string;
		remainingVisits?: number;
		status: 'active' | 'inactive' | 'suspended' | 'expired';
	};
	registrationDate: string;
	photo?: string;
}

export interface IMembershipPlan {
	id: string;
	name: string;
	type: 'monthly' | 'count-based';
	price: number;
	duration?: number; // months for monthly plans
	visitCount?: number; // visits for count-based plans
	description: string;
	status: 'active' | 'inactive';
}

export interface IPayment {
	id: string;
	memberId: string;
	membershipPlanId: string;
	totalAmount: number;
	paidAmount: number;
	remainingAmount: number;
	paymentMethod: 'cash' | 'transfer';
	payments: {
		id: string;
		date: string;
		amount: number;
		method: 'cash' | 'transfer';
		notes?: string;
		receivedBy: string;
	}[];
	status: 'pending' | 'partial' | 'completed';
	dueDate: string;
	createdDate: string;
}

export interface ICheckIn {
	id: string;
	memberId: string;
	memberName: string;
	checkInTime: string;
	checkOutTime?: string;
	membershipType: 'monthly' | 'count-based';
	visitDeducted: boolean;
	duration?: number; // minutes
}

export interface IProduct {
	id: string;
	name: string;
	price: number;
	stock: number;
	description?: string;
	lowStockAlert: number;
	createdDate: string;
}

export interface ISale {
	id: string;
	products: {
		productId: string;
		productName: string;
		quantity: number;
		unitPrice: number;
		total: number;
	}[];
	totalAmount: number;
	paymentMethod: 'cash' | 'transfer';
	saleDate: string;
	soldBy: string;
	customerName?: string;
}

// User interface for gym management system
export interface IGymUser {
	id: string;
	username: string;
	role: 'admin' | 'staff';
	fullName: string;
	email: string;
	phone?: string;
	permissions: string[];
	password?: string;
	status: 'active' | 'inactive';
	lastLogin?: string | null;
	createdAt: string;
	isActive: boolean;
}

export interface IGymSettings {
	gymName: string;
	address: string;
	phone: string;
	email: string;
	openingHours: {
		monday: { open: string; close: string };
		tuesday: { open: string; close: string };
		wednesday: { open: string; close: string };
		thursday: { open: string; close: string };
		friday: { open: string; close: string };
		saturday: { open: string; close: string };
		sunday: { open: string; close: string };
	};
	currency: string;
	timezone: string;
}

export interface IDashboardStats {
	totalMembers: number;
	activeMembers: number;
	monthlyRevenue: number;
	dailyCheckIns: number;
	pendingPayments: number;
	lowStockProducts: number;
	expiringMemberships: number;
}
