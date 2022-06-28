import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { MOUSE, Vector3 } from 'three'
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
			controls.rotateSpeed = 0.0
			controls.maxDistance = 750
			controls.panSpeed = 0.8

			controls.mouseButtons = {
				LEFT: MOUSE.RIGHT,
				MIDDLE: MOUSE.LEFT,
				RIGHT: MOUSE.MIDDLE,
			}
			controls.minZoom = 1.5

			

			// controls.minDistance = 100
			controls.update()

			return controls.dispose
		},
		[camera, gl]
	)

	return null
}

export default CameraController