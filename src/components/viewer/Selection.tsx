import { Color, MeshBasicMaterial, PlaneGeometry, Vector2, DoubleSide } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'
import { Region2 } from '../../types/vector'

interface SelectionProps {
	region: Region2
	color?: Color
}

const Selection = (props: SelectionProps) => {
	const start = props.region.start
	const end = props.region.end

	const width = end.x - start.x
	const height = end.y - start.y

	const color = props.color ?? new Color('white')

	const geometry = new LineGeometry()
	geometry.setPositions([
		start.x, start.y, 0,
		start.x + width, start.y, 0,
		start.x + width, start.y + height, 0,
		start.x, start.y + height, 0,
		start.x, start.y, 0,
	])

	const material = new LineMaterial({
		color: new Color(color).getHex(),
		linewidth: 0.05,
		worldUnits: true,
	})

	const line = new Line2(geometry, material)
	line.computeLineDistances()

	return (
		<>
			<mesh
				position={[start.x + width / 2, start.y + height / 2, 0]}
				geometry={new PlaneGeometry(width, height)}
				material={new MeshBasicMaterial({
					color: color,
					transparent: true,
					opacity: 0.25,
					side: DoubleSide,
				})}
			/>
			<primitive
				object={line}
			/>
		</>
	)
}

export default Selection