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
			controls.enableRotate = false
			controls.maxDistance = 750
			controls.panSpeed = 0.8

			controls.mouseButtons = {
				LEFT: MOUSE.RIGHT,
				MIDDLE: MOUSE.MIDDLE,
				RIGHT: MOUSE.LEFT,
			}
			controls.minZoom = 1.5

			controls.update()
			return controls.dispose
		},
		[camera, gl]
	)

	return null
}

export default CameraController