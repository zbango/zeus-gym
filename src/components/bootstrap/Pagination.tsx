import React, { forwardRef, HTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import Icon from '../icon/Icon';

interface IPaginationItemProps extends HTMLAttributes<HTMLLIElement> {
	className?: string;
	isDisabled?: boolean;
	isActive?: boolean;
	isPrev?: boolean;
	isFirst?: boolean;
	isNext?: boolean;
	isLast?: boolean;
	children?: ReactNode;
	onClick?(...args: unknown[]): unknown | undefined;
}
export const PaginationItem = forwardRef<HTMLLIElement, IPaginationItemProps>(
	(
		{
			className,
			isDisabled,
			isActive,
			isPrev,
			isFirst,
			isNext,
			isLast,
			children,
			onClick,
			...props
		},
		ref,
	) => {
		return (
			<li
				ref={ref}
				className={classNames(
					'page-item',
					{
						disabled: isDisabled,
						active: isActive,
					},
					className,
				)}
				{...props}>
				<span
					role='button'
					onClick={onClick}
					onKeyDown={onClick}
					className='page-link'
					tabIndex={isDisabled ? -1 : undefined}
					aria-disabled={isDisabled ? 'true' : undefined}
					aria-label={
						(isPrev && 'First Page') || (isNext && 'Last Page') || `${children} page`
					}>
					{isPrev && <Icon icon='ChevronLeft' />}
					{isFirst && <Icon icon='FirstPage' />}
					{isNext && <Icon icon='ChevronRight' />}
					{isLast && <Icon icon='LastPage' />}
					{children}
				</span>
			</li>
		);
	},
);
PaginationItem.displayName = 'PaginationItem';

interface IPaginationProps extends HTMLAttributes<HTMLElement> {
	ariaLabel: string;
	children:
		| ReactElement<IPaginationItemProps>
		| ReactElement<IPaginationItemProps>[]
		| ReactNode
		| ReactNode[];
	className?: string | undefined;
	size?: 'sm' | 'lg' | null;
}
const Pagination = forwardRef<HTMLDivElement, IPaginationProps>(
	({ ariaLabel, className, children, size, ...props }, ref) => {
		return (
			<nav ref={ref} aria-label={ariaLabel} className={className} {...props}>
				<ul className={classNames('pagination', { [`pagination-${size}`]: size }, 'm-0')}>
					{children}
				</ul>
			</nav>
		);
	},
);
Pagination.displayName = 'Pagination';

export default Pagination;
