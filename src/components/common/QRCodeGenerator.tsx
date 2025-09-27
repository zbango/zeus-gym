import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../bootstrap/Button';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../bootstrap/Card';

interface QRCodeGeneratorProps {
	memberId: string;
	memberName: string;
	onClose?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ memberId, memberName, onClose }) => {
	const { t } = useTranslation();

	// Generate the URL for the member stats page
	const memberStatsUrl = `${window.location.origin}/member/${memberId}/stats`;

	// Copy URL to clipboard
	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(memberStatsUrl);
			// You could add a toast notification here
			console.log('URL copied to clipboard');
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	};

	// Generate QR code using a simple approach (you might want to use a proper QR library)
	const generateQRCode = () => {
		// For now, we'll use a QR code service
		// In a real implementation, you'd use a library like 'qrcode' or 'react-qr-code'
		const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(memberStatsUrl)}`;
		return qrCodeUrl;
	};

	return (
		<Card>
			<CardHeader>
				<CardLabel icon='QrCode' iconColor='primary'>
					<CardTitle>{t('Member QR Code')}</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<div className='text-center'>
					<div className='mb-4'>
						<img
							src={generateQRCode()}
							alt={`QR Code for ${memberName}`}
							className='img-fluid'
							style={{ maxWidth: '200px' }}
						/>
					</div>

					<div className='mb-3'>
						<small className='text-muted'>
							{t('Scan this QR code to view member stats')}
						</small>
					</div>

					<div className='mb-3'>
						<small className='text-muted'>{t('Or share this link:')}</small>
						<div className='mt-2'>
							<code className='bg-light p-2 rounded d-block text-break'>
								{memberStatsUrl}
							</code>
						</div>
					</div>

					<div className='d-flex gap-2 justify-content-center'>
						<Button color='primary' icon='ContentCopy' onClick={copyToClipboard}>
							{t('Copy Link')}
						</Button>
						<Button
							color='secondary'
							icon='OpenInNew'
							onClick={() => window.open(memberStatsUrl, '_blank')}>
							{t('Open Stats')}
						</Button>
						{onClose && (
							<Button color='light' icon='Close' onClick={onClose}>
								{t('Close')}
							</Button>
						)}
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default QRCodeGenerator;
