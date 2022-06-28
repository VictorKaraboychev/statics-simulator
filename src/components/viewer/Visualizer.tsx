import React from 'react'
import { Canvas } from '@react-three/fiber'
import { BackSide, MeshPhongMaterial, PerspectiveCamera, SphereGeometry, Vector3 } from 'three'
import CameraController from './CameraController'
import { Box, useTheme } from '@mui/material'
import Truss from '../../utility/Truss'
import TrussModel from './Truss'

interface VisualizerProps {
	truss: Truss
}

const Visualizer = (props: VisualizerProps) => {
	const theme = useTheme()
	const palette = theme.palette

	const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000)

	return (
		<Box
			component={'div'}
			sx={{
				width: '100%',
				height: '100%',
			}}
		>
			<Canvas
				camera={camera}
				shadows={true}
				gl={{

					alpha: false,
					antialias: true
				}}
				onCreated={({ gl, scene, camera }) => {
				}}
			>
				<CameraController 
					target={new Vector3(0, -10, 0)}
				/>
				<fog attach={'fog'} args={[0xffffff, 750, 1000]} />

				<TrussModel
					truss={props.truss}
				/>
				<mesh
					geometry={new SphereGeometry(1000, 40, 40)}
					material={new MeshPhongMaterial({
						color: 0xffffff,
						depthWrite: false,
						side: BackSide
					})}
				/>
				<hemisphereLight
					color={0x999999}
					groundColor={0x444444}
					intensity={1}
					position={new Vector3(0, 50, 0)}
				/>
				<gridHelper
					args={[2000, 200, '#000000']}
					position={[0, 0, 0]}
				/>
			</Canvas>
		</Box>
	)
}

export default Visualizer