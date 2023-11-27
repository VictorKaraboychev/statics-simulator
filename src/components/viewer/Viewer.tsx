import { useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import Truss from '../../utility/truss/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import useCustomState from '../../state/state'
import { useEventEffect, usePersistentState } from '../../utility/hooks'
import { DEFAULT_PRECISION, DRAG_UPDATE_INTERVAL, MAX_UNDO_STATES, TRUSS_SCALE, VIEW_MODES } from '../../config/GlobalConfig'
import { round, roundVector } from '../../utility/math'
import { Vector2 } from 'three'
import Joint from '../../utility/truss/Joint'
import ViewerInfoBar from './ViewerInfoBar'
import Connection from '../../utility/truss/Connection'
import JointInfo from './info/JointInfo'
import ConnectionInfo from './info/ConnectionInfo'
import Material from '../../utility/truss/Material'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_PARAMETERS } = useCustomState.truss_constraints()
	const { value: TRUSS_VIEW, set: setTrussView } = useCustomState.truss_view()

	const [historyIndex, setHistoryIndex] = usePersistentState('truss_undo_index', 0, 'local')
	const [history, setHistory] = usePersistentState<any[]>('truss_undo', [], 'local')

	const [forcesEnabled, setForcesEnabled] = usePersistentState('force_enabled', true)

	const [selectedJoints, setSelectedJoints] = useState<Set<string>>(new Set())
	const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	const dragRef = useRef<{ lastUpdate: number, start: Vector2, current: Vector2, jointStarts: { [id: string]: Vector2 } }>()
	const hoverSelectedRef = useRef<boolean>(false)

	const dropRef = useRef<{ open: () => void }>()

	const getActionJoints = (): Set<string> => {
		const actionJoints = new Set(selectedJoints.values())
		selectedConnections.forEach((id) => {
			const ids = truss.getConnection(id).jointIds
			if (ids) actionJoints.add(ids[0]).add(ids[1])
		})
		return actionJoints
	}

	const submit = (t: Truss) => {
		// if (history.length >= MAX_UNDO_STATES) history.shift()
		// const difference = diff(history[history.length - 1] ?? {}, t.toJSON())

		// history.push(difference)
		// setHistory([ ...history ])

		setTruss(t)
	}

	useEventEffect((e: KeyboardEvent) => {
		const { altKey: alt, ctrlKey: ctrl, shiftKey: shift, key } = e

		if (['Shift', 'Control', 'Alt'].includes(key)) return

		let movement = 0.1
		if (alt) movement = 0.01

		const mirror = shift && selectedJoints.size > 1

		const actionJoints = getActionJoints()

		switch (key) {
			case 'Delete': // Delete
				selectedJoints.forEach((id) => truss.removeJoint(id))
				selectedConnections.forEach((id) => truss.removeConnection(id))

				setSelectedJoints(new Set())
				setSelectedConnections(new Set())
				setJointDetails(null)
				setConnectionDetails(null)

				submit(truss)
				break
			case 'n': // New
				if (!alt) break

				setTruss(new Truss([], []))

				e.preventDefault()
				e.stopPropagation()
				break
			case 'a': // Select all
				if (!ctrl) break

				setSelectedJoints(new Set(truss.jointIds))
				setSelectedConnections(new Set(truss.connectionIds))

				e.preventDefault()
				break
			case 'd': // Deselect all
				if (!ctrl) break

				setSelectedJoints(new Set())
				setSelectedConnections(new Set())
				setJointDetails(null)
				setConnectionDetails(null)

				e.preventDefault()
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
			case 'o': // Import
				if (!ctrl) break

				handleImport()

				e.preventDefault()
				e.stopPropagation()
				break
			case 's': // Export
				if (!ctrl) break

				handleExport()

				e.preventDefault()
				e.stopPropagation()
				break
			case 'm': // View mode
				if (!ctrl) break

				setTrussView(VIEW_MODES[(VIEW_MODES.indexOf(TRUSS_VIEW) + 1) % VIEW_MODES.length])

				e.preventDefault()
				e.stopPropagation()
				break
			case 'ArrowUp':
				if (!ctrl) break

				actionJoints.forEach((id) => {
					const joint = truss.getJoint(id)

					let m = movement

					if (mirror) {
						const y = joint.position.y
						if (y === 0) {
							m = 0
						} else if (y < 0) {
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
					const joint = truss.getJoint(id)

					let m = movement

					if (mirror) {
						const y = joint.position.y
						if (y === 0) {
							m = 0
						} else if (y < 0) {
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
					const joint = truss.getJoint(id)

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
					const joint = truss.getJoint(id)

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

	const handleMouseClick = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent

		const { x, y } = e.point.clone().divideScalar(TRUSS_SCALE)

		if (shift) {
			truss.addJoint(
				new Joint(new Vector2(
					round(x, 1),
					round(y, 1),
				))
			)

			if (alt && x !== 0) {
				truss.addJoint(
					new Joint(new Vector2(
						round(-x, 1),
						round(y, 1),
					))
				)
			}

			submit(truss)
		}

		if (!ctrl) {
			setSelectedJoints(new Set())
			setSelectedConnections(new Set())
			setJointDetails(null)
			setConnectionDetails(null)
		}
	}

	const handleMouseDown = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent

		const { x, y } = roundVector(e.point.clone().divideScalar(TRUSS_SCALE), 1)
		const position = new Vector2(x, y)

		if (mouse == 1) {
			if (hoverSelectedRef.current && !dragRef.current) {
				const actionJoints = getActionJoints()

				const jointStarts: { [id: string]: Vector2 } = {}

				actionJoints.forEach((id) => {
					const joint = truss.getJoint(id)
					jointStarts[id] = joint.position.clone()
				})

				dragRef.current = {
					lastUpdate: Date.now(),
					start: position,
					current: position,
					jointStarts,
				}

				document.body.style.cursor = 'grabbing'
			}
		}
	}

	const handleMouseUp = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent

		// const { x, y } = e.point.clone().divideScalar(TRUSS_SCALE)

		if (dragRef.current) {
			// const { start, jointStarts } = dragRef.current
			// const delta = new Vector2(x, y).sub(start)

			// const actionJoints = getActionJoints()

			// actionJoints.forEach((id) => {
			// 	const joint = truss.getJoint(id)
			// 	joint.position = jointStarts[id].clone().add(delta)
			// })

			dragRef.current = undefined

			document.body.style.cursor = 'auto'

			// submit(truss)
		}
	}

	const handleMouseHover = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent

		const { x, y } = roundVector(e.point.clone().divideScalar(TRUSS_SCALE), 1)
		const position = new Vector2(x, y)

		if (mouse == 1) {
			if (dragRef.current) {
				if (dragRef.current.current.equals(position) || dragRef.current.lastUpdate > Date.now() - DRAG_UPDATE_INTERVAL) return

				const { start, jointStarts } = dragRef.current
				const delta = new Vector2(x, y).sub(start)

				const actionJoints = getActionJoints()

				const mirror = shift && actionJoints.size > 1

				actionJoints.forEach((id) => {
					const joint = truss.getJoint(id)

					if (mirror) {					
						joint.position.x = jointStarts[id].x + delta.x * Math.sign(jointStarts[id].x) * Math.sign(start.x)
						joint.position.y = jointStarts[id].y + delta.y * Math.sign(jointStarts[id].y) * Math.sign(start.y)
					} else {
						joint.position = jointStarts[id].clone().add(delta)
					}
				})

				submit(truss)
				dragRef.current.lastUpdate = Date.now()
				dragRef.current.current = position

				document.body.style.cursor = 'grabbing'
			}
		}
	}

	const handleJointClick = (e: ThreeEvent<MouseEvent>, id: string, details: TrussJointDetailsType) => {
		e.stopPropagation()

		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt } = e.nativeEvent

		let jDetails: TrussJointDetailsType | null = jointDetails
		let cDetails: TrussConnectionDetailsType | null = connectionDetails

		if (!ctrl && shift && selectedJoints.size === 1) {
			const otherId: string = selectedJoints.values().next().value

			const material = new Material('Material', '#000000', TRUSS_PARAMETERS.density, TRUSS_PARAMETERS.youngsModulus, TRUSS_PARAMETERS.shearModulus, TRUSS_PARAMETERS.poissonsRatio, TRUSS_PARAMETERS.ultimateStress)
			const connection = new Connection(0, 0, 0, TRUSS_PARAMETERS.area, material)

			truss.addConnection(id, otherId, connection)
			submit(truss)
		}

		if (selectedJoints.has(id)) {
			if (!ctrl && selectedJoints.size > 1) {
				selectedJoints.clear()
				selectedConnections.clear()
				selectedJoints.add(id)

				jDetails = details
				cDetails = null
			} else {
				selectedJoints.delete(id)

				jDetails = null
			}
		} else {
			if (!ctrl) {
				selectedJoints.clear()
				selectedConnections.clear()

				cDetails = null
			}
			selectedJoints.add(id)

			jDetails = details
		}

		setSelectedJoints(selectedJoints)
		setSelectedConnections(selectedConnections)
		setJointDetails(jDetails)
		setConnectionDetails(cDetails)
	}

	const handleConnectionClick = (e: ThreeEvent<MouseEvent>, id: string, details: TrussConnectionDetailsType) => {
		e.stopPropagation()

		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt } = e.nativeEvent

		let jDetails: TrussJointDetailsType | null = jointDetails
		let cDetails: TrussConnectionDetailsType | null = connectionDetails

		if (selectedConnections.has(id)) {
			if (!ctrl && selectedConnections.size > 1) {
				selectedJoints.clear()
				selectedConnections.clear()
				selectedConnections.add(id)

				jDetails = null
				cDetails = details
			} else {
				selectedConnections.delete(id)

				cDetails = null
			}
		} else {
			if (!ctrl) {
				selectedJoints.clear()
				selectedConnections.clear()

				jDetails = null
			}
			selectedConnections.add(id)

			cDetails = details
		}

		setSelectedJoints(selectedJoints)
		setSelectedConnections(selectedConnections)
		setJointDetails(jDetails)
		setConnectionDetails(cDetails)
	}

	const handleToggleForces = () => setForcesEnabled(!forcesEnabled)

	const handleImport = dropRef.current?.open!

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
					onMouseUp={handleMouseUp}
					onMouseDown={handleMouseDown}
					onHover={handleMouseHover}
				>
					<TrussModel
						truss={truss}
						view={TRUSS_VIEW}
						scale={TRUSS_SCALE}
						enableForces={forcesEnabled}
						hoverSelected={hoverSelectedRef}
						selectedJoints={selectedJoints}
						selectedConnections={selectedConnections}
						onJointClick={handleJointClick}
						onConnectionClick={handleConnectionClick}
					/>
				</Visualizer>
				<Box
					sx={{
						position: 'absolute',
						display: 'flex',
						flexDirection: 'row',
						top: 10,
						right: 10,
						zIndex: 20,
					}}
				>
					{jointDetails && (
						<JointInfo
							key={jointDetails.id}
							truss={truss}
							jointDetails={jointDetails}
							onSubmit={submit}
						/>
					)}
					{connectionDetails && (
						<ConnectionInfo
							key={connectionDetails.id}
							sx={{
								ml: 2,
							}}
							truss={truss}
							connectionDetails={connectionDetails}
							onSubmit={submit}
						/>
					)}
				</Box>

				<ViewerInfoBar
					truss={truss}
					forcesEnabled={forcesEnabled}
					onToggleForces={handleToggleForces}
					onImport={handleImport}
					onExport={handleExport}
					onSubmit={submit}
				/>
			</Box>
		</Drop>
	)
}

export default Viewer