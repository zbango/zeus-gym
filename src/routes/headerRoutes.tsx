import React from 'react';
import { RouteProps } from 'react-router-dom';
import DashboardHeader from '../pages/_layout/Header';

const headers: RouteProps[] = [
	{ path: 'auth-pages/login', element: null },
	{ path: 'auth-pages/404', element: null },
	{
		path: `*`,
		element: <DashboardHeader />,
	},
];

export default headers;
