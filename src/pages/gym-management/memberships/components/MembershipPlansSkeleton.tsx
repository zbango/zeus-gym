import React from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import Spinner from '../../../../components/bootstrap/Spinner';
import { useTranslation } from 'react-i18next';

const MembershipPlansSkeleton: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Card stretch className='mt-4'>
			<CardBody className='p-4'>
				<div className='d-flex align-items-center mb-4'>
					<Spinner isGrow size='sm' className='me-2' />
					<span>{t('Loading membership plans...')}</span>
				</div>
				<div className='row g-4'>
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className='col-lg-4 col-md-6'>
							<Card className='h-100'>
								<CardHeader>
									<div className='d-flex justify-content-between align-items-center'>
										<div
											className='placeholder-glow'
											style={{
												width: '120px',
												height: '20px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
											}}
										/>
									</div>
								</CardHeader>
								<CardBody>
									<div className='mb-3'>
										<div
											className='placeholder-glow'
											style={{
												width: '80px',
												height: '16px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
												marginBottom: '8px',
											}}
										/>
										<div
											className='placeholder-glow'
											style={{
												width: '100%',
												height: '14px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
											}}
										/>
									</div>
									<div className='mb-3'>
										<div
											className='placeholder-glow'
											style={{
												width: '60px',
												height: '12px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
												marginBottom: '4px',
											}}
										/>
										<div
											className='placeholder-glow'
											style={{
												width: '80%',
												height: '12px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
											}}
										/>
									</div>
									<div className='d-flex justify-content-between align-items-center'>
										<div
											className='placeholder-glow'
											style={{
												width: '100px',
												height: '20px',
												backgroundColor: 'var(--bs-gray-300)',
												borderRadius: '4px',
											}}
										/>
									</div>
								</CardBody>
							</Card>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
};

export default MembershipPlansSkeleton;
