import React from 'react'
import { Box, Button, Card, Typography } from '@mui/material'
import TooltipButton from '../common/TooltipButton'
import useCustomState from '../../state/state'
import Truss from '../../utility/Truss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import PublishIcon from '@mui/icons-material/Publish'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import RestoreIcon from '@mui/icons-material/Restore'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import Settings from '../Settings'

interface ViewerInfoBarProps {
	truss: Truss,
	forcesEnabled: boolean,
	onToggleForces?: () => void,
	onResetMultipliers: () => void,
	onSetMultipliers: () => void,
	onImport?: () => void,
	onExport?: () => void,
	onSubmit?: (truss: Truss) => void,
}

const ViewerInfoBar = (props: ViewerInfoBarProps) => {
	const { value: IS_GEN_RUNNING, set: setIsGenRunning } = useCustomState.is_gen_running()
	const { value: GENERATION } = useCustomState.generation()
	const { value: COST_VISIBLE } = useCustomState.cost_visible()

	const truss = props.truss
	const maxForces = truss.getMaxForces()

	return (
		<>
			<Card
				sx={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					boxShadow: 5,
					px: 2,
					pt: 2,
					pb: 4,
				}}
				variant={'outlined'}
			>
				<Typography
					sx={{
						fontWeight: 'bold',
					}}
					variant={'h5'}
				>
					Generation: {GENERATION}
				</Typography>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<Typography
						sx={{
							mr: 2,
							backgroundColor: COST_VISIBLE ? 'background.default' : '#000000',
							borderRadius: 1,
							"&:hover": {
								backgroundColor: 'background.default',
							},
							transition: 'background-color 0.2s ease-in-out',
						}}
						color={'text.primary'}
					>
						Cost: ${truss.getCost(5, 15).toFixed(2)}
					</Typography>
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
				</Box>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mt: 2,
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
						label={IS_GEN_RUNNING ? 'Stop' : 'Run'}
						size={'large'}
						onClick={() => setIsGenRunning(!IS_GEN_RUNNING)}
					>
						{IS_GEN_RUNNING ? <PauseIcon /> : <PlayArrowIcon />}
					</TooltipButton>
					<Button
						sx={{
							mr: 2,
							width: 150,
						}}
						variant={'contained'}
						size={'small'}
						onClick={props.onToggleForces}
					>
						{props.forcesEnabled ? 'Disable' : 'Enable'} Forces
					</Button>
					<TooltipButton
						sx={{
							mr: 2,
							my: 'auto',
							backgroundColor: 'primary.main',
							'&:hover': {
								backgroundColor: 'primary.dark',
							}
						}}
						label={'Reset Multipliers'}
						onClick={props.onResetMultipliers}
					>
						<RestoreIcon />
					</TooltipButton>
					<TooltipButton
						sx={{
							mr: 2,
							my: 'auto',
							backgroundColor: 'primary.main',
							'&:hover': {
								backgroundColor: 'primary.dark',
							}
						}}
						label={'Set Multipliers'}
						onClick={props.onSetMultipliers}
					>
						<GpsFixedIcon />
					</TooltipButton>
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