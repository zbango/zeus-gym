import React, { forwardRef, ReactElement, useContext, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { ISubHeaderProps } from '../SubHeader/SubHeader';
import { IPageProps } from '../Page/Page';
import AuthContext from '../../contexts/authContext';
import { demoPagesMenu } from '../../menu';

interface IPageWrapperProps {
	isProtected?: boolean;
	title?: string;
	description?: string;
	children:
		| ReactElement<ISubHeaderProps>[]
		| ReactElement<IPageProps>
		| ReactElement<IPageProps>[];
	className?: string;
}
const PageWrapper = forwardRef<HTMLDivElement, IPageWrapperProps>(
	({ isProtected = true, title, description, className, children }, ref) => {
		useLayoutEffect(() => {
			// @ts-ignore
			document.getElementsByTagName('TITLE')[0].text = `${title ? `${title} | ` : ''}${
				import.meta.env.VITE_SITE_NAME
			}`;
			// @ts-ignore
			document
				?.querySelector('meta[name="description"]')
				.setAttribute('content', description || import.meta.env.VITE_META_DESC || '');
		});

		const { user, isGymAuthenticated, gymLoading } = useContext(AuthContext);

		const navigate = useNavigate();
		useEffect(() => {
			// Only redirect if protected, loading is complete, and NO authentication (template OR gym)
			if (isProtected && !gymLoading && user === '' && !isGymAuthenticated) {
				navigate(`../auth-pages/login`);
			}
			return () => {};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isGymAuthenticated, gymLoading]);

		return (
			<div ref={ref} className={classNames('page-wrapper', 'container-fluid', className)}>
				{children}
			</div>
		);
	},
);
PageWrapper.displayName = 'PageWrapper';

export default PageWrapper;
