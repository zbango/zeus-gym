import React from 'react';
import { RouteProps } from 'react-router-dom';
import { pageLayoutTypesPagesMenu } from '../menu';
import Footer from '../pages/_layout/Footer';

const footers: RouteProps[] = [
	{ path: pageLayoutTypesPagesMenu.blank.path, element: null },
	{ path: 'auth-pages/login', element: null },
	{ path: 'auth-pages/404', element: null },
	{ path: '*', element: <Footer /> },
];

export default footers;
