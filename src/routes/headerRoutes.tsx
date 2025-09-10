import React from 'react';
import { RouteProps } from 'react-router-dom';

const headers: RouteProps[] = [
	{ path: 'auth-pages/login', element: null },
	{ path: 'auth-pages/404', element: null },
	{
		path: `*`,
		element: null,
	},
];

export default headers;
