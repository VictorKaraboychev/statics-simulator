import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Color, Vector3 } from 'three'
import Truss from '../../utility/Truss'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

const TRUSS_COLORS: { [key: string]: Vector3 } = {
	compression: new Vector3(0, 1, 0),
	tension:  new Vector3(1, 0, 0)
}

interface TrussModelProps {
	truss: Truss
}

const TrussModel = (props: TrussModelProps) => {
	const { scene } = useThree()

	const scale = 20

	const joints = props.truss.joints

	useEffect(() => {
		for (let i = 0; i < joints.length; i++) {
			const a = joints[i]
			for (let j = i; j < joints.length; j++) {
				const b = joints[j]
				if (b.id in a.connections) {
					const stress = props.truss.getStress(a.id, b.id)
	
					const stressType = stress < 0 ? 'tension' : 'compression'
					const value = TRUSS_COLORS[stressType].clone().multiplyScalar(Math.abs(stress))
					const color = new Color().fromArray(value.toArray())
		
					scene.add(new Line2(
						new LineGeometry().setPositions([
							...a.position.clone().multiplyScalar(scale).toArray(),
							0,
							...b.position.clone().multiplyScalar(scale).toArray(),
							0,
						]),
						new LineMaterial({
							color: color.getHex(),
							linewidth: 5 * Math.abs(stress) + 1,
							worldUnits: true,
						}),
					))
				}
			}
		}
	}, [joints])

	return (
		<group>
			{joints.map(joint => {
				const p = joint.position.clone()
				return (
					<mesh key={joint.id} position={new Vector3(p.x, p.y, 0).multiplyScalar(scale)}>
						<sphereGeometry attach="geometry" args={[10, 16, 16]} />
						<meshPhongMaterial attach="material" color={joint.fixed ? '#000000' : '#ffffff'} />
					</mesh>
				)
			})}
		</group>
	)
}

export default TrussModel