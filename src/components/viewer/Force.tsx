import React from 'react'
import { Vector3, ArrowHelper } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

interface ForceProps {
	force: Vector3,
	origin: Vector3
}

const Force = (props: ForceProps) => {
	const force = props.force.clone().normalize().multiplyScalar(35)

	return (
		<group>
			<primitive
				object={new ArrowHelper(force, props.origin, 40, 0x000000, 15, 10)}
			/>
			<primitive
				object={new Line2(
					new LineGeometry().setPositions([
						...props.origin.toArray(),
						...props.origin.clone().add(force).toArray(),
					]),
					new LineMaterial({
						color: 0x000000,
						linewidth: 2,
						worldUnits: true,
					}),
				)}
			/>
		</group>

	)
}

export default Force