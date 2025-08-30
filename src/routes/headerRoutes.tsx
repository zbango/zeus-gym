import React from 'react';
import { RouteProps } from 'react-router-dom';
import {
	componentPagesMenu,
	dashboardPagesMenu,
	demoPagesMenu,
	gettingStartedPagesMenu,
	pageLayoutTypesPagesMenu,
} from '../menu';

import DashboardHeader from '../pages/_layout/_headers/DashboardHeader';
import DashboardBookingHeader from '../pages/_layout/_headers/DashboardBookingHeader';
import ProfilePageHeader from '../pages/_layout/_headers/ProfilePageHeader';
import SummaryHeader from '../pages/_layout/_headers/SummaryHeader';
import ProductsHeader from '../pages/_layout/_headers/ProductsHeader';
import ProductListHeader from '../pages/_layout/_headers/ProductListHeader';
import PageLayoutHeader from '../pages/_layout/_headers/PageLayoutHeader';
import ComponentsHeader from '../pages/_layout/_headers/ComponentsHeader';
import FormHeader from '../pages/_layout/_headers/FormHeader';
import ChartsHeader from '../pages/_layout/_headers/ChartsHeader';
import ContentHeader from '../pages/_layout/_headers/ContentHeader';
import UtilitiesHeader from '../pages/_layout/_headers/UtilitiesHeader';
import IconHeader from '../pages/_layout/_headers/IconHeader';
import DefaultHeader from '../pages/_layout/_headers/DefaultHeader';
import DocumentationHeader from '../pages/_layout/_headers/DocumentationHeader';

const headers: RouteProps[] = [
	{ path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlySubheader.path, element: null },
	{ path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlyContent.path, element: null },
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null },
	{ path: 'auth-pages/login', element: null },
	{ path: 'auth-pages/404', element: null },
	{ path: dashboardPagesMenu.dashboard.path, element: <DashboardHeader /> },

	{
		path: dashboardPagesMenu.dashboardBooking.path,
		element: <DashboardBookingHeader />,
	},
	{
		path: `${pageLayoutTypesPagesMenu.asideTypes.path}/*`,
		element: <PageLayoutHeader />,
	},
	{
		path: pageLayoutTypesPagesMenu.pageLayout.subMenu.headerAndSubheader.path,
		element: <PageLayoutHeader />,
	},
	{
		path: pageLayoutTypesPagesMenu.pageLayout.subMenu.onlyHeader.path,
		element: <PageLayoutHeader />,
	},
	{
		path: `${componentPagesMenu.components.path}/*`,
		element: <ComponentsHeader />,
	},
	{
		path: `${componentPagesMenu.forms.path}/*`,
		element: <FormHeader />,
	},
	{
		path: `${componentPagesMenu.charts.path}/*`,
		element: <ChartsHeader />,
	},
	{
		path: `${componentPagesMenu.content.path}/*`,
		element: <ContentHeader />,
	},
	{
		path: `${componentPagesMenu.utilities.path}/*`,
		element: <UtilitiesHeader />,
	},
	{
		path: `${componentPagesMenu.icons.path}/*`,
		element: <IconHeader />,
	},
	{
		path: `${gettingStartedPagesMenu.gettingStarted.path}/*`,
		element: <DocumentationHeader />,
	},
	{
		path: `${gettingStartedPagesMenu.routes.path}/*`,
		element: <DocumentationHeader />,
	},
	{
		path: `*`,
		element: <DefaultHeader />,
	},
	{
		path: `gym-management/*`,
		element: null,
	},
];

export default headers;
