/**
 * Utility functions for handling API errors
 */

/**
 * Extracts error message from API response with fallbacks
 * @param error - The error object from API call
 * @param fallbackMessage - Default message if no specific error found
 * @returns The error message to display
 */
export const extractErrorMessage = (error: any, fallbackMessage: string): string => {
	// Check for nested error structure: error.data.error.message
	if (error?.data?.error?.message) {
		return error.data.error.message;
	}

	// Check for status text in case of network errors
	if (error?.status) {
		return `${fallbackMessage} (Status: ${error.status})`;
	}

	// Return fallback message
	return fallbackMessage;
};

/**
 * Common error messages for different operations
 */
export const ERROR_MESSAGES = {
	CREATE_MEMBER: 'Failed to create member. Please try again.',
	UPDATE_MEMBER: 'Failed to update member. Please try again.',
	DELETE_MEMBER: 'Failed to delete member. Please try again.',
	UPDATE_STATUS: 'Failed to update member status. Please try again.',
	GENERAL: 'An error occurred. Please try again.',
} as const;
