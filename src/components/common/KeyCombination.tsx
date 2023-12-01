import React, { Fragment } from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'

interface KeyCombinationProps {
	sx?: SxProps<Theme>,
	keys: string[],
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline' | 'inherit',
	color?: string,
}

const KeyCombination = (props: KeyCombinationProps) => {
	return (
		<Box
			component={'div'}
			sx={{
				display: 'flex',
				flexDirection: 'row',
				...props.sx,
			}}
		>
			{props.keys.map((key, i) => {
				return (
					<Fragment
						key={i}
					>
						{i > 0 && (
							<Typography
								sx={{
									fontWeight: 'bold',
									textTransform: 'capitalize',
									mx: 1,
								}}
								variant={props.variant}
								color={props.color ?? 'text.primary'}
							>
								+
							</Typography>
						)}
						<Typography
							sx={{
								fontWeight: 'bold',
								textTransform: 'capitalize',
							}}
							variant={props.variant}
							color={props.color ?? 'text.primary'}
						>
							{key}
						</Typography>
					</Fragment>
				)
			})}
		</Box>
	)
}

export default KeyCombination