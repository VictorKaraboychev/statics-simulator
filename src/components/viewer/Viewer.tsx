import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Card, SxProps, TextField, Theme, Typography } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussDetailsType, TrussJointDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import Joint from '../../utility/Joint'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import TrussInfo from './TrussInfo'
import useCustomState from '../../state/state'
import TooltipButton from '../common/TooltipButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_CONSTRAINTS, set: setTrussConstraints } = useCustomState.truss_constraints()
	const { value: IS_GEN_RUNNING, set: setIsGenRunning } = useCustomState.is_gen_running()
	const { value: GENERATION } = useCustomState.generation()

	const [forcesEnabled, setForcesEnabled] = useState(false)

	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)
	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()

	const maxForces = truss.getMaxForces()

	const handleJointClick = (e: ThreeEvent<MouseEvent>, details: TrussJointDetailsType) => {
		setJointDetails(details)
		setConnectionDetails(null)
	}

	const handleConnectionClick = (e: ThreeEvent<MouseEvent>, details: TrussConnectionDetailsType) => {
		setConnectionDetails(details)
		setJointDetails(null)
	}

	const handleExport = () => {
		const json = JSON.stringify(truss.toJSON())
		const blob = new Blob([json], { type: 'application/json' })
		saveAs(blob, 'truss.json')
	}

	const handleDrop = (files: File[]) => {
		const file = files[0]
		file.text().then((text) => {
			const json = JSON.parse(text)
			setTruss(Truss.fromJSON(json))
		})
	}

	return (
		<Drop
			sx={{
				width: '100%',
				height: '100%',
				...props.sx
			}}
			reference={dropRef}
			noClick={true}
			noKeyboard={true}
			hideBorder={true}
			multiple={false}
			onSubmit={handleDrop}
		>
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					display: 'flex',
					flexDirection: 'column',
					width: '100%',
					height: '100%',
				}}
			>

				<Visualizer
					sx={{
						zIndex: 10,
					}}
				>
					<TrussModel
						truss={truss}
						constraints={TRUSS_CONSTRAINTS}
						enableForces={forcesEnabled}
						onJointClick={handleJointClick}
						onConnectionClick={handleConnectionClick}
					/>
				</Visualizer>
				<TrussInfo
					truss={truss}
					connectionDetails={connectionDetails}
					jointDetails={jointDetails}
					onSubmit={setTruss}
				/>
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
							{IS_GEN_RUNNING ? <PauseIcon/> : <PlayArrowIcon/>}
						</TooltipButton>
						<Button
							sx={{
								mr: 2,
							}}
							variant={'contained'}
							onClick={() => setForcesEnabled(!forcesEnabled)}
						>
							{forcesEnabled ? 'Disable' : 'Enable'} Forces
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
								label={'Max Compression'}
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
								label={'Max Tension'}
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
								onClick={() => dropRef.current?.open()}
							>
								Import
							</Button>
							<Button
								variant={'contained'}
								onClick={handleExport}
							>
								Export
							</Button>
						</Box>
					</Box>
				</Card>
			</Box>
		</Drop>
	)
}

export default Viewer