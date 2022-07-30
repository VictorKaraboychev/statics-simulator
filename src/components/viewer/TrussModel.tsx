import React from 'react'
import { BackSide, BoxGeometry, BufferGeometry, Color, MeshPhongMaterial, SphereGeometry, Vector2, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import { TrussConnectionDetailsType, TrussConstraintsType, TrussJointDetailsType } from '../../types/truss'
import { TRUSS_COLORS } from '../../config/TrussConfig'
import { useTheme } from '@mui/material'

interface TrussModelProps {
	truss: Truss,
	scale: number,
	view?: string,
	constraints: TrussConstraintsType,
	selectedJoints?: Set<number>,
	selectedConnections?: Set<string>,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, i: number, details: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, i: string, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const scale = props.scale
	const joints = props.truss.joints

	return (
		<group
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
							const connection = a.connections[b.id]

							const stress = props.truss.getStress(a.id, b.id, props.constraints)
							const force = props.truss.getForce(a.id, b.id)

							const underStressed = (Math.abs(stress) * connection.multiplier) < (connection.multiplier - 1)
							const overStressed = Math.abs(stress) * connection.multiplier > props.constraints.maxMultiplier

							let stressType = Math.abs(stress) > 1 ? stress < 0 ? 'tension' : 'compression' : 'neutral'
							// let stressType = stress < 0 ? 'tension' : 'compression'
							if (overStressed) stressType = `over_${stressType}`
							if (underStressed) stressType = 'under'
							if (a.distanceTo(b) < props.constraints.minDistance) stressType = 'illegal'

							const color = new Color(TRUSS_COLORS[stressType] ?? 0x000000)

							const angle = a.angleTo(b)

							const aPos = a.position.clone().multiplyScalar(scale)
							const bPos = b.position.clone().multiplyScalar(scale)

							const selected = props.selectedConnections?.has(id)

							const q = 2
							const m = 2

							const p = angle + Math.PI / 2
							const o = new Vector2(Math.cos(p), Math.sin(p)).multiplyScalar((1 - connection.multiplier))

							members.push(
								<group
									key={id}
									position={[0, 0, selected ? 1 : 0]}
									onClick={(e) => props.onConnectionClick?.(
										e,
										id,
										{
											id: id,
											stress,
											force,
											length: a.distanceTo(b),
											angle: angle,
											multiplier: connection.multiplier || 1,
											a,
											b,
										}
									)}
								>
									{(() => {
										switch (props.view) {
											case 'stress':
												return (
													<primitive
														object={new Line2(
															new LineGeometry().setPositions([
																...aPos.toArray(),
																0,
																...bPos.toArray(),
																0,
															]),
															new LineMaterial({
																color: new Color(TRUSS_COLORS[stress < 0 ? 'tension' : 'compression']).getHex(),
																linewidth: 5 * Math.min(Math.abs(stress), 1) + 1,
																worldUnits: true,
															}),
														)}
													/>
												)
											case 'multiplier':
												return (
													new Array(connection.multiplier).fill(0).map((v, i) => {
														return (
															<primitive
																key={i}
																object={new Line2(
																	new LineGeometry().setPositions([
																		aPos.x + m * i * Math.cos(p) + o.x,
																		aPos.y + m * i * Math.sin(p) + o.y,
																		0,
																		bPos.x + m * i * Math.cos(p) + o.x,
																		bPos.y + m * i * Math.sin(p) + o.y,
																		0,
																	]),
																	new LineMaterial({
																		color: color.getHex(),
																		linewidth: 1,
																		worldUnits: true,
																	}),
																)}
															/>
														)
													})
												)
											default:
												return (
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
												)
										}
									})()}
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

					if (joint.fixtures.length > 0) {
						geometry = { main: new BoxGeometry(10, 10, 10), selected: new BoxGeometry(13, 13, 13) }
					}

					return (
						<group
							key={joint.id}
							position={new Vector3(p.x, p.y, 0.5).multiplyScalar(scale)}
							rotation={[0, 0, joint.fixtures.length === 1 ? Math.PI / 4 : 0]}
							onClick={(e) => props.onJointClick?.(
								e,
								i,
								{
									id: i,
									joint: joints[i],
								}
							)}
						>
							<mesh
								geometry={geometry.main}
								material={new MeshPhongMaterial({
									color: joint.fixed ? '#999999' :'#ffffff',
								})}
							/>
							{props.selectedJoints?.has(i) && (
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