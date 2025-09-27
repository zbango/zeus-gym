import React from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '../bootstrap/Breadcrumb';

export interface BreadcrumbItem {
	title: string;
	to: string;
}

interface PageBreadcrumbsProps {
	breadcrumbs: BreadcrumbItem[];
	className?: string;
	showHome?: boolean;
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({
	breadcrumbs,
	className,
	showHome = false,
}) => {
	const { t } = useTranslation();

	// Add home breadcrumb if requested
	const fullBreadcrumbs = showHome
		? [{ title: t('Home'), to: '/' }, ...breadcrumbs]
		: breadcrumbs;

	return <Breadcrumb list={fullBreadcrumbs} isToHome={showHome} className={className} />;
};

export default PageBreadcrumbs;
