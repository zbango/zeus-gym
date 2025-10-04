import React, { FC, useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Logo from '../../../components/Logo';
import useDarkMode from '../../../hooks/useDarkMode';
import AuthContext from '../../../contexts/authContext';
import USERS, { getUserDataWithUsername } from '../../../common/data/userDummyData';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import Icon from '../../../components/icon/Icon';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}
interface ILoginHeaderExtendedProps extends ILoginHeaderProps {
	isGymMode?: boolean;
}

const LoginHeader: FC<ILoginHeaderExtendedProps> = ({ isNewUser, isGymMode }) => {
	const { t } = useTranslation();

	if (isGymMode) {
		return (
			<>
				<div className='text-center h1 fw-bold'>{t('Gym Management System')}</div>
				<div className='text-center h4 text-muted mb-3'>
					{t('Sign in to access your gym dashboard')}
				</div>
			</>
		);
	}
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>{t('Welcome')},</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: FC<ILoginProps> = ({ isSignUp }) => {
	const { gymLogin } = useContext(AuthContext);
	const { t } = useTranslation();

	const { darkModeStatus } = useDarkMode();

	const [gymLoginError, setGymLoginError] = useState<string>('');
	const [gymLoading, setGymLoading] = useState<boolean>(false);

	const navigate = useNavigate();
	const handleGymLogin = useCallback(() => {
		// Check if there's a stored redirect path
		const redirectPath = localStorage.getItem('gym_redirect_after_login');
		console.log('handleGymLogin - redirectPath:', redirectPath);
		if (redirectPath) {
			localStorage.removeItem('gym_redirect_after_login');
			console.log('Navigating to stored path:', redirectPath);
			navigate(redirectPath, { replace: true });
		} else {
			console.log('Navigating to default dashboard');
			navigate('/gym-management/dashboard', { replace: true });
		}
	}, [navigate]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginUsername: '',
			loginPassword: '',
		},
		validate: (values) => {
			const errors: { loginUsername?: string; loginPassword?: string } = {};

			if (!values.loginUsername) {
				errors.loginUsername = t('Required');
			}

			if (!values.loginPassword) {
				errors.loginPassword = t('Required');
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			// Gym Authentication Only
			setGymLoading(true);
			setGymLoginError('');

			try {
				const success = await gymLogin(values.loginUsername, values.loginPassword);
				console.log('success', success);
				if (success) {
					handleGymLogin();
				} else {
					setGymLoginError(t('Invalid username or password for gym system.'));
				}
			} catch (error) {
				setGymLoginError(t('An error occurred during gym login.'));
			} finally {
				setGymLoading(false);
			}
		},
	});

	return (
		<PageWrapper isProtected={false} title='Login' className={classNames({ 'bg-dark': true })}>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
							<CardBody>
								<div className='text-center my-3'>
									<Link
										to='/'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='Zeus Gym'>
										<Logo width={200} height={150} />
									</Link>
								</div>

								<LoginHeader isNewUser={false} isGymMode={true} />

								{gymLoginError && (
									<Alert color='danger' isLight className='mb-3'>
										<Icon icon='Error' className='me-2' />
										{gymLoginError}
									</Alert>
								)}

								<form className='row g-4'>
									<>
										<div className='col-12'>
											<FormGroup
												id='loginUsername'
												isFloating
												label={t('Username')}>
												<Input
													autoComplete='username'
													value={formik.values.loginUsername}
													isTouched={formik.touched.loginUsername}
													invalidFeedback={formik.errors.loginUsername}
													isValid={formik.isValid}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													placeholder={t('Enter gym username')}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup
												id='loginPassword'
												isFloating
												label={t('Password')}>
												<Input
													type='password'
													autoComplete='current-password'
													value={formik.values.loginPassword}
													isTouched={formik.touched.loginPassword}
													invalidFeedback={formik.errors.loginPassword}
													isValid={formik.isValid}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													placeholder={t('Enter gym password')}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<Button
												color='primary'
												className='w-100 py-3'
												onClick={formik.handleSubmit}
												isDisable={
													!formik.values.loginUsername ||
													!formik.values.loginPassword ||
													gymLoading
												}>
												{gymLoading && <Spinner isSmall inButton />}
												<Icon icon='FitnessCenter' className='me-2' />
												{t('Sign In to Gym')}
											</Button>
										</div>
									</>
								</form>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Login;
