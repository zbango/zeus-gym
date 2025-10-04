import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import {
	useCreateAttendanceMutation,
	useGetAttendanceByDateQuery,
} from '../../../store/api/attendanceApi';
import Input from '../../../components/bootstrap/forms/Input';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import PageBreadcrumbs from '../../../components/common/PageBreadcrumbs';
import PageTitle from '../../../components/common/PageTitle';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../components/bootstrap/Card';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import Spinner from '../../../components/bootstrap/Spinner';
import Alert from '../../../components/bootstrap/Alert';
import Badge from '../../../components/bootstrap/Badge';
import { priceFormat } from '../../../helpers/helpers';
import Logo from '../../../components/Logo';

const QRScannerPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [scannedData, setScannedData] = useState<string | null>(null);
	const [scanHistory, setScanHistory] = useState<string[]>([]);
	const [parsedQRData, setParsedQRData] = useState<{
		memberId: string;
		gym: string;
		phone: string;
	} | null>(null);
	const [showMemberModal, setShowMemberModal] = useState(false);
	const [foundMember, setFoundMember] = useState<any>(null);
	const qrScannerRef = useRef<QrScanner | null>(null);

	// Parse QR data structure: MEMBER_ID:123|GYM:Zeus Gym|PHONE:0987654321
	const parseQRData = (qrData: string) => {
		const parts = qrData.split('|');
		const parsed: any = {};

		parts.forEach((part) => {
			const [key, value] = part.split(':');
			if (key && value) {
				parsed[key.toLowerCase()] = value;
			}
		});

		return {
			memberId: parsed.member_id || '',
			gym: parsed.gym || '',
			phone: parsed.phone || '',
		};
	};

	// Create attendance mutation
	const [createAttendance, { isLoading: isCreatingAttendance }] = useCreateAttendanceMutation();
	const [attendanceSuccess, setAttendanceSuccess] = useState(false);
	const [attendanceError, setAttendanceError] = useState<string | null>(null);

	// Get today's attendance data
	const today = new Date();
	const todayFormatted = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

	// Selected date for attendance history
	const [selectedDate, setSelectedDate] = useState(todayFormatted);

	const {
		data: attendanceData,
		isLoading: loadingAttendance,
		refetch: refetchAttendance,
	} = useGetAttendanceByDateQuery(selectedDate);

	// Start QR scanner
	const startScanner = async () => {
		console.log('startScanner');
		try {
			setError(null);
			setIsScanning(true);
			setScannedData(null);

			if (!videoRef.current) {
				throw new Error('Video element not found');
			}

			// Detect if device is a tablet
			const isTablet = () => {
				const userAgent = navigator.userAgent.toLowerCase();
				const isTabletUserAgent = /tablet|ipad|android(?!.*mobile)/i.test(userAgent);
				const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
				return isTabletUserAgent || isTabletScreen;
			};

			// Create QR scanner instance
			const qrScanner = new QrScanner(
				videoRef.current,
				async (result) => {
					if (isCreatingAttendance) return;
					// 1. SCAN - Get QR data
					const qrData = result.data;

					// 2. STOP SCAN - Stop scanner immediately
					stopScanner();

					// 3. GET ID - Parse QR data
					const parsed = parseQRData(qrData);
					setParsedQRData(parsed);
					setScannedData(qrData);
					setScanHistory((prev) => [qrData, ...prev.slice(0, 9)]);

					// 4. CALL POST - Make API call
					try {
						const attendanceResult = await createAttendance({
							customerId: parsed.memberId,
						}).unwrap();
						// 5. SUCCESS - Display modal
						setFoundMember(attendanceResult);
						setShowMemberModal(true);
						setAttendanceSuccess(true);

						if (attendanceResult.hasReasonToAlert) {
							setAttendanceError(attendanceResult.hasReasonToAlert);
							setShowMemberModal(true);
						} else {
							setAttendanceError(null);
						}
					} catch (error: any) {
						// ERROR - Display error modal
						console.log('Error caught:', error);

						let errorMessage = t(
							'An error occurred while registering attendance. Please try again.',
						);

						// Check for API error structure: { error: { message: "...", code: "..." } }
						if (error?.data?.error?.message) {
							errorMessage = error.data.error.message;
						} else if (error?.data?.message) {
							errorMessage = error.data.message;
						} else if (error?.message) {
							errorMessage = error.message;
						}
						console.log('errorMessage', errorMessage);
						setAttendanceError(errorMessage);
						setShowMemberModal(true);
					}
				},
				{
					preferredCamera: isTablet() ? 'user' : 'environment', // Front camera for tablets, back camera for phones
					highlightScanRegion: true,
					highlightCodeOutline: true,
				},
			);

			qrScannerRef.current = qrScanner;
			await qrScanner.start();
			setHasPermission(true);
		} catch (err: any) {
			console.error('QR Scanner error:', err);
			setError(
				err.name === 'NotAllowedError'
					? t('Camera permission denied. Please allow camera access.')
					: t('Failed to access camera. Please check your device settings.'),
			);
			setHasPermission(false);
			setIsScanning(false);
		}
	};

	// Stop QR scanner
	const stopScanner = () => {
		if (qrScannerRef.current) {
			qrScannerRef.current.stop();
			qrScannerRef.current.destroy();
			qrScannerRef.current = null;
		}
		setIsScanning(false);
	};

	// Handle scan result
	const handleScanResult = (data: string) => {
		setScannedData(data);
		// You can add logic here to handle different types of QR codes
		// For example, redirect to different pages based on the content
	};

	// Clear scanned data
	const clearScannedData = () => {
		setScannedData(null);
		setParsedQRData(null);
		setFoundMember(null);
		setShowMemberModal(false);
		setAttendanceSuccess(false);
		setAttendanceError(null);
	};

	// Copy to clipboard
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			// You could show a toast notification here
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
		}
	};

	// Handle date change for attendance history
	const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedDateValue = event.target.value;
		if (selectedDateValue) {
			// Parse the date string directly to avoid timezone issues
			const [year, month, day] = selectedDateValue.split('-');
			const formattedDate = `${month}/${day}/${year}`;
			setSelectedDate(formattedDate);
		}
	};

	// Get current date in YYYY-MM-DD format for input
	const getCurrentDateForInput = () => {
		const today = new Date();
		return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
	};

	// Convert selected date (MM/DD/YYYY) to input format (YYYY-MM-DD)
	const getInputValueFromSelectedDate = () => {
		if (!selectedDate) return getCurrentDateForInput();

		const [month, day, year] = selectedDate.split('/');
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
	};

	// Auto-start scanner when component mounts
	useEffect(() => {
		console.log('useEffect');
		// Small delay to ensure video element is ready
		const timer = setTimeout(() => {
			startScanner();
		}, 500);

		return () => {
			clearTimeout(timer);
			stopScanner();
		};
	}, []);

	console.log(attendanceError);

	// Restart scanner when tab becomes visible again
	useEffect(() => {
		console.log('useEffect visibilitychange');
		const handleVisibilityChange = () => {
			if (!document.hidden && !isScanning) {
				// Tab became visible and scanner is not running, restart it
				setTimeout(() => {
					startScanner();
				}, 100);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [isScanning]);

	// Auto-close modal after 10 seconds when member is found
	useEffect(() => {
		if (foundMember && showMemberModal) {
			const timer = setTimeout(() => {
				// 6. CLOSE MODAL - Close modal and restart scanner
				setShowMemberModal(false);
				clearScannedData();
				// Restart scanner after modal closes
				setTimeout(() => {
					startScanner();
				}, 100);
			}, 7000);

			return () => clearTimeout(timer);
		}
	}, [foundMember, showMemberModal]);

	return (
		<PageWrapper title={t('QR Code Scanner')} className='pt-4'>
			<SubHeader>
				<SubHeaderLeft>
					<PageBreadcrumbs
						breadcrumbs={[
							{
								title: t('Dashboard'),
								to: '/gym-management/dashboard',
							},
							{
								title: t('QR Scanner'),
								to: '/gym-management/qr-scanner',
							},
						]}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button color='info' icon='Refresh' isLight onClick={startScanner}>
						{t('Restart Scanner')}
					</Button>
					<Button color='secondary' icon='Close' isLight onClick={stopScanner}>
						{t('Stop Scanner')}
					</Button>
				</SubHeaderRight>
			</SubHeader>

			<Page container='fluid'>
				{/* Header Section */}
				<Card>
					<CardHeader borderSize={1}>
						<PageTitle
							title='QR Code Scanner'
							icon='QrCode'
							iconColor='primary'
							subtitle='Scan QR codes using your device camera'
						/>
					</CardHeader>
				</Card>

				{/* Scanner Section */}
				<Card className='mt-4'>
					<CardHeader>
						<CardLabel icon='QrCode' iconColor='primary'>
							<CardTitle>{t('Camera Scanner')}</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						{error && (
							<Alert color='danger' className='mb-3'>
								{error}
							</Alert>
						)}

						{hasPermission === false && (
							<Alert color='warning' className='mb-3'>
								{t(
									'Camera access is required to scan QR codes. Please enable camera permissions.',
								)}
							</Alert>
						)}

						<div className='text-center'>
							<div className='position-relative d-inline-block'>
								<video
									ref={videoRef}
									className='img-fluid rounded border'
									style={{ maxWidth: '100%', height: 'auto', maxHeight: '500px' }}
									playsInline
									muted
								/>

								{isScanning && !hasPermission && (
									<div className='position-absolute top-50 start-50 translate-middle'>
										<Spinner color='light' />
									</div>
								)}

								{isScanning && hasPermission && (
									<div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'>
										<Badge color='success' className='fs-6'>
											<Icon icon='QrCode' className='me-1' />
											{t('Scanning...')}
										</Badge>
									</div>
								)}
							</div>

							<div className='mt-3'>
								<p className='text-muted'>
									{t('Position the QR code within the camera view to scan.')}
								</p>
								{isScanning && hasPermission && (
									<p className='text-success small'>
										<Icon icon='QrCode' className='me-1' />
										{t('Scanner is active - ready to scan QR codes')}
									</p>
								)}
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Member Information Modal */}
				<Modal
					setIsOpen={() => setShowMemberModal(false)}
					isOpen={showMemberModal}
					titleId='memberModal'
					size='lg'
					isStaticBackdrop>
					<ModalHeader setIsOpen={() => setShowMemberModal(false)}>
						<ModalTitle id='memberModal'>
							<Icon icon='QrCode' className='me-2' />
							{attendanceError ? t('Attendance Error') : t('QR Code Scanned')}
						</ModalTitle>
					</ModalHeader>
					<ModalBody>
						{/* Success Message */}
						{attendanceSuccess && foundMember && (
							<div className='text-center mb-4'>
								<div className='d-inline-flex align-items-center bg-success bg-opacity-10 rounded-3 p-3 mb-3'>
									<Icon icon='TaDa' size='2x' className='text-success me-2' />
									<div className='text-success fw-bold fs-5'>
										¡BIENVENIDO AL GIMNASIO!
									</div>
								</div>
								<div className='text-muted'>
									<strong>{foundMember?.customer?.name}</strong>,{' '}
									{foundMember?.membership?.planType?.toLowerCase() ===
									'monthly' ? (
										<span>
											{foundMember?.membership?.endDate ? (
												<span>
													tu membresía vence el{' '}
													<span className='badge bg-warning fs-6'>
														{new Date(
															foundMember?.membership?.endDate,
														).toLocaleDateString()}
													</span>
												</span>
											) : (
												<span>
													tu membresía está{' '}
													<span className='badge bg-success fs-6'>
														activa
													</span>
												</span>
											)}
										</span>
									) : (
										<span>
											te quedan{' '}
											<span className='badge bg-primary fs-6'>
												{foundMember?.membership?.remainingVisits}
											</span>{' '}
											visitas
										</span>
									)}
								</div>
							</div>
						)}

						{/* Member Information */}
						{foundMember && (
							<div className='row g-4'>
								{/* Member Profile Card */}
								<div className='col-12'>
									<div className='card border-0 shadow-sm'>
										<div className='card-body p-4'>
											<div className='d-flex align-items-center mb-3'>
												<Logo width={100} height={100} />
												<div>
													<h5 className='mb-1'>
														{foundMember?.customer?.name}{' '}
														{foundMember?.customer?.lastName}
													</h5>
													<small className='text-muted'>
														ID:{' '}
														{
															foundMember?.attendance
																?.customerIdentification
														}
													</small>
												</div>
											</div>
											<div className='row g-2'>
												<div className='col-6'>
													<small className='text-muted d-block'>
														{t('Attendance Date')}
													</small>
													<strong>
														{new Date(
															foundMember?.attendance?.attendanceDate,
														).toLocaleString()}
													</strong>
												</div>
												{foundMember?.membership?.planType ===
													'count-based' && (
													<div className='col-6'>
														<small className='text-muted d-block'>
															{t('Remaining Visits')}
														</small>
														<Badge color='primary' className='fs-6'>
															{
																foundMember?.membership
																	?.remainingVisits
															}
														</Badge>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Membership Details */}
								<div className='col-12'>
									<div className='card border-0 shadow-sm'>
										<div className='card-header bg-primary bg-opacity-10 border-0'>
											<h6 className='mb-0 text-primary'>
												<Icon icon='CreditCard' className='me-2' />
												{t('Membership Information')}
											</h6>
										</div>
										<div className='card-body p-4'>
											<div className='row g-3'>
												{foundMember?.membership?.planType?.toLowerCase() ===
													'monthly' &&
													foundMember?.membership?.endDate && (
														<div className='col-12'>
															<div className='d-flex justify-content-between align-items-center py-2 border-bottom'>
																<span className='text-muted'>
																	{t('End Date')}
																</span>
																<strong className='text-warning'>
																	{new Date(
																		foundMember?.membership?.endDate,
																	).toLocaleDateString()}
																</strong>
															</div>
														</div>
													)}
												<div className='col-md-4'>
													<div className='text-center p-3 bg-light rounded'>
														<small className='text-muted d-block'>
															{t('Total Amount')}
														</small>
														<strong className='text-primary fs-5'>
															{priceFormat(
																foundMember?.membership
																	?.totalAmount || 0,
															)}
														</strong>
													</div>
												</div>
												<div className='col-md-4'>
													<div className='text-center p-3 bg-light rounded'>
														<small className='text-muted d-block'>
															{t('Paid Amount')}
														</small>
														<strong className='text-success fs-5'>
															{priceFormat(
																foundMember?.membership
																	?.paidAmount || 0,
															)}
														</strong>
													</div>
												</div>
												<div className='col-md-4'>
													<div className='text-center p-3 bg-light rounded'>
														<small className='text-muted d-block'>
															{t('Remaining')}
														</small>
														<strong className='text-danger fs-5'>
															{priceFormat(
																foundMember?.membership
																	?.remainingAmount || 0,
															)}
														</strong>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Attendance Error Message */}
						{attendanceError && (
							<div className='text-center'>
								<Alert color='danger' className='border-0 shadow-sm'>
									<Icon icon='Error' size='2x' className='mb-3 text-danger' />
									<h5 className='text-danger mb-2'>{t('Attendance Error')}</h5>
									<div className='fw-bold'>{attendanceError}</div>
								</Alert>
							</div>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							color='secondary'
							onClick={() => {
								setShowMemberModal(false);
								clearScannedData();
								// Restart scanner after closing
								setTimeout(() => {
									startScanner();
								}, 100);
							}}>
							{t('Close')}
						</Button>
						<Button
							color='info'
							icon='Play'
							onClick={() => {
								setShowMemberModal(false);
								clearScannedData();
								// Restart scanner immediately
								startScanner();
							}}>
							{t('Scan Again')}
						</Button>
					</ModalFooter>
				</Modal>

				{/* Attendance History Section */}
				<Card className='mt-4'>
					<CardHeader borderSize={1}>
						{/* Left side - Title */}
						<PageTitle
							title={`${t('Attendance History')} (${selectedDate})`}
							icon='History'
							iconColor='info'
						/>

						{/* Right side - Date Controls */}
						<CardActions className='d-flex flex-wrap align-items-center gap-3'>
							<Input
								id='attendanceDate'
								type='date'
								value={getInputValueFromSelectedDate()}
								onChange={handleDateChange}
								className='form-control'
								style={{ width: 'auto' }}
							/>
							<Button
								color='info'
								icon='Refresh'
								isLight
								size='sm'
								onClick={() => setSelectedDate(todayFormatted)}>
								{t('Reset to Today')}
							</Button>
						</CardActions>
					</CardHeader>
					<CardBody>
						{loadingAttendance ? (
							<div className='text-center py-4'>
								<Spinner size='lg' />
								<div className='mt-2'>{t('Loading attendance...')}</div>
							</div>
						) : attendanceData?.attendance && attendanceData.attendance.length > 0 ? (
							<div className='row g-2'>
								{attendanceData.attendance.map((attendance) => (
									<div key={attendance.id} className='col-12'>
										<div className='p-3 border rounded d-flex justify-content-between align-items-center bg-light'>
											<div className='flex-grow-1'>
												<div className='fw-bold'>
													{attendance.customerFullName}
												</div>
												<small className='text-muted'>
													ID: {attendance.customerId}
												</small>
											</div>
											<div className='d-flex gap-1'>
												<Button
													size='sm'
													color='info'
													icon='ContentCopy'
													onClick={() =>
														copyToClipboard(attendance.customerId)
													}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-4 text-muted'>
								<Icon icon='PersonOff' size='2x' className='mb-2' />
								<div>{t('No attendance recorded for this date')}</div>
							</div>
						)}
					</CardBody>
				</Card>
			</Page>
		</PageWrapper>
	);
};

export default QRScannerPage;
