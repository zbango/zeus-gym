// Authentication API Service
const AUTH_BASE_URL = 'https://3ipuc0xlr0.execute-api.us-east-1.amazonaws.com/primary/api/v1';
const API_BASE_URL = 'https://l7h1170n95.execute-api.us-east-1.amazonaws.com/primary/api/v1';

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	idToken: string;
}

import { IGymUser } from '../types/gym-types';

class AuthService {
	private baseURL: string;
	private apiBaseURL: string;
	constructor() {
		this.baseURL = AUTH_BASE_URL;
		this.apiBaseURL = API_BASE_URL;
	}

	/**
	 * Authenticate user with username and password
	 */
	async login(username: string, password: string): Promise<LoginResponse> {
		try {
			const response = await fetch(`${this.baseURL}/signin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username,
					password,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Login failed with status ${response.status}`);
			}

			const data: LoginResponse = await response.json();

			// Store tokens in localStorage
			localStorage.setItem('gym_access_token', data.accessToken);
			localStorage.setItem('gym_refresh_token', data.refreshToken);
			localStorage.setItem('gym_id_token', data.idToken);

			return data;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	}

	/**
	 * Get user profile using stored access token
	 */
	async getMe(): Promise<IGymUser> {
		const token = localStorage.getItem('gym_access_token');

		if (!token) {
			throw new Error('No access token found');
		}

		try {
			const response = await fetch(`${this.apiBaseURL}/me`, {
				method: 'GET',
				headers: {
					Authorization: `${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					// Token expired, try to refresh
					await this.refreshToken();
					// Retry with new token
					return this.getMe();
				}
				throw new Error(`Failed to get user profile: ${response.status}`);
			}

			const userProfile: IGymUser = await response.json();

			// Store user profile
			localStorage.setItem('gym_user_profile', JSON.stringify(userProfile));

			return userProfile;
		} catch (error) {
			console.error('Get user profile error:', error);
			throw error;
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshToken(): Promise<LoginResponse> {
		const refreshToken = localStorage.getItem('gym_refresh_token');

		if (!refreshToken) {
			throw new Error('No refresh token found');
		}

		try {
			const response = await fetch(`${this.baseURL}/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					refreshToken,
				}),
			});

			if (!response.ok) {
				throw new Error('Token refresh failed');
			}

			const data: LoginResponse = await response.json();

			// Update stored tokens
			localStorage.setItem('gym_access_token', data.accessToken);
			localStorage.setItem('gym_refresh_token', data.refreshToken);
			localStorage.setItem('gym_id_token', data.idToken);

			return data;
		} catch (error) {
			console.error('Token refresh error:', error);
			// Clear tokens on refresh failure
			this.logout();
			throw error;
		}
	}

	/**
	 * Logout user and clear stored tokens
	 */
	async logout(): Promise<void> {
		const token = localStorage.getItem('gym_access_token');

		if (token) {
			try {
				// Call logout API
				await fetch(`${this.baseURL}/signout`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: token,
					},
					body: JSON.stringify({
						accessToken: token,
					}),
				});
			} catch (error) {
				console.error('Logout API call failed:', error);
				// Continue with local cleanup even if API call fails
			}
		}

		// Clear local storage
		localStorage.removeItem('gym_access_token');
		localStorage.removeItem('gym_refresh_token');
		localStorage.removeItem('gym_id_token');
		localStorage.removeItem('gym_user_profile');
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		const token = localStorage.getItem('gym_access_token');
		return !!token;
	}

	/**
	 * Get stored access token
	 */
	getAccessToken(): string | null {
		return localStorage.getItem('gym_access_token');
	}

	/**
	 * Get stored user profile
	 */
	getStoredUserProfile(): IGymUser | null {
		const profile = localStorage.getItem('gym_user_profile');
		return profile ? JSON.parse(profile) : null;
	}
}

const authService = new AuthService();
export default authService;
