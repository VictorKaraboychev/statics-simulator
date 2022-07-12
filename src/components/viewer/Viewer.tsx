import React, { useRef, useState } from 'react'
import { Box, Button, Card, SxProps, TextField, Theme, Typography } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussJointDetailsType, TrussJSONType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import TrussInfo from './TrussInfo'
import useCustomState from '../../state/state'
import TooltipButton from '../common/TooltipButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import { useEventEffect, usePersistentState } from '../../utility/hooks'
import { DEFAULT_PRECISION, MAX_UNDO_STATES, TRUSS_SCALE } from '../../config/GlobalConfig'
import { round } from '../../utility/math'
import { Vector2 } from 'three'
import Joint from '../../utility/Joint'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_CONSTRAINTS, set: setTrussConstraints } = useCustomState.truss_constraints()
	const { value: IS_GEN_RUNNING, set: setIsGenRunning } = useCustomState.is_gen_running()
	const { value: GENERATION } = useCustomState.generation()

	const [undo, setUndo] = usePersistentState<TrussJSONType[]>('truss_undo', [], 'local')

	const [forcesEnabled, setForcesEnabled] = useState(false)

	const [selectedJoints, setSelectedJoints] = useState<Set<number>>(new Set())
	const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()

	const maxForces = truss.getMaxForces()

	const joints = truss.joints
	// const connections = truss.connections

	const submit = (t: Truss) => {
		if (undo.length >= MAX_UNDO_STATES) undo.shift()
		undo.push(t.toJSON())

		setUndo([ ...undo ])
		setTruss(t.clone())
	}


	const handleMouseClick = (e: ThreeEvent<MouseEvent>) => {
		if ((e as any).altKey) {
			const { x, y } = e.point.clone().divideScalar(TRUSS_SCALE)

			console.log('Adding joint at', x, y)

			truss.addJoint(
				new Joint(new Vector2(
					round(x, DEFAULT_PRECISION),
					round(y, DEFAULT_PRECISION),
				))
			)

			submit(truss)
		}
	}

	useEventEffect((e: KeyboardEvent) => {
		let movement = 0.1
		if (e.shiftKey) movement *= 0.01
		if (e.altKey) movement *= 0.1

		switch (e.key) {
			case 'Delete':
				if (!e.shiftKey) break

				selectedJoints.forEach((id) => {
					truss.removeJoint(joints[id].id)
				})
				selectedConnections.forEach((id) => {
					const [a, b] = id.split('-').map(Number)
					truss.removeConnection(joints[a].id, joints[b].id)
				})

				setSelectedJoints(new Set())
				setSelectedConnections(new Set())
				setJointDetails(null)
				setConnectionDetails(null)

				submit(truss)
			break
			case 'z':
				if (!e.ctrlKey) break
				if (undo.length > 0) {
					setTruss(Truss.fromJSON(undo.pop() as TrussJSONType))
					setUndo([ ...undo ])
				}
			break
			case 't':
				if (selectedJoints.size == 2) {
					const [a, b] = [...selectedJoints].sort((a, b) => a - b)

					truss.addConnection(joints[a].id, joints[b].id)
					submit(truss)
				}
			break
			case 'ArrowUp':
				if (!e.ctrlKey) break

				selectedJoints.forEach((id) => {
					const joint = joints[id]
					joint.position.y = round(joint.position.y + movement, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowDown':
				if (!e.ctrlKey) break

				selectedJoints.forEach((id) => {
					const joint = joints[id]
					joint.position.y = round(joint.position.y - movement, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowLeft':
				if (!e.ctrlKey) break
				
				selectedJoints.forEach((id) => {
					const joint = joints[id]
					joint.position.x = round(joint.position.x - movement, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowRight':
				if (!e.ctrlKey) break
				
				selectedJoints.forEach((id) => {
					const joint = joints[id]
					joint.position.x = round(joint.position.x + movement, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			default:
				return
		}
	}, 'keydown')

	const handleJointClick = (e: ThreeEvent<MouseEvent>, i: number, details: TrussJointDetailsType) => {
		e.stopPropagation()

		selectedConnections.clear()

		if (!(e as any).ctrlKey) selectedJoints.clear()
		if (selectedJoints.has(i)) {
			selectedJoints.delete(i)
		} else {
			selectedJoints.add(i)
		}

		setSelectedJoints(selectedJoints)
		setSelectedConnections(selectedConnections)
		setJointDetails(details)
		setConnectionDetails(null)
	}

	const handleConnectionClick = (e: ThreeEvent<MouseEvent>, i: string, details: TrussConnectionDetailsType) => {
		e.stopPropagation()

		selectedJoints.clear()

		if (!(e as any).ctrlKey) selectedConnections.clear()
		if (selectedConnections.has(i)) {
			selectedConnections.delete(i)
		} else {
			selectedConnections.add(i)
		}

		setSelectedJoints(selectedJoints)
		setSelectedConnections(selectedConnections)
		setJointDetails(null)
		setConnectionDetails(details)
	}

	const handleResetMultipliers = () => {
		truss.joints.forEach((joint) => {
			Object.values(joint.connections).forEach((connection) => {
				connection.multiplier = 1
			})
		})
		submit(truss)
	}

	const handleToggleForces = () => setForcesEnabled(!forcesEnabled)

	const handleExport = () => {
		const json = JSON.stringify(truss.toJSON())
		const blob = new Blob([json], { type: 'application/json' })
		saveAs(blob, 'truss.json')
	}

	const handleDrop = (files: File[]) => {
		const file = files[0]
		file.text().then((text) => {
			const json = JSON.parse(text)
			submit(Truss.fromJSON(json))
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
					onClick={handleMouseClick}
				>
					<TrussModel
						truss={truss}
						scale={TRUSS_SCALE}
						constraints={TRUSS_CONSTRAINTS}
						enableForces={forcesEnabled}
						selectedJoints={selectedJoints}
						selectedConnections={selectedConnections}
						onJointClick={handleJointClick}
						onConnectionClick={handleConnectionClick}
					/>
				</Visualizer>
				<TrussInfo
					truss={truss}
					connectionDetails={connectionDetails}
					jointDetails={jointDetails}
					onSubmit={submit}
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
							{IS_GEN_RUNNING ? <PauseIcon /> : <PlayArrowIcon />}
						</TooltipButton>
						<Button
							sx={{
								mr: 2,
							}}
							variant={'contained'}
							onClick={handleToggleForces}
						>
							{forcesEnabled ? 'Disable' : 'Enable'} Forces
						</Button>
						<Button
							sx={{
								mr: 2,
							}}
							variant={'contained'}
							onClick={handleResetMultipliers}
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