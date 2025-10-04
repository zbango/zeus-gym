import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
// API Response type for member creation
interface MemberCreationResponse {
	customer: {
		id: string;
		name: string;
		lastName: string;
		dateOfBirth: string;
		email: string;
		phone: string;
		address: string;
		identification: string;
		medicalConditions: string;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	progress: {
		id: string;
		customerId: string;
		isCurrent: boolean;
		age: number;
		gender: string;
		height: number;
		weight: number;
		createdAt: string;
		updatedAt: string;
	};
	membership: {
		id: string;
		customerId: string;
		membershipPlanId: string;
		membershipPlan: {
			id: string;
			name: string;
			type: string;
			price: number;
			duration?: number;
			description: string;
			status: string;
			createdAt: string;
			updatedAt: string;
		};
		startDate: string;
		status: string;
		totalAmount: number;
		paidAmount: number;
		remainingAmount: number;
		createdAt: string;
		updatedAt: string;
	};
	payment: {
		id: string;
		customerId: string;
		membershipId: string;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		membershipPlanName: string;
		membershipPlanType: string;
		amount: number;
		paymentMethod: string;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
}
import Modal, { ModalBody, ModalHeader } from '../../../../components/bootstrap/Modal';
import Icon from '../../../../components/icon/Icon';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import Button from '../../../../components/bootstrap/Button';
import Logo from '../../../../components/Logo';

interface MemberSuccessDialogProps {
	isOpen: boolean;
	onClose: () => void;
	member: MemberCreationResponse | null;
	onNavigateToList: () => void;
	onKeepCreating: () => void;
}

const MemberSuccessDialog: React.FC<MemberSuccessDialogProps> = ({
	isOpen,
	onClose,
	member,
	onNavigateToList,
	onKeepCreating,
}) => {
	console.log('member', member);
	const { t } = useTranslation();
	const cardRef = useRef<HTMLDivElement>(null);
	const qrCanvasRef = useRef<HTMLCanvasElement>(null);
	const [qrCodeLoaded, setQrCodeLoaded] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);

	// Generate QR code data (member ID + gym info)
	const qrData = `MEMBER_ID:${member?.customer?.id}|GYM:Zeus Gym|PHONE:${member?.customer?.phone || ''}`;
	// Generate QR code on canvas
	useEffect(() => {
		if (member && qrCanvasRef.current) {
			QRCode.toCanvas(
				qrCanvasRef.current,
				qrData,
				{
					width: 200,
					margin: 2,
					color: {
						dark: '#000000',
						light: '#FFFFFF',
					},
				},
				(error: any) => {
					if (error) {
						console.error('QR Code generation error:', error);
						setQrCodeLoaded(false);
					} else {
						setQrCodeLoaded(true);
					}
				},
			);
		}
	}, [member, qrData]);

	if (!member) return null;

	// WhatsApp sharing URL
	const whatsappMessage = encodeURIComponent(
		`🎉 ¡Bienvenido a Zeus Gym!\n\n` +
			`Hola ${member.customer?.name} ${member.customer?.lastName},\n\n` +
			`Tu membresía ha sido activada exitosamente:\n` +
			`📋 Plan: ${member.membership?.membershipPlan?.name}\n` +
			`📅 Inicio: ${dayjs(member.membership?.startDate).format('DD/MM/YYYY')}\n\n` +
			`¡Esperamos verte pronto en el gym! 💪`,
	);

	const whatsappUrl = `https://wa.me/${(member.customer?.phone || '').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

	const handleWhatsAppShare = () => {
		window.open(whatsappUrl, '_blank');
	};

	const handleCopyCardImage = async () => {
		if (!cardRef.current) return;

		setIsCapturing(true);

		try {
			// Use html2canvas to capture the card as an image
			const html2canvas = (await import('html2canvas')).default;
			const canvas = await html2canvas(cardRef.current, {
				backgroundColor: '#ffffff',
				scale: 2, // Higher quality
				useCORS: true, // Allow cross-origin images
				allowTaint: true, // Allow tainted canvas
			});

			// Convert canvas to blob
			canvas.toBlob(async (blob: Blob | null) => {
				if (blob) {
					// Create a temporary URL for the image
					const imageUrl = URL.createObjectURL(blob);

					// Create a temporary link to download the image
					const link = document.createElement('a');
					link.href = imageUrl;
					link.download = `membership-card-${member.customer?.id}.png`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					// Clean up
					URL.revokeObjectURL(imageUrl);
				}
				setIsCapturing(false);
			}, 'image/png');
		} catch (error) {
			console.error('Error capturing card image:', error);
			setIsCapturing(false);

			// Fallback: copy text to clipboard
			const cardText =
				`Zeus Gym Membership Card\n` +
				`Member: ${member.customer?.name} ${member.customer?.lastName}\n` +
				`ID: ${member.customer?.id}\n` +
				`Plan: ${member.membership?.membershipPlan?.name}\n` +
				`Start: ${dayjs(member.membership?.startDate).format('DD/MM/YYYY')}\n` +
				`Status: ${member.membership?.status}`;

			await navigator.clipboard.writeText(cardText);
		}
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={() => {}} size='lg' isCentered>
			<ModalHeader>
				<div className='d-flex align-items-center'>
					<Icon icon='CheckCircle' color='success' className='me-2' size='lg' />
					<span className='h4 mb-0'>{t('Member Registered Successfully!')}</span>
				</div>
			</ModalHeader>
			<ModalBody>
				<div className='text-center mb-4'>
					<p className='text-muted'>
						{t(
							'The member has been registered successfully. You can share their membership card via WhatsApp.',
						)}
					</p>
				</div>

				{/* Membership Card */}
				<Card className='mb-4 membership-card' ref={cardRef}>
					<CardBody className='p-0'>
						{/* Card Header with Gradient */}
						<div className='membership-header position-relative'>
							<div className='membership-header-bg' />
							<div className='membership-header-content p-4'>
								<div className='row align-items-center'>
									<div className='col-8'>
										<div className='d-flex align-items-center mb-2'>
											<Logo height={80} width={80} className='me-3' />
											<div>
												<h4 className='mb-0 text-white fw-bold'>
													ZEUS GYM
												</h4>
											</div>
										</div>
									</div>
									<div className='col-4 text-end'>
										<div className='membership-status-badge'>
											<span className='badge bg-success fs-6 px-3 py-2'>
												<Icon icon='CheckCircle' className='me-1' />
												{t('ACTIVE')}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Card Body */}
						<div className='membership-body p-4'>
							<div className='row'>
								{/* Member Details */}
								<div className='col-md-7'>
									<div className='member-details'>
										<h5 className='member-name mb-2'>
											{member.customer?.name} {member.customer?.lastName}
										</h5>
										<div className='member-info mb-3'>
											<div className='info-item mb-1'>
												<Icon
													icon='Email'
													size='sm'
													className='me-2 text-muted'
												/>
												<small>{member.customer?.email}</small>
											</div>
											{member.customer?.phone && (
												<div className='info-item mb-1'>
													<Icon
														icon='Phone'
														size='sm'
														className='me-2 text-muted'
													/>
													<small>{member.customer.phone}</small>
												</div>
											)}
										</div>

										{/* Membership Plan Info */}
										<div className='membership-plan-info'>
											<div className='plan-badge mb-2'>
												<span className='badge bg-primary fs-6 px-3 py-2'>
													<Icon icon='CardMembership' className='me-1' />
													{member.membership?.membershipPlan?.name}
												</span>
											</div>
											<div className='plan-details'>
												<div className='d-flex justify-content-between mb-1'>
													<small className='text-muted'>
														{t('Start Date')}:
													</small>
													<small className='fw-bold'>
														{dayjs(member.membership?.startDate).format(
															'DD/MM/YYYY',
														)}
													</small>
												</div>
												{member.membership?.membershipPlan?.type ===
													'monthly' && (
													<div className='d-flex justify-content-between mb-1'>
														<small className='text-muted'>
															{t('Expires')}:
														</small>
														<small className='fw-bold'>
															{dayjs(member.membership?.startDate)
																.add(
																	member.membership
																		?.membershipPlan
																		?.duration || 1,
																	'month',
																)
																.format('DD/MM/YYYY')}
														</small>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* QR Code */}
								<div className='col-md-5 text-center'>
									<div className='qr-section'>
										<canvas
											ref={qrCanvasRef}
											style={{ maxWidth: '150px', maxHeight: '150px' }}
											className='img-fluid'
										/>
										{!qrCodeLoaded && (
											<div className='text-muted small'>
												<Icon icon='Refresh' className='spinning' />
												{t('Loading QR Code...')}
											</div>
										)}
										<div className='qr-label mt-2'>
											<small className='text-muted'>
												{t('Scan for access')}
											</small>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Action Buttons */}
				<div className='d-flex gap-3 justify-content-center flex-wrap'>
					<Button
						color='success'
						icon='WhatsApp'
						onClick={handleWhatsAppShare}
						className='flex-fill'>
						{t('Share via WhatsApp')}
					</Button>
					<Button
						color='info'
						icon={isCapturing ? 'Refresh' : 'ContentCopy'}
						onClick={handleCopyCardImage}
						isDisable={isCapturing || !qrCodeLoaded}
						className='flex-fill'>
						{isCapturing ? t('Capturing...') : t('Copy Card Image')}
					</Button>
					<Button
						color='warning'
						icon='PersonAdd'
						onClick={onKeepCreating}
						className='flex-fill'>
						{t('Keep Creating')}
					</Button>
					<Button
						color='primary'
						icon='List'
						onClick={onNavigateToList}
						className='flex-fill'>
						{t('Go to Members List')}
					</Button>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default MemberSuccessDialog;
