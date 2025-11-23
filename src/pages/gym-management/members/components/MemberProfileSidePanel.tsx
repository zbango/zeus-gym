import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import OffCanvas, {
	OffCanvasBody,
	OffCanvasHeader,
	OffCanvasTitle,
} from '../../../../components/bootstrap/OffCanvas';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../../../components/bootstrap/Card';
import Icon from '../../../../components/icon/Icon';
import { Member } from '../../../../types/member.types';

interface MemberProfileSidePanelProps {
	isOpen: boolean;
	onClose: () => void;
	member: Member | null;
	onEdit?: (memberId: string) => void;
}

const MemberProfileSidePanel: React.FC<MemberProfileSidePanelProps> = ({
	isOpen,
	onClose,
	member,
	onEdit,
}) => {
	const { t } = useTranslation();

	if (!member) return null;

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'success';
			case 'expired':
				return 'danger';
			case 'suspended':
				return 'warning';
			case 'inactive':
				return 'secondary';
			default:
				return 'secondary';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return 'CheckCircle';
			case 'expired':
				return 'Cancel';
			case 'suspended':
				return 'Pause';
			case 'inactive':
				return 'RemoveCircle';
			default:
				return 'Help';
		}
	};

	return (
		<OffCanvas
			setOpen={onClose}
			isOpen={isOpen}
			titleId='memberProfileSidePanel'
			placement='end'>
			<OffCanvasHeader setOpen={onClose}>
				<OffCanvasTitle id='memberProfileSidePanel'>{t('Member Profile')}</OffCanvasTitle>
			</OffCanvasHeader>
			<OffCanvasBody>
				<div className='d-flex flex-column gap-4'>
					{/* QR Code Section */}
					{/* 					{showQRCode && (
						<QRCodeGenerator
							memberId={member.id}
							memberName={`${member.personalInfo.name} ${member.personalInfo.lastName}`}
							onClose={() => setShowQRCode(false)}
						/>
					)} */}

					{/* Member Header */}
					<Card>
						<CardBody>
							<div className='d-flex align-items-center gap-3'>
								<div className='flex-grow-1'>
									<h4 className='mb-1'>
										{member.personalInfo.name} {member.personalInfo.lastName}
									</h4>
									<p className='text-muted mb-2'>{member.personalInfo.email}</p>
									<div className='d-flex align-items-center gap-2'>
										<Icon
											icon={getStatusIcon(member.membershipInfo.status)}
											color={getStatusColor(member.membershipInfo.status)}
											size='sm'
										/>
										<span
											className={`text-${getStatusColor(member.membershipInfo.status)}`}>
											{t(
												member.membershipInfo.status
													.charAt(0)
													.toUpperCase() +
													member.membershipInfo.status.slice(1),
											)}
										</span>
									</div>
								</div>
								{/* <div className='d-flex gap-2'>
									{onEdit && (
										<Button
											color='primary'
											icon='Edit'
											onClick={() => {
												onEdit(member.id);
												onClose();
											}}>
											{t('Edit')}
										</Button>
									)}
								</div> */}
							</div>
						</CardBody>
					</Card>

					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardLabel icon='Person' iconColor='primary'>
								<CardTitle>{t('Personal Information')}</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='row g-3'>
								<div className='col-6'>
									<small className='text-muted'>{t('First Name')}</small>
									<div className='fw-bold'>{member.personalInfo.name}</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Last Name')}</small>
									<div className='fw-bold'>{member.personalInfo.lastName}</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Email')}</small>
									<div>{member.personalInfo.email || 'N/A'}</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Phone')}</small>
									<div>{member.personalInfo.phone || 'N/A'}</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Birth Date')}</small>
									<div>
										{member.personalInfo.birthDate
											? dayjs(member.personalInfo.birthDate).format(
													'DD/MM/YYYY',
												)
											: '-'}
									</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Identification')}</small>
									<div>{member.personalInfo.identification || 'N/A'}</div>
								</div>
								<div className='col-12'>
									<small className='text-muted'>{t('Address')}</small>
									<div>{member.personalInfo.address || 'N/A'}</div>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Health Information */}
					<Card>
						<CardHeader>
							<CardLabel icon='FitnessCenter' iconColor='success'>
								<CardTitle>{t('Health Information')}</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='row g-3'>
								<div className='col-4'>
									<small className='text-muted'>{t('Age')}</small>
									<div className='fw-bold'>
										{member.healthInfo.age} {t('years')}
									</div>
								</div>
								<div className='col-4'>
									<small className='text-muted'>{t('Height')}</small>
									<div className='fw-bold'>{member.healthInfo.height} cm</div>
								</div>
								<div className='col-4'>
									<small className='text-muted'>{t('Weight')}</small>
									<div className='fw-bold'>
										{member.healthInfo.currentWeight} kg
									</div>
								</div>
								{member.healthInfo.medicalConditions && (
									<div className='col-12'>
										<small className='text-muted'>
											{t('Medical Conditions')}
										</small>
										<div>{member.healthInfo.medicalConditions}</div>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					{/* Membership Information */}
					<Card>
						<CardHeader>
							<CardLabel icon='CardMembership' iconColor='info'>
								<CardTitle>{t('Membership Information')}</CardTitle>
							</CardLabel>
						</CardHeader>
						<CardBody>
							<div className='row g-3'>
								<div className='col-6'>
									<small className='text-muted'>{t('Plan')}</small>
									<div className='fw-bold'>{member.membershipInfo.plan}</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Type')}</small>
									<div>
										{member.membershipInfo.type === 'monthly'
											? t('Monthly')
											: t('Count-based')}
									</div>
								</div>
								<div className='col-6'>
									<small className='text-muted'>{t('Start Date')}</small>
									<div>
										{dayjs(member.membershipInfo.startDate).format(
											'DD/MM/YYYY',
										)}
									</div>
								</div>
								{member.membershipInfo.endDate && (
									<div className='col-6'>
										<small className='text-muted'>{t('End Date')}</small>
										<div>
											{dayjs(member.membershipInfo.endDate).format(
												'DD/MM/YYYY',
											)}
										</div>
									</div>
								)}
								{member.membershipInfo.remainingVisits && (
									<div className='col-6'>
										<small className='text-muted'>
											{t('Remaining Visits')}
										</small>
										<div className='fw-bold text-primary'>
											{member.membershipInfo.remainingVisits}
										</div>
									</div>
								)}
								<div className='col-6'>
									<small className='text-muted'>{t('Registration Date')}</small>
									<div>{dayjs(member.registrationDate).format('DD/MM/YYYY')}</div>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			</OffCanvasBody>
		</OffCanvas>
	);
};

export default MemberProfileSidePanel;
