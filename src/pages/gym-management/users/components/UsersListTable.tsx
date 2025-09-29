import React from 'react';
import Card, { CardBody } from '../../../../components/bootstrap/Card';
import DynamicTable from '../../../../components/table/DynamicTable';
import { useUsersTableColumns } from '../../../../components/users/UsersTableConfig';
import { IGymUser } from '../../../../types/gym-types';

interface UsersListTableProps {
	users: IGymUser[];
	currentPage: number;
	perPage: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (perPage: number) => void;
	onEditUser: (user: IGymUser) => void;
	hasPermission: (permission: string) => boolean;
	currentUserId?: string;
	saving: boolean;
}

const UsersListTable: React.FC<UsersListTableProps> = ({
	users,
	currentPage,
	perPage,
	onPageChange,
	onPerPageChange,
	onEditUser,
	hasPermission,
	currentUserId,
	saving,
}) => {
	return (
		<Card stretch>
			<CardBody className='p-0'>
				<DynamicTable
					data={users}
					columns={useUsersTableColumns(onEditUser, hasPermission, currentUserId)}
					loading={saving}
					rowKey='id'
					pagination={{
						current: currentPage,
						pageSize: perPage,
						total: users.length,
						onChange: onPageChange,
					}}
				/>
			</CardBody>
		</Card>
	);
};

export default UsersListTable;
