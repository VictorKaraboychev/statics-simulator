import React, { useRef, useState } from 'react'
import { Color, MeshPhongMaterial, SphereGeometry, Vector2, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import Force from './Force'
import { ThreeEvent } from '@react-three/fiber'
import Joint from '../../utility/Joint'
import { TrussConnectionDetailsType, TrussJointDetailsType } from '../../types/truss'

const TRUSS_COLORS: { [key: string]: Vector3 } = {
	compression: new Vector3(0, 1, 0),
	tension: new Vector3(1, 0, 0)
}

interface TrussModelProps {
	truss: Truss,
	position?: Vector3,
	enableForces?: boolean,
	onJointClick?: (e: ThreeEvent<MouseEvent>, joint: TrussJointDetailsType) => void,
	onConnectionClick?: (e: ThreeEvent<MouseEvent>, a: Joint, b: Joint, details: TrussConnectionDetailsType) => void,
}

const TrussModel = (props: TrussModelProps) => {
	// const jointID = useRef<string>('')
	// const position = useRef(new Vector3(0, 0, 0))

	// const debounceRef = useRef<number>(0)

	const scale = 20

	const joints = props.truss.joints

	return (
		<group
			position={props.position ? props.position.multiplyScalar(scale) : undefined}
			// onPointerMove={(e) => {
			// 	if (jointID.current) {
			// 		const joint = truss.getJoint(jointID.current)
			// 		const delta = e.point.sub(position.current).divideScalar(scale)

			// 		joint.position.add(new Vector2(delta.x, delta.y))

			// 		// if (debounceRef.current) clearTimeout(debounceRef.current)
			// 		// debounceRef.current = setTimeout(() => {
			// 		// 	truss.computeForces()
			// 		// 	seTruss(truss)
			// 		// }, 250)

			// 		console.log(delta, joint.position)
			// 	}
			// }}
			// onPointerUp={(e) => {
			// 	jointID.current = ''
			// 	const newTruss = truss.clone()
			// 	newTruss.computeForces()
			// 	seTruss(newTruss)
			// }}
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

							const value = Math.abs(stress) >= 1 ? TRUSS_COLORS[stressType] : new Vector3(0, 0, 0)
							const color = new Color().fromArray(value.toArray())

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