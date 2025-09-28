import React from 'react';
import { useTranslation } from 'react-i18next';
import Card, { CardHeader } from '../../../../components/bootstrap/Card';
import PageTitle from '../../../../components/common/PageTitle';

const MembershipPlansHeader: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader borderSize={1}>
				<PageTitle
					title='Membership Plans'
					icon='Assignment'
					iconColor='info'
					subtitle='Manage your membership plans and pricing'
				/>
			</CardHeader>
		</Card>
	);
};

export default MembershipPlansHeader;
