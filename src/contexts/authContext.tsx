import React, { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { getUserDataWithUsername, IUserProps } from '../common/data/userDummyData';
import { IGymUser } from '../types/gym-types';
import authService from '../services/authService';

// Helper function to convert gym user to template user format (for template compatibility)
const mapGymUserToTemplateUser = (gymUser: IGymUser): Partial<IUserProps> => {
	console.log('🔄 AuthContext: Mapping gym user to template user:', gymUser);
	return {
		id: gymUser.id,
		username: gymUser.username,
		fullName: gymUser.fullName.split(' ')[0] || gymUser.fullName,
		position: gymUser.role === 'admin' ? 'Gym Administrator' : 'Gym Staff',
		email: gymUser.email,
		isOnline: true,
		color: gymUser.role === 'admin' ? 'primary' : 'info',
		password: gymUser.password,
		// Use default images since gym users don't have specific avatars
		src: '',
		srcSet: '',
	};
};

export interface IAuthContextProps {
	// Original template auth
	user: string;
	setUser?(...args: unknown[]): unknown;
	userData: Partial<IUserProps>;

	// Gym auth integration
	gymUser: IGymUser | null;
	gymLogin: (username: string, password: string) => Promise<boolean>;
	gymLogout: () => Promise<void>;
	isGymAuthenticated: boolean;
	isGymAdmin: boolean;
	isGymStaff: boolean;
	hasGymPermission: (permission: string) => boolean;
	gymLoading: boolean;
}
const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}
export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	// Original template auth
	const [user, setUser] = useState<string>(localStorage.getItem('facit_authUsername') || '');
	const [userData, setUserData] = useState<Partial<IUserProps>>({});

	// Gym auth state
	const [gymUser, setGymUser] = useState<IGymUser | null>(null);
	const [gymLoading, setGymLoading] = useState(true);

	// Initialize gym auth from localStorage and API
	useEffect(() => {
		const initGymAuth = async () => {
			console.log('🔄 AuthContext: Initializing gym auth on refresh');
			setGymLoading(true);

			try {
				// Check if user is authenticated
				if (authService.isAuthenticated()) {
					// Try to get user profile from API
					const gymUser = await authService.getMe();

					setGymUser(gymUser);
					// Also set template user data for compatibility
					setUser(gymUser.username);
					setUserData(mapGymUserToTemplateUser(gymUser));
					console.log('✅ Gym user restored from API:', gymUser.username);
				} else {
					console.log('❌ No valid authentication found');
					// Clear any stale data
					authService.logout();
				}
			} catch (error) {
				console.error('❌ Failed to restore gym user:', error);
				// Clear authentication on error
				authService.logout();
			} finally {
				setGymLoading(false);
				console.log('🔄 Gym auth initialization complete');
			}
		};

		initGymAuth();
	}, []);

	// Original template auth effects
	useEffect(() => {
		localStorage.setItem('facit_authUsername', user);
	}, [user]);

	useEffect(() => {
		if (user !== '') {
			setUserData(getUserDataWithUsername(user));
		} else {
			setUserData({});
		}
	}, [user]);

	// Gym auth functions
	const gymLogin = async (username: string, password: string): Promise<boolean> => {
		setGymLoading(true);

		try {
			// Authenticate with API
			await authService.login(username, password);

			// Get user profile
			const gymUser = await authService.getMe();

			setGymUser(gymUser);
			// Also set template user data for compatibility
			setUser(gymUser.username);
			setUserData(mapGymUserToTemplateUser(gymUser));

			setGymLoading(false);
			return true;
		} catch (error) {
			console.error('Login failed:', error);
			setGymLoading(false);
			return false;
		}
	};

	const gymLogout = async () => {
		// Clear API tokens and stored data
		await authService.logout();

		setGymUser(null);
		// Also clear template user data
		setUser('');
		setUserData({});
	};

	const value = useMemo(() => {
		const hasGymPermission = (permission: string): boolean => {
			if (!gymUser) return false;
			return gymUser.permissions.includes(permission) || gymUser.permissions.includes('all');
		};

		return {
			// Original template auth
			user,
			setUser,
			userData,

			// Gym auth
			gymUser,
			gymLogin,
			gymLogout,
			isGymAuthenticated: !!gymUser,
			isGymAdmin: gymUser?.role === 'admin',
			isGymStaff: gymUser?.role === 'staff' || gymUser?.role === 'admin',
			hasGymPermission,
			gymLoading,
		};
	}, [user, userData, gymUser, gymLoading]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
