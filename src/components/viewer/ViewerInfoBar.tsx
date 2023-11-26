import { Box, Button, Card, Typography } from '@mui/material'
import TooltipButton from '../common/TooltipButton'
import useCustomState from '../../state/state'
import Truss from '../../utility/truss/Truss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import PublishIcon from '@mui/icons-material/Publish'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Settings from '../Settings'
import { useEventEffect } from '../../utility/hooks'
import Info from '../Info'

interface ViewerInfoBarProps {
	truss: Truss,
	forcesEnabled: boolean,
	onToggleForces?: () => void,
	onImport?: () => void,
	onExport?: () => void,
	onSubmit?: (truss: Truss) => void,
}

const ViewerInfoBar = (props: ViewerInfoBarProps) => {
	const { value: TRUSS_CONSTRAINTS } = useCustomState.truss_constraints()

	const truss = props.truss
	// const maxForces = truss.getMaxForces()

	useEventEffect((e: KeyboardEvent) => {
		const {
			altKey: alt,
			ctrlKey: ctrl,
			shiftKey: shift,
			key,
		} = e

		switch (key) {
			case 'f':
				if (!ctrl) break
				e.preventDefault()
				props.onToggleForces?.()
				break
		}
	}, 'keydown')


	return (
		<>
			<Card
				sx={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					boxShadow: 5,
					borderRadius: 0,
					px: 2,
					pt: 2,
					pb: 4,
				}}
				variant={'outlined'}
			>
				{/* <Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<Typography
						sx={{
							mr: 2,
						}}
						color={'text.primary'}
					>
						Max Compression: {maxForces.maxCompression.toFixed(0)}N
					</Typography>
					<Typography
						sx={{
							mr: 2,
						}}
						color={'text.primary'}
					>
						Max Tension: {maxForces.maxTension.toFixed(0)}N
					</Typography>
				</Box> */}
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mt: 2,
					}}
				>
					<Button
						sx={{
							mr: 2,
							width: 125,
						}}
						variant={'contained'}
						size={'small'}
						onClick={props.onToggleForces}
					>
						{props.forcesEnabled ? 'Hide' : 'Show'} Forces
					</Button>
					<Box
						component={'div'}
						sx={{
							ml: 'auto',
						}}
					>
						<TooltipButton
							sx={{
								mr: 2,
								backgroundColor: 'primary.main',
								'&:hover': {
									backgroundColor: 'primary.dark',
								}
							}}
							label={'Import'}
							onClick={props.onImport}
						>
							<PublishIcon />
						</TooltipButton>
						<TooltipButton
							sx={{
								mr: 2,
								backgroundColor: 'primary.main',
								'&:hover': {
									backgroundColor: 'primary.dark',
								}
							}}
							label={'Export'}
							onClick={props.onExport}
						>
							<FileDownloadIcon />
						</TooltipButton>
					</Box>
					<Info
						sx={{
							mr: 2,
						}}
					/>
					<Settings
						sx={{

						}}
					/>
				</Box>
			</Card>
		</>
	)
}

export default ViewerInfoBar