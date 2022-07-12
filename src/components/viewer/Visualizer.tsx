import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { MeshPhongMaterial, OrthographicCamera, PlaneGeometry, Vector3 } from 'three'
import CameraController from './CameraController'

interface VisualizerProps {
	sx?: SxProps<Theme>
	children?: React.ReactNode,
	onClick?: (e: ThreeEvent<MouseEvent>) => void
}

const Visualizer = (props: VisualizerProps) => {
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
						color: 0xffffff,
						emissive: 0xffffff,
						emissiveIntensity: 4,
					})}
					position={[0, 0, -50]}
					rotation={[0, 0, Math.PI / 2]}
					onClick={props.onClick}
				/>
				<hemisphereLight
					color={0x999999}
					groundColor={0x444444}
					intensity={1}
					position={new Vector3(0, 50, 50)}
				/>
				<gridHelper
					args={[4000, 200, '#000000']}
					position={[0, 0, -10]}
					rotation={[Math.PI / 2, 0, 0]}
				/>
				{props.children}
			</Canvas>
		</Box>
	)
}

export default Visualizer