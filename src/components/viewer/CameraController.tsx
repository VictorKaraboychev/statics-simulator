import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MOUSE, TOUCH, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface CameraControllerProps {
	target?: Vector3
}

const CameraController = (props: CameraControllerProps) => {
	const { camera, gl } = useThree()

	useEffect(
		() => {
			const controls = new OrbitControls(camera, gl.domElement)
			if (props.target) controls.target = props.target
			controls.enableRotate = false

			controls.maxDistance = 750

			controls.panSpeed = 1
			controls.zoomSpeed = 2

			controls.mouseButtons = {
				LEFT: -1 as any,
				MIDDLE: MOUSE.PAN,
				RIGHT: -1 as any,
			}
			controls.touches = {
				ONE: TOUCH.PAN,
				TWO: TOUCH.DOLLY_PAN,
			}

			controls.maxZoom = 200
			controls.minZoom = 20

			controls.update()
			return controls.dispose
		},
		[camera, gl]
	)

	return null
}

export default CameraController