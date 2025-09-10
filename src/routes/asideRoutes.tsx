import React from 'react';
import { RouteProps } from 'react-router-dom';
import { demoPagesMenu, pageLayoutTypesPagesMenu } from '../menu';
import SidebarNavigation from '../pages/_layout/SidebarNavigation';

const asides: RouteProps[] = [
	{ path: 'auth-pages/login', element: null },

	{ path: pageLayoutTypesPagesMenu.blank.path, element: null },
	{ path: '*', element: <SidebarNavigation /> },
];

export default asides;
