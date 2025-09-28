import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardLabel, CardSubTitle, CardTitle } from '../bootstrap/Card';

interface PageTitleProps {
	title: string;
	icon?: string;
	iconColor?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'info'
		| 'warning'
		| 'danger'
		| 'light'
		| 'dark';
	className?: string;
	subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
	title,
	icon = 'Group',
	iconColor = 'info',
	className,
	subtitle,
}) => {
	const { t } = useTranslation();

	return (
		<CardLabel icon={icon} iconColor={iconColor} className={className}>
			<CardTitle tag='div' className='h5'>
				{t(title)}
			</CardTitle>
			{subtitle && (
				<CardSubTitle tag='div' className='h6'>
					{t(subtitle)}
				</CardSubTitle>
			)}
		</CardLabel>
	);
};

export default PageTitle;
