import { useTheme } from '@mui/material'
import { Vector3, Vector2, Color, ConeBufferGeometry, MeshBasicMaterial } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'

interface ForceProps {
	force: Vector2,
	origin: Vector2
}

const Force = (props: ForceProps) => {
	const { palette } = useTheme()
	const color = new Color(palette.primary.main).getHex()

	const force = new Vector3(props.force.x, props.force.y, 0).clone().normalize().multiplyScalar(20)
	const origin = new Vector3(props.origin.x, props.origin.y, 0)

	return (
		<group>
			<primitive
				object={new Line2(
					new LineGeometry().setPositions([
						...origin.toArray(),
						...origin.clone().add(force).toArray(),
					]),
					new LineMaterial({
						color,
						linewidth: 2,
						worldUnits: true,
					}),
				)}
			/>
			<mesh
				geometry={new ConeBufferGeometry(5, 12, 5)}
				material={new MeshBasicMaterial({
					color,
				})}
				position={origin.clone().add(force)}
				rotation={[0, 0, Math.atan2(force.y, force.x) - Math.PI / 2]}
			/>
		</group>

	)
}

export default Force