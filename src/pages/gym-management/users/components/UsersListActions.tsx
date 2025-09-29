import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/bootstrap/Button';
import useDarkMode from '../../../../hooks/useDarkMode';

interface UsersListActionsProps {
	onAddUser: () => void;
	onRefresh: () => void;
	hasPermission: (permission: string) => boolean;
}

const UsersListActions: React.FC<UsersListActionsProps> = ({
	onAddUser,
	onRefresh,
	hasPermission,
}) => {
	const { t } = useTranslation();
	const { themeStatus } = useDarkMode();

	return (
		<>
			{hasPermission('users.create') && (
				<Button color='success' icon='PersonAdd' onClick={onAddUser}>
					{t('Add User')}
				</Button>
			)}
			<Button color={themeStatus} icon='Refresh' isLight onClick={onRefresh}>
				{t('Refresh')}
			</Button>
		</>
	);
};

export default UsersListActions;
