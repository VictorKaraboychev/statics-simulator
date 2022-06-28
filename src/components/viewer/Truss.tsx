import React from 'react'
import { Color, MeshPhongMaterial, SphereGeometry, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

const TRUSS_COLORS: { [key: string]: Vector3 } = {
	compression: new Vector3(0, 1, 0),
	tension:  new Vector3(1, 0, 0)
}

interface TrussModelProps {
	truss: Truss,
	position: Vector3,
}

const TrussModel = (props: TrussModelProps) => {
	const scale = 20

	const joints = props.truss.joints

	return (
		<group
			position={props.position.multiplyScalar(scale)}
		>
			<group>
				{joints.map(joint => {
					const p = joint.position.clone()
					return (
						<mesh 
							key={joint.id} 
							position={new Vector3(p.x, p.y, 0).multiplyScalar(scale)}
							geometry={new SphereGeometry(4, 16, 16)}
							material={new MeshPhongMaterial({
								color: joint.fixed ? '#000000' : '#ffffff',
							})}
						/>
					)
				})}
			</group>
			<group>
				{joints.flatMap((a, i) => {
					const members: React.ReactNode[] = [] 

					for (let j = i; j < joints.length; j++) {
						const b = joints[j]
						if (b.id in a.connections) {
							const stress = props.truss.getStress(a.id, b.id)

							const stressType = stress < 0 ? 'tension' : 'compression'
							// const value = TRUSS_COLORS[stressType].clone().multiplyScalar(Math.abs(stress))
							const value = Math.abs(stress) >= 1 ? TRUSS_COLORS[stressType] : new Vector3(0, 0, 0);
							console.log(stress)
							const color = new Color().fromArray(value.toArray())

							members.push(<primitive
								key={`${a.id}-${b.id}`}
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
							/>)
						}
					}

					return members
				})}
			</group>
		</group>
	)
}

export default TrussModel