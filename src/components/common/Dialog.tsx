import React, { forwardRef } from 'react'
import { AppBar, Box, Dialog as DialogMUI, DialogActions, DialogContent, IconButton, LinearProgress, Slide, SxProps, Theme, Toolbar, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { TextButtonType } from '../../types/common'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'

interface DialogInterface {
	sx?: SxProps<Theme>,
	title: string,
	fullScreen?: boolean,
	disableBackdropClose?: boolean,
	loading?: boolean,
	buttons?: TextButtonType[],
	children?: React.ReactNode,
	open: boolean,
	setOpen: (open: boolean) => void,
}

const Transition = forwardRef(( props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown> ) => <Slide direction="up" ref={ref} {...props} />)

const Dialog = (props: DialogInterface) => {

	const buttons = props.buttons?.map((button, i) => (
		<LoadingButton
			key={i}
			variant={button.variant || 'contained'}
			color={button.color ?? (props.fullScreen ? 'secondary' : 'primary')}
			size={'small'}
			fullWidth={!props.fullScreen}
			loading={button.loading}
			disabled={button.disabled}
			onClick={button.onClick}
		>
			{button.label}
		</LoadingButton>
	))

	return (
		<DialogMUI
			fullScreen={props.fullScreen}
			TransitionComponent={Transition}
			open={props.open}
			onClose={(e, reason) => {
				if (!props.disableBackdropClose || reason === 'escapeKeyDown') props.setOpen(false)
			}}
		>
			<AppBar 
				sx={{ 
					position: 'relative'
				}}
			>
				<Toolbar
					// sx={{
					// 	background: `url(${banner3})`,
					// 	backgroundSize: '100vw',
					// 	backgroundPosition: '50%, 75%',
					// }}
				>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							flex: 1,
							mx: -1,
						}}
					>
						<IconButton
							color={'inherit'}
							edge={'start'}
							onClick={() => props.setOpen(false)}
						>
							<CloseIcon />
						</IconButton>
						<Typography 
							sx={{ 
								mx: 2, 
								flex: 1 
							}} 
							variant={'h6'}
						>
							{props.title}
						</Typography>
						{props.fullScreen && buttons}
					</Box>
				</Toolbar>
				{props.loading && (
					<LinearProgress 
						sx={{
							width: '100%'
						}}
					/>
				)}
			</AppBar>
			<DialogContent
				sx={{
					bgcolor: 'background.default',
					...props.sx
				}}
			>
				{props.children}
			</DialogContent>
			{!props.fullScreen && (
				<DialogActions
					sx={{
						bgcolor: 'background.default',
						justifyContent: 'center',
					}}
				>
					{buttons}
				</DialogActions>
			)}
		</DialogMUI>
	)
}

export default Dialog