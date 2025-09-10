import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../hooks/useDarkMode';
import FooterComponent from '../../layout/Footer/Footer';

const Footer = () => {
	const { darkModeStatus } = useDarkMode();

	return (
		<FooterComponent>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col'>
						<span className='fw-light'>Copyright © 2025 - Version 1.0.0</span>
					</div>
					<div className='col-auto'>
						<a
							href='https://tabangos.cloud'
							className={classNames('text-decoration-none', {
								'link-dark': !darkModeStatus,
								'link-light': darkModeStatus,
							})}>
							<small className='fw-bold'>tabangos.cloud</small>
						</a>
					</div>
				</div>
			</div>
		</FooterComponent>
	);
};

export default Footer;
