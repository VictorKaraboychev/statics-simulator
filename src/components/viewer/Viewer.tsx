import { useEffect, useRef, useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import Truss from '../../utility/truss/Truss'
import Visualizer from './Visualizer'
import { TrussJSONType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import useCustomState from '../../state/state'
import { useEventEffect, useHistory, usePersistentState } from '../../utility/hooks'
import { DEFAULT_DECIMALS, DRAG_UPDATE_INTERVAL, MAX_UNDO_STATES, SNAP_DECIMALS, VIEW_MODES } from '../../config/GlobalConfig'
import { isWithinVector2, round, roundVector } from '../../utility/math'
import { OrthographicCamera, Vector2, Vector3 } from 'three'
import Joint from '../../utility/truss/Joint'
import ViewerInfoBar from './ViewerInfoBar'
import Connection from '../../utility/truss/Connection'
import JointInfo from './info/JointInfo'
import ConnectionInfo from './info/ConnectionInfo'
import Material from '../../utility/truss/Material'
import { useSnackbar } from 'notistack'
import { DEFAULT_TRUSS } from '../../config/TrussConfig'
import { DragType } from '../../types/general'
import { Region2 } from '../../types/vector'
import { setCursor } from '../../utility/functions'
import { Rectangular } from '../../utility/truss/Profiles'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: TRUSS_PARAMETERS } = useCustomState.truss_parameters()
	const { value: EDITOR_SETTINGS } = useCustomState.editor_settings()
	const { value: TRUSS_VIEW, set: setTrussView } = useCustomState.truss_view()

	const { enqueueSnackbar } = useSnackbar()

	const SCALE = 1 / EDITOR_SETTINGS.scale
	const BASE_DECIMALS = Math.log10(1 / EDITOR_SETTINGS.scale)

	const [_, setHistory, undoHistory, redoHistory] = useHistory<TrussJSONType>('truss', DEFAULT_TRUSS, MAX_UNDO_STATES)
	const [truss, setTruss] = useState<Truss>((() => {
		const t = Truss.fromJSON(DEFAULT_TRUSS)
		t.compute()
		return t
	})())

	const [forcesEnabled, setForcesEnabled] = usePersistentState('force_enabled', true)

	const [selected, setSelected] = useState({ joints: new Set<string>(), connections: new Set<string>() })
	const [infoDetails, setInfoDetails] = useState<{ joint: string | null, connection: string | null }>({ joint: null, connection: null })

	const dragRef = useRef<DragType<{ selection: boolean, jointStarts?: { [id: string]: Vector2 } }>>()
	const hoverRef = useRef<{ joint: string | null, connection: string | null }>({ joint: null, connection: null })

	const [selectionRegion, setSelectionRegion] = useState<Region2>()

	const dropRef = useRef<{ open: () => void }>()

	const cameraRef = useRef<OrthographicCamera>()

	const processEvent = (e: ThreeEvent<MouseEvent>) => {
		const { ctrlKey: ctrl, shiftKey: shift, altKey: alt, buttons: mouse } = e.nativeEvent
		const { x, y } = e.point.clone().divideScalar(SCALE)

		return { ctrl, shift, alt, mouse, position: new Vector2(x, y) }
	}

	const getActionJoints = (): Set<string> => {
		const actionJoints = new Set(selected.joints.values())
		selected.connections.forEach((id) => {
			const ids = truss.getConnection(id).jointIds
			if (ids) actionJoints.add(ids[0]).add(ids[1])
		})
		return actionJoints
	}

	const deselectAll = () => {
		setSelected({ joints: new Set(), connections: new Set() })
		setInfoDetails({ joint: null, connection: null })
	}

	const submit = (t: Truss, compute = true, save = true) => {
		const trussCopy = t.clone()
		if (compute) trussCopy.compute()
		setTruss(trussCopy)
		if (save) setHistory(trussCopy.toJSON())
	}

	useEventEffect((e: KeyboardEvent) => {
		const { altKey: alt, ctrlKey: ctrl, shiftKey: shift, key } = e

		if (['Shift', 'Control', 'Alt'].includes(key)) return

		let movement = 0.1
		if (alt) movement = 0.01

		const mirror = shift && selected.joints.size > 1

		const actionJoints = getActionJoints()

		switch (key) {
			case 'Delete': // Delete
				selected.joints.forEach((id) => truss.removeJoint(id))
				selected.connections.forEach((id) => truss.removeConnection(id))

				deselectAll()

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

				setSelected({
					joints: new Set(truss.jointIds),
					connections: new Set(truss.connectionIds)
				})

				e.preventDefault()
				break
			case 'd': // Deselect all
				if (!ctrl) break

				deselectAll()

				e.preventDefault()
				break
			case 'Escape': // Deselect all
				deselectAll()
				e.preventDefault()
				break
			case 'z': // UNDO
				if (!ctrl) break

				const undo = undoHistory()
				if (!undo) break
				submit(Truss.fromJSON(undo), true, false)
				break
			case 'y': // REDO
				if (!ctrl) break

				const redo = redoHistory()
				if (!redo) break
				submit(Truss.fromJSON(redo), true, false)

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
					joint.position.y = round(joint.position.y + m, BASE_DECIMALS + DEFAULT_DECIMALS)
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
					joint.position.y = round(joint.position.y - m, BASE_DECIMALS + DEFAULT_DECIMALS)
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
					joint.position.x = round(joint.position.x - m, BASE_DECIMALS + DEFAULT_DECIMALS)
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
					joint.position.x = round(joint.position.x + m, BASE_DECIMALS + DEFAULT_DECIMALS)
				})
				submit(truss)
				break
			default:
				return
		}
	}, 'keydown')

	const handleMouseClick = (e: ThreeEvent<MouseEvent>) => {
		const { ctrl, shift, alt, mouse, position } = processEvent(e)

		if (shift) {
			const p = position.clone()

			truss.addJoint(new Joint(p))

			if (alt && p.x !== 0) {
				p.x *= -1
				truss.addJoint(new Joint(p))
			}

			submit(truss)
		}
	}

	const handleMouseDown = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation()
		const { ctrl, shift, alt, mouse, position } = processEvent(e)

		console.log('MOUSE DOWN')

		if (mouse == 1) {
			if (!dragRef.current) {

				const h = hoverRef.current

				if (h.joint || h.connection) { // Start joint or connection selection or drag				
					if (h.joint) { // Clicked on joint
						const id = h.joint

						if (!ctrl && shift && selected.joints.size === 1) { // Create connection
							const otherId: string = selected.joints.values().next().value

							const material = new Material('Material', '#000000', TRUSS_PARAMETERS.density, TRUSS_PARAMETERS.youngsModulus, TRUSS_PARAMETERS.shearModulus, TRUSS_PARAMETERS.poissonsRatio, TRUSS_PARAMETERS.ultimateStress)
							const profile = new Rectangular(1, 1)

							const connection = new Connection(TRUSS_PARAMETERS.area, material, profile)

							truss.addConnection(id, otherId, connection)
							submit(truss)
						}

						if (selected.joints.has(id)) {
							if (ctrl) {
								selected.joints.delete(id)

								infoDetails.joint = null
							}
							// if (!ctrl && selected.joints.size > 1) {
							// 	selected.joints.clear()
							// 	selected.connections.clear()
							// 	selected.joints.add(id)

							// 	infoDetails.joint = id
							// 	infoDetails.connection = null
							// } 
							// else {
							// 	selected.joints.delete(id)

							// 	infoDetails.joint = null
							// }
						} else {
							if (!ctrl) {
								selected.joints.clear()
								selected.connections.clear()

								infoDetails.connection = null
							}
							selected.joints.add(id)

							infoDetails.joint = id
						}
					} else if (h.connection) { // Clicked on connection
						const id = h.connection

						if (selected.connections.has(id)) {
							if (ctrl) {
								selected.connections.delete(id)

								infoDetails.connection = null
							}
							// if (!ctrl && selected.connections.size > 1) {
							// 	selected.joints.clear()
							// 	selected.connections.clear()
							// 	selected.connections.add(id)

							// 	infoDetails.joint = null
							// 	infoDetails.connection = id
							// } 
							// else {
							// 	selected.connections.delete(id)

							// 	infoDetails.connection = null
							// }
						} else {
							if (!ctrl) {
								selected.joints.clear()
								selected.connections.clear()

								infoDetails.joint = null
							}
							selected.connections.add(id)

							infoDetails.connection = id
						}
					}
					setSelected({ ...selected })
					setInfoDetails({ ...infoDetails })

					const jointStarts: { [id: string]: Vector2 } = {}

					const actionJoints = getActionJoints()
					if (actionJoints.size > 0) {
						actionJoints.forEach((id) => {
							jointStarts[id] = truss.getJoint(id).position.clone()
						})

						dragRef.current = {
							lastUpdate: Date.now(),
							start: position,
							current: position,
							data: {
								selection: false,
								jointStarts: jointStarts,
							}
						}
					} else {
						// hoverRef.current = { joint: null, connection: null }
					}
				} else { // Start drag selection
					dragRef.current = {
						lastUpdate: Date.now(),
						start: position,
						current: position,
						data: {
							selection: true,
						}
					}
				}
			}
		}
	}

	const handleMouseUp = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation()
		const { ctrl, shift, alt, mouse, position } = processEvent(e)

		console.log('MOUSE UP', dragRef.current)

		if (dragRef.current) { // End drag selection or drag
			const { start, data } = dragRef.current
			const delta = position.clone().sub(start)


			if (delta.length() < 0.5) { // TODO: this condition might need to be changed, its supposed to differentiate between a drag and a click
				const h = hoverRef.current

				if (h.joint || h.connection) {

				} else {
					deselectAll()
				}
			} else { // Drag
				if (data.selection) { // Drag selection

				} else if (data.jointStarts) { // Drag move
					submit(truss)
				}
				setCursor('auto')
			}
		}

		dragRef.current = undefined
		setSelectionRegion(undefined)
	}

	const handleMouseHover = (e: ThreeEvent<MouseEvent>) => {
		e.stopPropagation()
		const { ctrl, shift, alt, mouse, position } = processEvent(e)

		if (mouse == 1) {
			if (dragRef.current && Date.now() - dragRef.current.lastUpdate > DRAG_UPDATE_INTERVAL) {
				const { start, data } = dragRef.current
				const delta = position.clone().sub(start)

				const { selection, jointStarts } = data

				if (selection) {
					const region: Region2 = { start: start, end: position }

					if (!ctrl) {
						selected.joints.clear()
						selected.connections.clear()
					}

					truss.jointIds.forEach((id) => {
						if (isWithinVector2(truss.getJoint(id).position, region)) selected.joints.add(id)
					})

					truss.connectionIds.forEach((id) => {
						const jointIds = truss.getConnection(id).jointIds
						if (jointIds) {
							const joint1IsWithin = isWithinVector2(truss.getJoint(jointIds[0]).position, region)
							const joint2IsWithin = isWithinVector2(truss.getJoint(jointIds[1]).position, region)

							if ((joint1IsWithin && joint2IsWithin) || (shift && (joint1IsWithin || joint2IsWithin))) selected.connections.add(id)
						}
					})

					setSelected(selected)
					setInfoDetails({ joint: null, connection: null })

					setSelectionRegion(region)

					setCursor('crosshair')
				} else if (jointStarts) {
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

						joint.position = roundVector(joint.position, BASE_DECIMALS + (ctrl ? DEFAULT_DECIMALS : SNAP_DECIMALS))
					})
					submit(truss, true, false)

					setCursor('move')
				}

				dragRef.current.lastUpdate = Date.now()
				dragRef.current.current = position
			}
		}
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
					selectionRegion={selectionRegion}
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
						hover={hoverRef}
						selected={selected}
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
					{infoDetails.joint && (
						<JointInfo
							key={infoDetails.joint}
							id={infoDetails.joint}
							truss={truss}
							onSubmit={submit}
						/>
					)}
					{infoDetails.connection && (
						<ConnectionInfo
							key={infoDetails.connection}
							sx={{
								ml: 2,
							}}
							id={infoDetails.connection}
							truss={truss}
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