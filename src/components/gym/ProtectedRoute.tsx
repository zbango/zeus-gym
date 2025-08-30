import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Spinner from '../bootstrap/Spinner';
import Alert from '../bootstrap/Alert';
import Icon from '../icon/Icon';

interface IProtectedRouteProps {
	children: React.ReactNode;
	requiredPermission?: string;
	requiresAdmin?: boolean;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({
	children,
	requiredPermission,
	requiresAdmin = false,
}) => {
	const { isGymAuthenticated, gymLoading, gymUser, hasGymPermission, isGymAdmin } =
		useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();

	// Debug any navigation that happens
	const originalNavigate = navigate;
	const debugNavigate = (...args) => {
		console.log('🚨 NAVIGATION DETECTED FROM PROTECTED ROUTE:', args);
		console.trace('Navigation stack trace');
		return originalNavigate(...args);
	};

	console.log('ProtectedRoute render:', {
		isGymAuthenticated,
		gymLoading,
		user: gymUser?.username,
		pathname: location.pathname,
	});

	useEffect(() => {
		console.log('ProtectedRoute useEffect:', {
			gymLoading,
			isGymAuthenticated,
			pathname: location.pathname,
		});
		// Only redirect if we're sure the user is not authenticated and loading is complete
		if (!gymLoading && !isGymAuthenticated && location.pathname !== '/auth-pages/login') {
			console.log('ProtectedRoute: Redirecting to login');
			// Store the attempted location for redirect after login
			localStorage.setItem('gym_redirect_after_login', location.pathname);
			debugNavigate('/auth-pages/login');
		}
	}, [isGymAuthenticated, gymLoading]);

	// Show loading spinner while checking authentication
	if (gymLoading) {
		return (
			<PageWrapper title='Loading...'>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<div className='text-center'>
						<Spinner size='3rem' className='mb-3' />
						<div className='h5'>Checking authentication...</div>
						<div className='text-muted'>Please wait</div>
					</div>
				</div>
			</PageWrapper>
		);
	}

	// If not authenticated, don't render anything (will redirect to login)
	if (!isGymAuthenticated) {
		return null;
	}

	// Check admin requirement
	if (requiresAdmin && !isGymAdmin) {
		return (
			<PageWrapper title='Access Denied'>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<Alert color='danger' className='text-center'>
						<Icon icon='AdminPanelSettings' size='2x' className='mb-3' />
						<div className='h4'>Administrator Access Required</div>
						<div>You need administrator privileges to access this page.</div>
						<div className='mt-3'>
							<small className='text-muted'>
								Current role: <strong>{gymUser?.role || 'Unknown'}</strong>
							</small>
						</div>
					</Alert>
				</div>
			</PageWrapper>
		);
	}

	// Check specific permission requirement
	if (requiredPermission && !hasGymPermission(requiredPermission)) {
		return (
			<PageWrapper title='Access Denied'>
				<div
					className='d-flex justify-content-center align-items-center'
					style={{ minHeight: '60vh' }}>
					<Alert color='warning' className='text-center'>
						<Icon icon='Block' size='2x' className='mb-3' />
						<div className='h4'>Permission Required</div>
						<div>You don't have permission to access this page.</div>
						<div className='mt-3'>
							<small className='text-muted'>
								Required: <strong>{requiredPermission}</strong>
								<br />
								Your role: <strong>{gymUser?.role || 'Unknown'}</strong>
							</small>
						</div>
					</Alert>
				</div>
			</PageWrapper>
		);
	}

	// User is authenticated and has required permissions
	return <>{children}</>;
};

export default ProtectedRoute;
