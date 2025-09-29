import React from 'react';
import Card, { CardBody, CardHeader } from '../../../../components/bootstrap/Card';
import Spinner from '../../../../components/bootstrap/Spinner';

const UsersListSkeleton: React.FC = () => {
	return (
		<Card stretch>
			<CardHeader borderSize={1}>
				<div className='d-flex align-items-center'>
					<Spinner isGrow size='sm' className='me-2' />
					<span>Loading users...</span>
				</div>
			</CardHeader>
			<CardBody>
				<div className='row g-3'>
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className='col-12'>
							<div className='d-flex align-items-center'>
								<div
									className='bg-light rounded-circle me-3'
									style={{ width: '40px', height: '40px' }}
								/>
								<div className='flex-grow-1'>
									<div
										className='bg-light rounded mb-1'
										style={{ width: '200px', height: '16px' }}
									/>
									<div
										className='bg-light rounded'
										style={{ width: '150px', height: '12px' }}
									/>
								</div>
								<div
									className='bg-light rounded'
									style={{ width: '60px', height: '24px' }}
								/>
							</div>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
};

export default UsersListSkeleton;
