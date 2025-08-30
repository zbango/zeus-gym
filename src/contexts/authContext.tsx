import React, { createContext, FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { getUserDataWithUsername, IUserProps } from '../common/data/userDummyData';
import { IGymUser } from '../types/gym-types';
import { mockGymUsers } from '../common/data/gymMockData';

// Helper function to convert gym user to template user format
const mapGymUserToTemplateUser = (gymUser: IGymUser): Partial<IUserProps> => {
	return {
		id: gymUser.id,
		username: gymUser.username,
		name: gymUser.name.split(' ')[0] || gymUser.name,
		surname: gymUser.name.split(' ')[1] || '',
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
	gymLogout: () => void;
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

	// Initialize gym auth from localStorage
	useEffect(() => {
		const initGymAuth = () => {
			console.log('🔄 AuthContext: Initializing gym auth on refresh');
			setGymLoading(true);
			const storedUserId = localStorage.getItem('gym_auth_user_id');
			console.log('🔄 Stored user ID:', storedUserId);

			if (storedUserId) {
				const foundUser = mockGymUsers.find((u) => u.id === storedUserId);
				console.log('🔄 Found user from storage:', foundUser?.username);
				if (foundUser) {
					setGymUser(foundUser);
					// Also set template user data for compatibility
					setUser(foundUser.username);
					setUserData(mapGymUserToTemplateUser(foundUser));
					console.log('✅ Gym user restored from localStorage');
				} else {
					console.log('❌ Invalid stored user, clearing localStorage');
					localStorage.removeItem('gym_auth_user_id');
				}
			} else {
				console.log('❌ No stored user found');
			}
			setGymLoading(false);
			console.log('🔄 Gym auth initialization complete');
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
			await new Promise((resolve) => setTimeout(resolve, 300));

			const foundUser = mockGymUsers.find(
				(u) => u.username === username && u.password === password,
			);

			if (foundUser) {
				setGymUser(foundUser);
				// Also set template user data for compatibility
				setUser(foundUser.username);
				setUserData(mapGymUserToTemplateUser(foundUser));
				localStorage.setItem('gym_auth_user_id', foundUser.id);
				setGymLoading(false);
				return true;
			} else {
				setGymLoading(false);
				return false;
			}
		} catch {
			setGymLoading(false);
			return false;
		}
	};

	const gymLogout = () => {
		setGymUser(null);
		// Also clear template user data
		setUser('');
		setUserData({});
		localStorage.removeItem('gym_auth_user_id');
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
