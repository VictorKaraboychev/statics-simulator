import React, { useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussJointDetailsType, TrussJSONType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import TrussInfo from './TrussInfo'
import useCustomState from '../../state/state'
import { useEventEffect, usePersistentState } from '../../utility/hooks'
import { DEFAULT_PRECISION, MAX_UNDO_STATES, TRUSS_SCALE } from '../../config/GlobalConfig'
import { round } from '../../utility/math'
import { Vector2 } from 'three'
import Joint from '../../utility/Joint'
import ViewerInfoBar from './ViewerInfoBar'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_CONSTRAINTS } = useCustomState.truss_constraints()

	const [undo, setUndo] = usePersistentState<TrussJSONType[]>('truss_undo', [], 'local')

	const [forcesEnabled, setForcesEnabled] = useState(false)

	const [selectedJoints, setSelectedJoints] = useState<Set<number>>(new Set())
	const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()


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

		setSelectedJoints(new Set())
		setSelectedConnections(new Set())
		setJointDetails(null)
		setConnectionDetails(null)
	}

	useEventEffect((e: KeyboardEvent) => {
		const {
			altKey: alt,
			ctrlKey: ctrl,
			shiftKey: shift,
			key,
		} = e

		let movement = 0.1
		if (alt) movement *= 0.1

		switch (key) {
			case 'Delete':
				if (!shift) break

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
				if (!ctrl) break
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
				if (!ctrl) break

				selectedJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (shift) {
						const y = joint.position.y
						if (y === 0) {
							m = 0
						} else if (y > 0) {
							m *= -1
						}
					}
					joint.position.y = round(joint.position.y + m, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowDown':
				if (!ctrl) break

				selectedJoints.forEach((id) => {
					const joint = joints[id]
					
					let m = movement

					if (shift) {
						const y = joint.position.y
						if (y === 0) {
							m = 0
						} else if (y > 0) {
							m *= -1
						}
					}
					joint.position.y = round(joint.position.y - m, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowLeft':
				if (!ctrl) break
				
				selectedJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (shift) {
						const x = joint.position.x
						if (x === 0) {
							m = 0
						} else if (x < 0) {
							m *= -1
						}
					}
					joint.position.x = round(joint.position.x - m, DEFAULT_PRECISION)
				})
				submit(truss)
			break
			case 'ArrowRight':
				if (!ctrl) break
				
				selectedJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (shift) {
						const x = joint.position.x
						if (x === 0) {
							m = 0
						} else if (x < 0) {
							m *= -1
						}
					}
					joint.position.x = round(joint.position.x + m, DEFAULT_PRECISION)
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

	const handleImport = dropRef.current?.open

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
				<ViewerInfoBar
					truss={truss}
					forcesEnabled={forcesEnabled}
					onToggleForces={handleToggleForces}
					onResetMultipliers={handleResetMultipliers}
					onImport={handleImport}
					onExport={handleExport}
					onSubmit={submit}
				/>
			</Box>
		</Drop>
	)
}

export default Viewer