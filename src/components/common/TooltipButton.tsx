import { Badge, IconButton, SxProps, Theme, Tooltip } from '@mui/material'
import React from 'react'

interface TooltipButtonInterface {
	sx?: SxProps<Theme>,
	label: string,
	disabled?: boolean,
	size?: 'small' | 'large' | 'medium',
	color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit' | 'default',
	edge?: 'start' | 'end',
	overlap?: 'rectangular' | 'circular',
	badge?: number,
	children?: React.ReactNode,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
}

const TooltipButton = (props: TooltipButtonInterface) => {
	return (
		<Tooltip 
			title={props.label}
			arrow={true}
		>
			<IconButton
				sx={{
					aspectRatio: '1',
					...props.sx,
				}}
				disabled={props.disabled}
				size={props.size}
				color={props.color}
				edge={props.edge}
				onClick={props.onClick}
			>
				<Badge 
					sx={{
						alignItems: 'center',
						justifyContent: 'center',
					}}
					overlap={props.overlap}
					badgeContent={props.badge} 
					color={'error'}
				>
					{props.children}
				</Badge>
			</IconButton>
		</Tooltip>
	)
}

export default TooltipButton