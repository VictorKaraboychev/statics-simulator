import React, { useState } from 'react'
import { Box, Button, Card, TextField, Typography } from '@mui/material'
import TooltipButton from '../common/TooltipButton'
import useCustomState from '../../state/state'
import Truss from '../../utility/Truss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SettingsIcon from '@mui/icons-material/Settings'
import PublishIcon from '@mui/icons-material/Publish'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import RestoreIcon from '@mui/icons-material/Restore'
import Dialog from '../common/Dialog'
import VERSION from '../../version.json'

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

	const [optionsOpen, setOptionsOpen] = useState(false)

	const truss = props.truss
	const maxForces = truss.getMaxForces()

	return (
		<>
			<Dialog
				title={'Options'}
				open={optionsOpen}
				setOpen={setOptionsOpen}
			>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 2,
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
								maxTension: TRUSS_CONSTRAINTS.maxTension,
								distributedForce: TRUSS_CONSTRAINTS.distributedForce,
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
								maxTension: Number(e.target.value),
								distributedForce: TRUSS_CONSTRAINTS.distributedForce,
							})}
						/>
					</Box>
					<TextField
							sx={{
								mb: 2,
							}}
							type={'number'}
							label={'Distributed Force (N/m)'}
							value={TRUSS_CONSTRAINTS.distributedForce}
							size={'small'}
							variant={'outlined'}
							onChange={(e) => {
								const force = Number(e.target.value)
								truss.setDistributedForce(force)
								props.onSubmit?.(truss)
								setTrussConstraints({
									maxCompression: TRUSS_CONSTRAINTS.maxCompression,
									maxTension: TRUSS_CONSTRAINTS.maxTension,			
									distributedForce: force,
								})}
							}
						/>
					<Typography
						variant={'body2'}
						color={'text.primary'}
					>
						Version: {VERSION.version}
					</Typography>
					<Typography
						variant={'body2'}
						color={'text.primary'}
					>
						Date Updated: {new Date(VERSION.date).toLocaleString(undefined, {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</Typography>
				</Box>
			</Dialog>
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
						size={'large'}
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
						<TooltipButton
							sx={{
								backgroundColor: 'primary.main',
								'&:hover': {
									backgroundColor: 'primary.dark',
								}
							}}
							label={'Options'}
							size={'large'}
							onClick={() => setOptionsOpen(true)}
						>
							<SettingsIcon />
					</TooltipButton>
					</Box>
					
				</Box>
			</Card>
		</>
	)
}

export default ViewerInfoBar