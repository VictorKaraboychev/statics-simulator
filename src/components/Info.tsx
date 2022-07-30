import React, { useState } from 'react'
import InfoIcon from '@mui/icons-material/Info'
import TooltipButton from './common/TooltipButton'
import Dialog from './common/Dialog'
import { Box, SxProps, Theme, Typography } from '@mui/material'
import KeyCombination from './common/KeyCombination'
import { KEY_BINDINGS } from '../config/GlobalConfig'

interface InfoProps {
	sx?: SxProps<Theme>,
}

const Info = (props: InfoProps) => {
	const [open, setOpen] = useState(false)

	return (
		<>
			<Dialog
				title={'Information'}
				fullScreen={true}
				open={open}
				setOpen={setOpen}
			>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Typography
						sx={{
							fontWeight: 'bold',
							mb: 2,
						}}
						variant={'h5'}
						color={'text.primary'}
					>
						Key Bindings
					</Typography>
					{KEY_BINDINGS.map(({ category, bindings }, i) => (
						<Box
							key={i}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								mb: 2,
							}}
						>
							<Typography
								sx={{
									fontWeight: 'bold',
									textDecoration: 'underline',
								}}
								variant={'h6'}
								color={'text.primary'}
							>
								{category}
							</Typography>
							{bindings.map(({ keys, action }, i) => (
								<Box
									key={i}
									component={'div'}
									sx={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
									}}
								>
									<KeyCombination
										sx={{
											width: 300,
										}}
										variant={'h6'}
										keys={keys}
									/>
									<Typography
										sx={{
											mx: 1,
										}}
										variant={'body1'}
										color={'text.primary'}
									>
										{action}
									</Typography>
								</Box>
							))}
						</Box>
					))}
				</Box>
			</Dialog>
			<TooltipButton
				sx={{
					backgroundColor: 'primary.main',
					'&:hover': {
						backgroundColor: 'primary.dark',
					},
					...props.sx,
				}}
				label={'Information'}
				size={'large'}
				onClick={() => setOpen(true)}
			>
				<InfoIcon />
			</TooltipButton>
		</>
	)
}

export default Info