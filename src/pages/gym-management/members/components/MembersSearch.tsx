import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../../../components/bootstrap/forms/Input';

interface MembersSearchProps {
	placeholder?: string;
	onSearchChange?: (search: string) => void;
	className?: string;
}

const MembersSearch: React.FC<MembersSearchProps> = ({
	placeholder = 'Search members...',
	onSearchChange,
	className = '',
}) => {
	const { t } = useTranslation();
	const [searchInput, setSearchInput] = React.useState('');

	const handleSearch = (value: string) => {
		setSearchInput(value);
		onSearchChange?.(value);
	};

	return (
		<Input
			type='search'
			placeholder={t(placeholder)}
			value={searchInput}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
			className={className}
			style={{ width: '250px' }}
		/>
	);
};

export default MembersSearch;
