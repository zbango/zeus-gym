import React, { lazy } from 'react';
import { RouteProps } from 'react-router-dom';
import Login from '../pages/presentation/auth/Login';
import ProtectedRoute from '../components/gym/ProtectedRoute';

const GYM = {
	DASHBOARD: lazy(() => import('../pages/gym-management/GymDashboardPage')),
	MEMBERS_LIST: lazy(() => import('../pages/gym-management/members/MembersListPage')),
	ADD_MEMBER: lazy(() => import('../pages/gym-management/members/AddMemberPage')),
	RENEW_MEMBER: lazy(() => import('../pages/gym-management/members/RenewMemberPage')),
	MEMBER_STATS: lazy(() => import('../pages/gym-management/members/MemberStatsPage')),
	MEMBERSHIP_PLANS: lazy(() => import('../pages/gym-management/memberships/MembershipPlansPage')),
	PAYMENTS: lazy(() => import('../pages/gym-management/memberships/PaymentsPage')),
	RENEWALS: lazy(() => import('../pages/gym-management/memberships/RenewalsPage')),
	PRODUCTS: lazy(() => import('../pages/gym-management/store/ProductsPage')),
	SALES: lazy(() => import('../pages/gym-management/store/SalesPage')),
	INVENTORY: lazy(() => import('../pages/gym-management/store/InventoryPage')),
	USERS: lazy(() => import('../pages/gym-management/users/UsersManagementPage')),
	SETTINGS: lazy(() => import('../pages/gym-management/settings/GymSettingsPage')),
	QR_SCANNER: lazy(() => import('../pages/gym-management/qr-scanner/QRScannerPage')),
};
const AUTH = {
	PAGE_404: lazy(() => import('../pages/presentation/auth/Page404')),
};

const presentation: RouteProps[] = [
	/**
	 * Gym Management System (Protected Routes)
	 */
	{
		path: '/',
		element: (
			<ProtectedRoute>
				<GYM.DASHBOARD />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/dashboard',
		element: (
			<ProtectedRoute>
				<GYM.DASHBOARD />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/members/list',
		element: (
			<ProtectedRoute>
				<GYM.MEMBERS_LIST />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/members/add',
		element: (
			<ProtectedRoute requiredPermission='members.create'>
				<GYM.ADD_MEMBER />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/members/edit/:id',
		element: (
			<ProtectedRoute requiredPermission='members.edit'>
				<GYM.ADD_MEMBER />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/members/renew/:id',
		element: (
			<ProtectedRoute requiredPermission='members.renew'>
				<GYM.RENEW_MEMBER />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/memberships/plans',
		element: (
			<ProtectedRoute requiresAdmin={true}>
				<GYM.MEMBERSHIP_PLANS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/memberships/payments',
		element: (
			<ProtectedRoute requiredPermission='payments.create'>
				<GYM.PAYMENTS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/memberships/renewals',
		element: (
			<ProtectedRoute requiredPermission='renewals.create'>
				<GYM.RENEWALS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/store/products',
		element: (
			<ProtectedRoute requiredPermission='store.create'>
				<GYM.PRODUCTS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/store/sales',
		element: (
			<ProtectedRoute requiredPermission='store.create'>
				<GYM.SALES />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/store/inventory',
		element: (
			<ProtectedRoute requiredPermission='store.edit'>
				<GYM.INVENTORY />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/users',
		element: (
			<ProtectedRoute requiresAdmin={true}>
				<GYM.USERS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/settings',
		element: (
			<ProtectedRoute requiredPermission='settings.view'>
				<GYM.SETTINGS />
			</ProtectedRoute>
		),
	},
	{
		path: '/gym-management/qr-scanner',
		element: (
			<ProtectedRoute>
				<GYM.QR_SCANNER />
			</ProtectedRoute>
		),
	},

	/**
	 * Public Member Stats (Non-protected route for QR code access)
	 */
	{
		path: '/member/:memberId/stats',
		element: <GYM.MEMBER_STATS />,
	},

	/**
	 * Auth Page
	 */
	{
		path: 'auth-pages/404',
		element: <AUTH.PAGE_404 />,
	},
	{
		path: 'auth-pages/login',
		element: <Login />,
	},
];

const contents = [...presentation];

export default contents;
