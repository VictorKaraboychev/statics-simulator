import React from 'react'
import { Vector3, Vector2, ArrowHelper } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

interface ForceProps {
	force: Vector2,
	origin: Vector2
}

const Force = (props: ForceProps) => {
	const force = new Vector3(props.force.x, props.force.y, 0).clone().normalize().multiplyScalar(35)
	const origin = new Vector3(props.origin.x, props.origin.y, 0)

	return (
		<group>
			<primitive
				object={new ArrowHelper(force, origin, 40, 0x000000, 15, 10)}
			/>
			<primitive
				object={new Line2(
					new LineGeometry().setPositions([
						...origin.toArray(),
						...origin.clone().add(force).toArray(),
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