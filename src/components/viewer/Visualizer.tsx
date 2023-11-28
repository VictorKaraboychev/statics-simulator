import React, { useEffect, useState } from 'react'
import { Box, SxProps, Theme, useTheme } from '@mui/material'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { Color, ColorRepresentation, MeshPhongMaterial, OrthographicCamera, PlaneGeometry, Vector3 } from 'three'
import CameraController from './CameraController'
import useCustomState from '../../state/state'
//@ts-ignore
import FPSStats from "react-fps-stats"
import { InfiniteGridHelper } from './InfiniteGridHelper'

interface VisualizerProps {
	sx?: SxProps<Theme>
	cameraRef?: React.MutableRefObject<OrthographicCamera | undefined>
	children?: React.ReactNode
	onClick?: (e: ThreeEvent<MouseEvent>) => void
	onMouseUp?: (e: ThreeEvent<MouseEvent>) => void
	onMouseDown?: (e: ThreeEvent<MouseEvent>) => void
	onHover?: (e: ThreeEvent<MouseEvent>) => void
}

const Visualizer = (props: VisualizerProps) => {
	const { palette } = useTheme()

	const { value: EDITOR_SETTINGS } = useCustomState.editor_settings()

	const [bgcolor, setBgColor] = useState<ColorRepresentation>(palette.mode === 'dark' ? 0x111111 : 0xffffff)

	useEffect(() => {
		setBgColor(palette.mode === 'dark' ? 0x111111 : 0xffffff)
	}, [palette.mode])

	const { innerWidth: width, innerHeight: height } = window

	const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.01, 5000)
	camera.position.set(0, 0, 500)
	camera.zoom = 25

	if (props.cameraRef) {
		props.cameraRef.current = camera
	}

	return (
		<Box
			component={'div'}
			sx={{
				width: '100%',
				height: '100%',
				...props.sx,
			}}
		>
			{EDITOR_SETTINGS.debug && (
				<FPSStats />
			)}
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
					geometry={new PlaneGeometry(5000, 5000)}
					material={new MeshPhongMaterial({
						color: bgcolor,
						emissive: bgcolor,
						emissiveIntensity: 4,
					})}
					position={[0, 0, -50]}
					rotation={[0, 0, Math.PI / 2]}
					onClick={props.onClick}
					onPointerUp={props.onMouseUp}
					onPointerDown={props.onMouseDown}
					onPointerMove={props.onHover}
				/>
				<hemisphereLight
					color={0x999999}
					groundColor={0x444444}
					intensity={1}
					position={new Vector3(0, 50, 100)}
				/>
				{EDITOR_SETTINGS.grid_enabled && (
					// <gridHelper
					// 	args={[5000, 5000, new Color(0xffffff).sub(new Color(bgcolor))]}
					// 	position={[0, 0, -10]}
					// 	rotation={[Math.PI / 2, 0, 0]}
					// />
					<InfiniteGridHelper
						size1={1}
						size2={10}
						color={new Color(0xffffff).sub(new Color(bgcolor))}
						distance={50000}
						axes={'xyz'}
						position={[0, 0, -10]}
					/>
				)}
				{props.children}
			</Canvas>
		</Box>
	)
}

export default Visualizer