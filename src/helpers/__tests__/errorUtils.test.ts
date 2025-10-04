import { extractErrorMessage } from '../errorUtils';

describe('extractErrorMessage', () => {
	it('should extract error message from nested error structure', () => {
		const error = {
			data: {
				error: {
					message: "Customer with identification '1003620398' already exists",
				},
			},
		};

		const result = extractErrorMessage(error, 'Fallback message');

		expect(result).toBe("Customer with identification '1003620398' already exists");
	});

	it('should extract error message from direct data.message', () => {
		const error = {
			data: {
				message: 'Some other error message',
			},
		};

		const result = extractErrorMessage(error, 'Fallback message');

		expect(result).toBe('Some other error message');
	});

	it('should extract error message from top-level message', () => {
		const error = {
			message: 'Top level error message',
		};

		const result = extractErrorMessage(error, 'Fallback message');

		expect(result).toBe('Top level error message');
	});

	it('should use fallback when no error message found', () => {
		const error = {};

		const result = extractErrorMessage(error, 'Fallback message');

		expect(result).toBe('Fallback message');
	});

	it('should include status in fallback for network errors', () => {
		const error = {
			status: 500,
		};

		const result = extractErrorMessage(error, 'Fallback message');

		expect(result).toBe('Fallback message (Status: 500)');
	});
});
