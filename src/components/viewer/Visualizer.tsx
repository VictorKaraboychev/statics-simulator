import React, { useEffect, useState, useRef } from 'react'
import { Box, SxProps, Theme, useTheme } from '@mui/material'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { Color, ColorRepresentation, MeshPhongMaterial, OrthographicCamera, PlaneGeometry, Vector2, Vector3 } from 'three'
import CameraController from './CameraController'
import { TRUSS_SCALE } from '../../config/GlobalConfig'

const HOVER_PRECISION = 0.1

interface VisualizerProps {
	sx?: SxProps<Theme>
	children?: React.ReactNode,
	onClick?: (e: ThreeEvent<MouseEvent>) => void
	onHover?: (e: ThreeEvent<MouseEvent>, position: Vector2, delta: Vector2) => void
}

const Visualizer = (props: VisualizerProps) => {
	const { palette } = useTheme()
	const [bgcolor, setBgColor] = useState<ColorRepresentation>(palette.mode === 'dark' ? 0x111111 : 0xffffff)

	const cursorPos = useRef(new Vector2(0, 0))

	useEffect(() => {
		setBgColor(palette.mode === 'dark' ? 0x111111 : 0xffffff)
	}, [palette.mode])

	const camera = new OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 5000)
	camera.position.set(0, 0, 500)
	camera.zoom = 2

	return (
		<Box
			component={'div'}
			sx={{
				width: '100%',
				height: '100%',
				...props.sx,
			}}
		>
			<Canvas
				camera={camera}
				shadows={true}
				gl={{
					alpha: false,
					antialias: true
				}}
			>
				<CameraController
					target={new Vector3(0, 0, 0)}
				/>
				<mesh
					geometry={new PlaneGeometry(4000, 4000, 40)}
					material={new MeshPhongMaterial({
						color: bgcolor,
						emissive: bgcolor,
						emissiveIntensity: 4,
					})}
					position={[0, 0, -50]}
					rotation={[0, 0, Math.PI / 2]}
					onClick={props.onClick}
					onPointerMove={(e) => {
						const v3 = e.point.clone().divideScalar(TRUSS_SCALE * HOVER_PRECISION).round().multiplyScalar(HOVER_PRECISION)
						const position = new Vector2(v3.x, v3.y)

						if (cursorPos.current && position.equals(cursorPos.current)) return
						const delta = cursorPos.current ? position.clone().sub(cursorPos.current) : new Vector2(0, 0)
						cursorPos.current = position

						props.onHover?.(e, position, delta)
					}}
				/>
				<hemisphereLight
					color={0x999999}
					groundColor={0x444444}
					intensity={1}
					position={new Vector3(0, 50, 100)}
				/>
				<gridHelper
					args={[4000, 200, new Color(0xffffff).sub(new Color(bgcolor))]}
					position={[0, 0, -10]}
					rotation={[Math.PI / 2, 0, 0]}
				/>
				{props.children}
			</Canvas>
		</Box>
	)
}

export default Visualizer