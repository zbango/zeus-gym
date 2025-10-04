import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QrScanner from 'qr-scanner';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from './bootstrap/Modal';
import Button from './bootstrap/Button';
import Icon from './icon/Icon';
import Spinner from './bootstrap/Spinner';
import Alert from './bootstrap/Alert';

interface QRCodeScannerProps {
	isOpen: boolean;
	onClose: () => void;
	onScan: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
	const { t } = useTranslation();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const qrScannerRef = useRef<QrScanner | null>(null);

	// Start QR scanner
	const startScanner = async () => {
		try {
			setError(null);
			setIsScanning(true);

			if (!videoRef.current) {
				throw new Error('Video element not found');
			}

			// Create QR scanner instance
			const qrScanner = new QrScanner(
				videoRef.current,
				(result) => {
					// QR code detected
					onScan(result.data);
					stopScanner();
					onClose();
				},
				{
					preferredCamera: 'environment', // Use back camera
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

	// Handle modal open/close
	useEffect(() => {
		if (isOpen) {
			startScanner();
		} else {
			stopScanner();
		}

		return () => {
			stopScanner();
		};
	}, [isOpen]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopScanner();
		};
	}, []);

	return (
		<Modal
			setIsOpen={onClose}
			isOpen={isOpen}
			titleId='qrScannerModal'
			size='lg'
			isStaticBackdrop>
			<ModalHeader setIsOpen={onClose}>
				<ModalTitle id='qrScannerModal'>
					<Icon icon='QrCode' className='me-2' />
					{t('QR Code Scanner')}
				</ModalTitle>
			</ModalHeader>
			<ModalBody>
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
							className='img-fluid rounded'
							style={{ maxWidth: '100%', height: 'auto', maxHeight: '400px' }}
							playsInline
							muted
						/>

						{isScanning && !hasPermission && (
							<div className='position-absolute top-50 start-50 translate-middle'>
								<Spinner color='light' />
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
								{t('Scanning for QR codes...')}
							</p>
						)}
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color='secondary' onClick={onClose}>
					{t('Cancel')}
				</Button>
				{!hasPermission && (
					<Button color='primary' onClick={startScanner}>
						{t('Try Again')}
					</Button>
				)}
			</ModalFooter>
		</Modal>
	);
};

export default QRCodeScanner;
