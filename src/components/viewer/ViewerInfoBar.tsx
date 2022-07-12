import React from 'react'
import { Box, Button, Card, TextField, Typography } from '@mui/material'
import TooltipButton from '../common/TooltipButton'
import useCustomState from '../../state/state'
import Truss from '../../utility/Truss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'

interface ViewerInfoBarProps {
	truss: Truss,
	forcesEnabled: boolean,
	onToggleForces?: () => void,
	onResetMultipliers: () => void,
	onImport?: () => void,
	onExport?: () => void,
	onSubmit?: (truss: Truss) => void,
}

const ViewerInfoBar = (props: ViewerInfoBarProps) => {
	const { value: TRUSS_CONSTRAINTS, set: setTrussConstraints } = useCustomState.truss_constraints()
	const { value: IS_GEN_RUNNING, set: setIsGenRunning } = useCustomState.is_gen_running()
	const { value: GENERATION } = useCustomState.generation()

	const truss = props.truss
	const maxForces = truss.getMaxForces()

	return (
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
					onClick={() => setIsGenRunning(!IS_GEN_RUNNING)}
				>
					{IS_GEN_RUNNING ? <PauseIcon /> : <PlayArrowIcon />}
				</TooltipButton>
				<Button
					sx={{
						mr: 2,
					}}
					variant={'contained'}
					onClick={props.onToggleForces}
				>
					{props.forcesEnabled ? 'Disable' : 'Enable'} Forces
				</Button>
				<Button
					sx={{
						mr: 2,
					}}
					variant={'contained'}
					onClick={props.onResetMultipliers}
				>
					Reset Multipliers
				</Button>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<TextField
						sx={{
							mr: 2,
						}}
						type={'number'}
						label={'Max Compression (N)'}
						value={TRUSS_CONSTRAINTS.maxCompression}
						size={'small'}
						variant={'outlined'}
						onChange={(e) => setTrussConstraints({
							maxCompression: Number(e.target.value),
							maxTension: TRUSS_CONSTRAINTS.maxTension
						})}
					/>
					<TextField
						sx={{
						}}
						type={'number'}
						label={'Max Tension (N)'}
						value={TRUSS_CONSTRAINTS.maxTension}
						size={'small'}
						variant={'outlined'}
						onChange={(e) => setTrussConstraints({
							maxCompression: TRUSS_CONSTRAINTS.maxCompression,
							maxTension: Number(e.target.value)
						})}
					/>
				</Box>
				<Box
					component={'div'}
					sx={{
						ml: 'auto',
					}}
				>
					<Button
						sx={{
							mr: 2,
						}}
						variant={'contained'}
						onClick={props.onImport}
					>
						Import
					</Button>
					<Button
						variant={'contained'}
						onClick={props.onExport}
					>
						Export
					</Button>
				</Box>
			</Box>
		</Card>
	)
}

export default ViewerInfoBar