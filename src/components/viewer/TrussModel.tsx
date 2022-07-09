import React from 'react'
import { BackSide, Color, MeshPhongMaterial, SphereGeometry, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import { TrussConnectionDetailsType, TrussConstraintsType, TrussJointDetailsType } from '../../types/truss'
import { TRUSS_COLORS } from '../../config/TrussConfig'
import { useReliantState } from '../../utility/hooks'
import { useTheme } from '@mui/material'

interface TrussModelProps {
	truss: Truss,
	constraints: TrussConstraintsType,
	selectedJoint?: number,
	selectedConnection?: number,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, joint: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, connection: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	const { palette } = useTheme()

	const [selectedJoint, setSelectedJoint] = useReliantState(props.selectedJoint || -1, [props.selectedJoint])
	const [selectedConnection, setSelectedConnection] = useReliantState(props.selectedConnection || '', [props.selectedConnection])

	const scale = 20
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

							const stress = props.truss.getStress(a.id, b.id, props.constraints)
							const force = props.truss.getForce(a.id, b.id)

							const stressType = stress < 0 ? 'tension' : 'compression'
							// const value = TRUSS_COLORS[stressType].clone().multiplyScalar(Math.abs(stress))
							// console.log(stress)

							const color = new Color(Math.abs(stress) >= 1 ? TRUSS_COLORS[stressType] : '#000000')

							const aPos = a.position.clone().multiplyScalar(scale).toArray()
							const bPos = b.position.clone().multiplyScalar(scale).toArray()

							const selected = selectedConnection === id

							members.push(
								<group
									key={id}
									position={[0, 0, selected ? 1 : 0]}
									onClick={(e) => {
										e.stopPropagation()
										props.onConnectionClick?.(e,
											{
												id: id,
												stress,
												force,
												length: a.distance(b),
												multiplier: a.connections[b.id].multiplier || 1,
												a,
												b,
											}
										)
										setSelectedConnection(id)
										setSelectedJoint(-1)
									}}
								>
									<primitive
										object={new Line2(
											new LineGeometry().setPositions([
												...aPos,
												0,
												...bPos,
												0,
											]),
											new LineMaterial({
												color: color.getHex(),
												linewidth: 5 * Math.min(Math.abs(stress), 1) + 1,
												worldUnits: true,
											}),
										)}
									/>
									{selected && (
										<primitive
											object={new Line2(
												new LineGeometry().setPositions([
													...aPos,
													-0.5,
													...bPos,
													-0.5,
												]),
												new LineMaterial({
													color: new Color(palette.primary.main).getHex(),
													linewidth: 5 * Math.min(Math.abs(stress), 1) + 4,
													worldUnits: true,
												}),
											)}
										/>
									)}
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

					return (
						<group
							key={joint.id}
							position={new Vector3(p.x, p.y, 0.5).multiplyScalar(scale)}
							onClick={(e) => {
								e.stopPropagation()
								props.onJointClick?.(e, {
									id: i,
									joint,
								})
								setSelectedJoint(i)
								setSelectedConnection('')
							}}
						>
							<mesh
								geometry={new SphereGeometry(5, 16, 16)}
								material={new MeshPhongMaterial({
									color: joint.fixed ? '#000000' : '#ffffff',
								})}
							/>
							{selectedJoint === i && (
								<mesh
									geometry={new SphereGeometry(6.5, 16, 16)}
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