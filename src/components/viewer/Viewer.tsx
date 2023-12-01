import { useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import Truss from '../../utility/truss/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussJSONType, TrussJointDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import useCustomState from '../../state/state'
import { useEventEffect, useHistory, usePersistentState } from '../../utility/hooks'
import { DEFAULT_PRECISION, DRAG_UPDATE_INTERVAL, MAX_UNDO_STATES, TRUSS_SCALE, VIEW_MODES } from '../../config/GlobalConfig'
import { round, roundVector } from '../../utility/math'
import { OrthographicCamera, Vector2, Vector3 } from 'three'
import Joint from '../../utility/truss/Joint'
import ViewerInfoBar from './ViewerInfoBar'
import Connection from '../../utility/truss/Connection'
import JointInfo from './info/JointInfo'
import ConnectionInfo from './info/ConnectionInfo'
import Material from '../../utility/truss/Material'
import { useSnackbar } from 'notistack'
import { DEFAULT_TRUSS } from '../../config/TrussConfig'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	// const { value: truss, set: setTruss } = useCustomState.current_truss()
	const { value: TRUSS_PARAMETERS } = useCustomState.truss_parameters()
	const { value: EDITOR_SETTINGS } = useCustomState.editor_settings()
	const { value: TRUSS_VIEW, set: setTrussView } = useCustomState.truss_view()

	const { enqueueSnackbar } = useSnackbar()

	const SCALE = TRUSS_SCALE / EDITOR_SETTINGS.scale
	const DECIMALS = Math.log10(1 / EDITOR_SETTINGS.scale) + (EDITOR_SETTINGS.snap_to_grid ? 1 : 5)

	const [_, setHistory, undoHistory, redoHistory] = useHistory<TrussJSONType>('truss', DEFAULT_TRUSS, MAX_UNDO_STATES)
	const [truss, setTruss] = useState<Truss>(Truss.fromJSON(DEFAULT_TRUSS))

	const [forcesEnabled, setForcesEnabled] = usePersistentState('force_enabled', true)

	const [selectedJoints, setSelectedJoints] = useState<Set<string>>(new Set())
	const [selectedConnections, setSelectedConnections] = useState<Set<string>>(new Set())

	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	const dragRef = useRef<{ lastUpdate: number, start: Vector2, current: Vector2, jointStarts: { [id: string]: Vector2 } }>()
	const hoverSelectedRef = useRef<boolean>(false)

	const dropRef = useRef<{ open: () => void }>()

	const cameraRef = useRef<OrthographicCamera>()

	const getActionJoints = (): Set<string> => {
		const actionJoints = new Set(selectedJoints.values())
		selectedConnections.forEach((id) => {
			const ids = truss.getConnection(id).jointIds
			if (ids) actionJoints.add(ids[0]).add(ids[1])
		})
		return actionJoints
	}

	const submit = (t: Truss, compute = true, save = true) => {
		if (save) setHistory(t.toJSON())
		if (compute) t.compute()
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
					const json = undoHistory()
					if (!json) break
					submit(Truss.fromJSON(json), true, false)
				}
				break
			case 'y': // REDO
				if (!ctrl) break
				if (history.length > 0) {
					const json = redoHistory()
					if (!json) break
					submit(Truss.fromJSON(json), true, false)
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

		const { x, y } = roundVector(e.point.clone().divideScalar(SCALE), DECIMALS)

		if (shift) {
			const position = new Vector2(x, y)

			truss.addJoint(new Joint(position))

			if (alt && x !== 0) {
				position.x = -x
				truss.addJoint(new Joint(position))
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

		const { x, y } = roundVector(e.point.clone().divideScalar(SCALE), DECIMALS)
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

		// const { x, y } = e.point.clone().divideScalar(SCALE)

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

			submit(truss)
		}
	}

	const handleMouseHover = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent

		const { x, y } = roundVector(e.point.clone().divideScalar(SCALE), DECIMALS)
		const position = new Vector2(x, y)

		if (mouse == 1) {
			if (dragRef.current) {
				if (dragRef.current.current.equals(position) || dragRef.current.lastUpdate > Date.now() - DRAG_UPDATE_INTERVAL) return

				const { start, jointStarts } = dragRef.current
				const delta = position.clone().sub(start)

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

					if (EDITOR_SETTINGS.snap_to_grid) joint.position = roundVector(joint.position, DECIMALS)
				})

				dragRef.current.lastUpdate = Date.now()
				dragRef.current.current = position

				document.body.style.cursor = 'grabbing'

				submit(truss, false)
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
			const connection = new Connection(TRUSS_PARAMETERS.area, material)

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

	const handleHome = () => {
		window.location.reload()
	}

	const handleToggleForces = () => {
		setForcesEnabled(!forcesEnabled)
	}

	const handleImport = dropRef.current?.open!

	const handleExport = () => {
		const json = JSON.stringify(truss.toJSON())
		const blob = new Blob([json], { type: 'application/json' })
		saveAs(blob, 'truss.json')
	}

	const handleDrop = (files: File[]) => {
		try {
			const file = files[0]

			if (!file.type.includes('json')) {
				enqueueSnackbar('Invalid file type, must be a .json file', { variant: 'error' })
				return
			}

			file.text().then((text) => {
				const json = JSON.parse(text)
				submit(Truss.fromJSON(json))
			})
		} catch (e) {
			enqueueSnackbar('Error parsing file contents, please check the file is valid', { variant: 'error' })
			return
		}
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
					cameraRef={cameraRef}
					onClick={handleMouseClick}
					onMouseUp={handleMouseUp}
					onMouseDown={handleMouseDown}
					onHover={handleMouseHover}
				>
					<TrussModel
						truss={truss}
						view={TRUSS_VIEW}
						simpleUtilization={TRUSS_PARAMETERS.simple}
						scale={new Vector3(SCALE, SCALE, SCALE)}
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
					onHome={handleHome}
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