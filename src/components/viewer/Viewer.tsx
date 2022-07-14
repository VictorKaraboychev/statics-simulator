import React, { useEffect, useRef, useState } from 'react'
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
import { flushSync } from 'react-dom'
import { DEFAULT_TRUSS_CONSTRAINTS } from '../../config/TrussConfig'
import { equals } from '../../utility/functions'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_CONSTRAINTS } = useCustomState.truss_constraints()

	const [historyIndex, setHistoryIndex] = usePersistentState('truss_undo_index', 0, 'local')
	const [history, setHistory] = usePersistentState<any[]>('truss_undo', [], 'local')

	const [forcesEnabled, setForcesEnabled] = useState(false)

	const [selectedJoints, setSelectedJoints] = useState<Set<number>>(new Set())
	const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()


	const joints = truss.joints
	const connections = truss.connections

	useEffect(() => {
		if (!equals(TRUSS_CONSTRAINTS, DEFAULT_TRUSS_CONSTRAINTS)) {
			submit(truss)
		}
	}, [TRUSS_CONSTRAINTS])

	const submit = (t: Truss) => {
		// if (history.length >= MAX_UNDO_STATES) history.shift()
		// const difference = diff(history[history.length - 1] ?? {}, t.toJSON())

		// history.push(difference)
		// setHistory([ ...history ])

		// console.log('difference', difference, history)


		// console.log('submit', TRUSS_CONSTRAINTS.distributedForce)

		t.setDistributedForce(TRUSS_CONSTRAINTS.distributedForce)
		setTruss(t.clone())
	}


	const handleMouseClick = (e: ThreeEvent<MouseEvent>) => {
		if ((e as any).shiftKey) {
			const { x, y } = e.point.clone().divideScalar(TRUSS_SCALE)

			console.log('Adding joint at', x, y)

			truss.addJoint(
				new Joint(new Vector2(
					round(x, 1),
					round(y, 1),
				))
			)

			if (!(e as any).altKey && x !== 0) {
				truss.addJoint(
					new Joint(new Vector2(
						round(-x, 1),
						round(y, 1),
					))
				)
			}

			submit(truss)
		}

		if (!(e as any).ctrlKey) {
			setSelectedJoints(new Set())
			setSelectedConnections(new Set())
			setJointDetails(null)
			setConnectionDetails(null)
		}
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

		const mirror = !shift && selectedJoints.size > 1

		const actionJoints = new Set(selectedJoints.values())
		selectedConnections.forEach((i) => {
			const [a, b] = i.split('-').map(Number)
			actionJoints.add(a)
			actionJoints.add(b)
		})

		switch (key) {
			case 'Delete': // Delete
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
			case 'z': // UNDO
				if (!ctrl) break
				if (history.length > 0) {
					// setTruss(Truss.fromJSON(historyIndex.pop() as TrussJSONType))
					// setHistoryIndex([ ...historyIndex ])
				}
			break
			case 'y': // REDO
				if (!ctrl) break
				if (history.length > 0) {
					// setTruss(Truss.fromJSON(historyIndex.pop() as TrussJSONType))
					// setHistoryIndex([ ...historyIndex ])
				}
			break
			case 'ArrowUp':
				if (!ctrl) break

				actionJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (mirror) {
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

				actionJoints.forEach((id) => {
					const joint = joints[id]
					
					let m = movement

					if (mirror) {
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
				
				actionJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (mirror) {
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
				
				actionJoints.forEach((id) => {
					const joint = joints[id]

					let m = movement

					if (mirror) {
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

		console.log('joint', e)

		if (!(e as any).ctrlKey) {
			if ((e as any).shiftKey && selectedJoints.size == 1) {
				const [a, b] = [i, selectedJoints.values().next().value].sort((a, b) => a - b)
				truss.addConnection(joints[a].id, joints[b].id)
				submit(truss)
			}
			selectedJoints.clear()
		}
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

	const handleSetMultipliers = () => {
		for (let i = 0; i < joints.length; i++) {
			const a = joints[i]
			for (let j = 0; j < joints.length; j++) {
				const b = joints[j]
				if (b.id in a.connections) {
					const c = a.connections[b.id]
					if (c.force) {
						c.multiplier = Math.min(Math.ceil(Math.abs(c.force) / (c.force > 0 ? TRUSS_CONSTRAINTS.maxCompression : TRUSS_CONSTRAINTS.maxTension)), TRUSS_CONSTRAINTS.maxMultiplier)
					}
				}
			}
		}
		submit(truss)
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
		files[0].text().then((text) => {
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
					onSetMultipliers={handleSetMultipliers}
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