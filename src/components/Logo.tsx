import React, { FC } from 'react';
import logoImage from '../assets/logos/logo.png';

interface ILogoProps {
	width?: number;
	height?: number;
	className?: string;
	alt?: string;
}
const Logo: FC<ILogoProps> = ({
	width = 200,
	height = 80,
	className = '',
	alt = 'ZEUS GYM Logo',
}) => {
	return (
		<img
			src={logoImage}
			alt={alt}
			width={width}
			height={height}
			className={className}
			style={{ objectFit: 'contain' }}
		/>
	);
};

export default Logo;
