import React, { useEffect, useState } from 'react'
import { BackSide, BoxGeometry, BufferGeometry, Color, MeshBasicMaterial, SphereGeometry, Vector2, Vector3, Group, Mesh } from 'three'
import Truss from '../../utility/truss/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { TRUSS_COLORS, FAILURE_MODES } from '../../config/TrussConfig'
import { useTheme } from '@mui/material'
import { setCursor } from '../../utility/functions'
import { ThreeEvent } from '@react-three/fiber'

interface TrussModelProps {
	truss: Truss,
	view?: string,
	simpleUtilization?: boolean,
	hover?: React.MutableRefObject<{ joint: string | null, connection: string | null }>,
	selected?: { joints: Set<string>, connections: Set<string> },
	scale: Vector3,
	position?: Vector3,
	enableForces?: boolean,
	// onJointClick?: (e: ThreeEvent<MouseEvent>, id: string) => void,
	// onConnectionClick?: (e: ThreeEvent<MouseEvent>, id: string) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const truss = props.truss

	const scale = props.scale.clone()
	const scale2D = new Vector2(scale.x, scale.y)
	const joints = truss.joints

	const [hovered, setHovered] = useState(false)

	useEffect(() => {
		setCursor(hovered ? 'pointer' : 'auto')
		return () => setCursor('auto')
	}, [hovered])

	const handlePointerEnter = () => {
		setHovered(true)
	}

	const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
		if (e.intersections.length === 0) return

		setHovered(false)
		if (props.hover) props.hover.current = { joint: null, connection: null }
	}

	const handleHoverJoint = (id: string) => {
		if (props.hover && props.hover.current.joint !== id) {
			props.hover.current.joint = id
		}
	}

	const handleHoverConnection = (id: string) => {
		if (props.hover && props.hover.current.connection !== id) {
			props.hover.current.connection = id
		}
	}

	return (
		<group
			position={props.position ? props.position.multiply(scale) : undefined}
		>
			<group
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
			>
				<group>
					{joints.map((joint, i) => {
						const p = joint.position.clone()

						let geometry: { main: BufferGeometry, selected: BufferGeometry } = { main: new SphereGeometry(0.25, 16, 16), selected: new SphereGeometry(0.325, 16, 16) }

						if (joint.fixed) {
							geometry = { main: new BoxGeometry(0.5, 0.5, 0.5), selected: new BoxGeometry(0.65, 0.65, 0.65) }
						}

						const selected = props.selected?.joints?.has(joint.id) ?? false

						return (
							<group
								key={joint.id}
								position={new Vector3(p.x, p.y, 0.5).multiply(scale)}
								rotation={[0, 0, (joint.fixtures.x ? !joint.fixtures.y : joint.fixtures.y) ? Math.PI / 4 : 0]}
								// onClick={(e) => props.onJointClick?.(e, joint.id)}
								onPointerMove={() => handleHoverJoint(joint.id)}
							>
								<primitive
									object={new Mesh(
										geometry.main,
										new MeshBasicMaterial({
											color: joint.fixed ? '#555555' : '#aaaaaa',
										}),
									)}
								/>
								{selected && (
									<primitive
										object={new Mesh(
											geometry.selected,
											new MeshBasicMaterial({
												color: palette.primary.main,
												side: BackSide,
											}),
										)}
									/>
								)}

							</group>
						)
					})}
				</group>
				<group
					position={[0, 0, -2]}
				>
					{truss.connections.map(([aIndex, bIndex, connection]) => {
						const a = joints[aIndex]
						const b = joints[bIndex]

						const id = aIndex < bIndex ? `${aIndex}-${bIndex}` : `${bIndex}-${aIndex}`

						const aPos = a.position.clone().multiply(scale2D)
						const bPos = b.position.clone().multiply(scale2D)

						const selected = props.selected?.connections?.has(connection.id) ?? false

						const utilization = Math.min(Math.abs(connection.getUtilization(props.simpleUtilization)), 1)

						const color = props.view === 'stress' ? TRUSS_COLORS[connection.stressType] ?? 0x000000 : FAILURE_MODES[connection.getFailureMode(props.simpleUtilization)].color

						return (
							<group
								key={connection.id}
								position={[0, 0, selected ? 1 : 0]}
								// onClick={(e) => props.onConnectionClick?.(e, connection.id)}
								onPointerMove={() => handleHoverConnection(connection.id)}
							>
								<primitive
									object={new Line2(
										new LineGeometry().setPositions([
											...aPos.toArray(),
											0,
											...bPos.toArray(),
											0,
										]),
										new LineMaterial({
											color: new Color(color).getHex(),
											linewidth: 0.25 * utilization + 0.1,
											worldUnits: true,
										}),
									)}
								/>
								<primitive
									object={new Line2(
										new LineGeometry().setPositions([
											...aPos.toArray(),
											-0.05,
											...bPos.toArray(),
											-0.05,
										]),
										new LineMaterial({
											color: new Color(palette.primary.main).getHex(),
											linewidth: 0.25 * utilization + 0.25,
											transparent: true,
											opacity: selected ? 1 : 0,
											worldUnits: true,
										}),
									)}
								/>
							</group>
						)
					})}
				</group>
			</group>
			{props.enableForces && (
				<group>
					{joints.reduce((acc, joint) => {
						if (Math.floor(Math.abs(joint.force.x) * 100) > 0 || Math.floor(Math.abs(joint.force.y) * 100) > 0) {
							acc.push(
								<Force
									key={joint.id}
									force={joint.force}
									origin={joint.position.clone().multiply(scale2D)}
								/>
							)
						}

						return acc
					}, [] as React.ReactNode[])}
				</group>
			)}
		</group>
	)
}

export default TrussModel