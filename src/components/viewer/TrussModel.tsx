import React from 'react'
import { Color, MeshPhongMaterial, SphereGeometry, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import Joint from '../../utility/Joint'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'
import { TRUSS_COLORS } from '../../config/TrussConfig'

interface TrussModelProps {
	truss: Truss,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, joint: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, a: Joint, b: Joint, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
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
							const stress = props.truss.getStress(a.id, b.id)
							const force = props.truss.getForce(a.id, b.id)

							const stressType = stress < 0 ? 'tension' : 'compression'
							// const value = TRUSS_COLORS[stressType].clone().multiplyScalar(Math.abs(stress))
							// console.log(stress)

							const color = new Color(Math.abs(stress) >= 1 ? TRUSS_COLORS[stressType] : '#000000')

							members.push(
								<group
									key={`${a.id}-${b.id}`}
									onClick={(e) => {
										e.stopPropagation()
										props.onConnectionClick?.(e, a, b, {
											id: `${i}-${j}`,
											stress,
											force,
											length: a.distance(b),
											multiplier: a.connections[b.id].multiplier || 1,
										})
									}}
								>
									<primitive
										object={new Line2(
											new LineGeometry().setPositions([
												...a.position.clone().multiplyScalar(scale).toArray(),
												0,
												...b.position.clone().multiplyScalar(scale).toArray(),
												0,
											]),
											new LineMaterial({
												color: color.getHex(),
												linewidth: 5 * Math.min(Math.abs(stress), 1) + 1,
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
					return (
						<mesh
							key={joint.id}
							position={new Vector3(p.x, p.y, 0).multiplyScalar(scale)}
							geometry={new SphereGeometry(5, 16, 16)}
							material={new MeshPhongMaterial({
								color: joint.fixed ? '#000000' : '#ffffff',
							})}
							onClick={(e) => {
								e.stopPropagation()
								props.onJointClick?.(e, {
									id: i,
									joint,
								})
							}}
						/>
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