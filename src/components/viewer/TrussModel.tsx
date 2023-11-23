import React, { useEffect, useState } from 'react'
import { BackSide, BoxGeometry, BufferGeometry, Color, MeshPhongMaterial, RingGeometry, SphereGeometry, Vector3 } from 'three'
import Truss from '../../utility/truss/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'
import { TRUSS_COLORS } from '../../config/TrussConfig'
import { useTheme } from '@mui/material'

interface TrussModelProps {
	truss: Truss,
	scale: number,
	view?: string,
	selectedJoints?: Set<string>,
	selectedConnections?: Set<string>,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: MouseEvent, id: string, details: TrussJointDetailsType) => void,
	onConnectionClick?: (e: MouseEvent, id: string, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const truss = props.truss

	const scale = props.scale
	const joints = truss.joints

	const [hovered, setHovered] = useState(false)

	useEffect(() => {
		document.body.style.cursor = hovered ? 'pointer' : 'auto'

		return () => {
			document.body.style.cursor = 'auto'
		}
	}, [hovered])

	return (
		<group
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
			position={props.position ? props.position.multiplyScalar(scale) : undefined}
		>
			<group
				position={[0, 0, -2]}
			>
				{joints.flatMap((a, i) => {
					const members: React.ReactNode[] = []

					for (let j = i; j < joints.length; j++) {
						const b = joints[j]
						if (b.id in a.connections) {
							const id = `${i}-${j}`
							const connection = truss.getConnectionByIds(a.id, b.id)

							const stress = connection.stress

							const stressType = Math.abs(stress) > 1 ? stress < 0 ? 'tension' : 'compression' : 'neutral'

							const color = new Color(TRUSS_COLORS[stressType] ?? 0x000000)

							const angle = a.angleTo(b)

							const aPos = a.position.clone().multiplyScalar(scale)
							const bPos = b.position.clone().multiplyScalar(scale)

							const selected = props.selectedConnections?.has(id)

							members.push(
								<group
									key={id}
									position={[0, 0, selected ? 1 : 0]}
									onClick={(e) => props.onConnectionClick?.(
										e.nativeEvent,
										connection.id,
										{
											id: id,
											length: a.distanceTo(b),
											angle: angle,
											connection: connection,
											a,
											b,
										}
									)}
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
												color: color.getHex(),
												linewidth: 5 * Math.min(Math.abs(stress), 1) + 1,
												worldUnits: true,
											}),
										)}
									/>
									<primitive
										object={new Line2(
											new LineGeometry().setPositions([
												...aPos.toArray(),
												-0.5,
												...bPos.toArray(),
												-0.5,
											]),
											new LineMaterial({
												color: new Color(palette.primary.main).getHex(),
												linewidth: 5 * Math.min(Math.abs(stress), 1) + 4,
												transparent: true,
												opacity: selected ? 1 : 0,
												worldUnits: true,
											}),
										)}
									/>
								</group>
							)
						}
					}
					return members
				})}
			</group>
			<group>
				{joints.map((joint, i) => {
					const p = joint.position.clone()

					let geometry: { main: BufferGeometry, selected: BufferGeometry } = { main: new SphereGeometry(5, 16, 16), selected: new SphereGeometry(6.5, 16, 16) }

					if (joint.fixed) {
						geometry = { main: new BoxGeometry(10, 10, 10), selected: new BoxGeometry(10, 10, 10) }
					}

					// geometry = { main: new RingGeometry(3, 5, 20), selected: new SphereGeometry(6.5, 16, 16) }

					return (
						<group
							key={joint.id}
							position={new Vector3(p.x, p.y, 0.5).multiplyScalar(scale)}
							rotation={[0, 0, (joint.fixtures.x ? !joint.fixtures.y : joint.fixtures.y) ? Math.PI / 4 : 0]}
							onClick={(e) => props.onJointClick?.(
								e.nativeEvent,
								joint.id,
								{
									id: i,
									joint: joints[i],
								}
							)}
						>
							<mesh
								geometry={geometry.main}
								material={new MeshPhongMaterial({
									color: joint.fixed ? '#999999' : '#ffffff',
								})}
							/>
							{props.selectedJoints?.has(joint.id) && (
								<mesh
									geometry={geometry.selected}
									material={new MeshPhongMaterial({
										color: palette.primary.main,
										side: BackSide,
										emissive: palette.primary.main,
									})}
								/>
							)}
						</group>

					)
				})}
			</group>
			{props.enableForces && (
				<group>
					{joints.reduce((acc, joint) => {
						if (joint.fixed) {
							acc.push(
								<Force
									key={joint.id}
									force={joint.externalForce}
									origin={joint.position.clone().multiplyScalar(scale)}
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