import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/bootstrap/Button';

interface MembersListActionsProps {
	onRefresh?: () => void;
	onAddMember?: () => void;
}

const MembersListActions: React.FC<MembersListActionsProps> = ({ onRefresh, onAddMember }) => {
	const { t } = useTranslation();

	return (
		<div className='d-flex gap-2'>
			{onRefresh && (
				<Button color='light' icon='Refresh' isLight onClick={onRefresh}>
					{t('Refresh')}
				</Button>
			)}
			{/* {onAddMember && (
				<Button color='success' icon='PersonAdd' tag='a' to='/gym-management/members/add'>
					{t('Add New Member')}
				</Button>
			)} */}
		</div>
	);
};

export default MembersListActions;
