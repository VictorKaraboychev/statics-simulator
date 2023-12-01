import { Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CachedIcon from '@mui/icons-material/Cached'
import { ErrorFallbackInterface } from '../../types/general'

const ErrorFallback = (props: ErrorFallbackInterface) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<ErrorOutlineIcon
				sx={{
					mb: 3,
					fontSize: 256,
					color: 'error.dark',
				}}
			/>
			<Typography
				variant={'h5'}
				color={'error'}
			>
				There was an error loading this page.
			</Typography>
			<Typography
				sx={{
					mb: 3,
				}}
				variant={'body1'}
				color={'error.light'}
			>
				Error: ({props.error.message})
			</Typography>
			<Button
				variant={'contained'}
				color={'error'}
				onClick={props.resetErrorBoundary}
			>
				<CachedIcon
					sx={{
						mr: 1,
						ml: -0.5,
					}}
				/>
				Try Again
			</Button>
		</Box>
	)
}

export default ErrorFallback