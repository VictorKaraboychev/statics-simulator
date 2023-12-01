import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Object3D } from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'

interface DragControllerProps {
	objects: Object3D<Event>[],
	onDragStart?: (target: any) => void,
	onDrag?: (target: any) => void,
	onDragEnd?: (target: any) => void,
}

const DragController = (props: DragControllerProps) => {
	const { camera, gl } = useThree()

	useEffect(
		() => {
			const controls = new DragControls(props.objects, camera, gl.domElement)

			controls.addEventListener('dragstart', (e) => {
				props.onDragStart?.(e.target)
			})

			controls.addEventListener('drag', (e) => {
				props.onDrag?.(e.target)
			})

			controls.addEventListener('dragend', (e) => {
				props.onDragEnd?.(e.target)
			})

			return controls.dispose
		},
		[props.objects, camera, gl]
	)

	return null
}

export default DragController