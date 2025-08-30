import React, { Children, cloneElement, forwardRef, HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import { createUseStyles } from 'react-jss';
import { TColor } from '../../type/color-type';

const useStyles = createUseStyles({
	// stylelint-disable-next-line selector-type-no-unknown
	dynamicHeight: (props) => ({
		// @ts-ignore
		height: props.height,
	}),
});

interface IProgressProps extends HTMLAttributes<HTMLDivElement> {
	value?: number;
	min?: number;
	max?: number;
	height?: number | string | null;
	isStriped?: boolean;
	isAnimated?: boolean;
	isAutoColor?: boolean;
	color?: TColor | 'link' | 'brand' | 'brand-two' | 'storybook';
	children?: ReactElement<IProgressProps> | ReactElement<IProgressProps>[];
	className?: string;
	isOnlyBar?: boolean;
}
const Progress = forwardRef<HTMLDivElement, IProgressProps>(
	(
		{
			value = 0,
			min = 0,
			max = 100,
			height,
			isStriped,
			isAnimated,
			isAutoColor,
			color,
			children,
			className,
			isOnlyBar,
			...props
		},
		ref,
	) => {
		// @ts-ignore
		const VALUE = (100 * (value - min)) / (max - min);
		// @ts-ignore
		const classes = useStyles({ height });

		const ONLY_BAR = (
			<div
				style={{
					width: `${VALUE}%`,
				}}
				className={classNames(
					'progress-bar',
					{
						'bg-danger': VALUE < 25 && isAutoColor,
						'bg-warning': VALUE >= 25 && VALUE < 50 && isAutoColor,
						'bg-info': VALUE >= 50 && VALUE < 75 && isAutoColor,
						'bg-success': VALUE >= 75 && isAutoColor,
					},
					{
						[`bg-${color}`]: color && !isAutoColor,
						'progress-bar-striped': isStriped || isAnimated,
						'progress-bar-animated': isAnimated,
					},
				)}
				role='progressbar'
				aria-label={`${value}%`}
				aria-valuenow={value}
				aria-valuemin={min}
				aria-valuemax={max}
			/>
		);

		if (isOnlyBar) {
			return ONLY_BAR;
		}
		return (
			<div
				ref={ref}
				className={classNames('progress', { [classes.dynamicHeight]: !!height }, className)}
				style={{
					// @ts-ignore

					...props.style,
				}}
				{...props}>
				{children
					? Children.map(children, (child) =>
							cloneElement(child as ReactElement, { isOnlyBar: true }),
						)
					: ONLY_BAR}
			</div>
		);
	},
);
Progress.displayName = 'Progress';

export default Progress;
