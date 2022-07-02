import React, { useEffect, useState } from 'react'
import { Box, Button, Card, Popover, SxProps, Theme, Typography } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { cost } from '../../utility/trussy/cost'
import { TrussConnectionDetailsType, TrussDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { Vector3 } from 'three'

interface ViewerProps {
	sx?: SxProps<Theme>,
	truss: Truss,
}

const Viewer = (props: ViewerProps) => {
	const [forcesEnabled, setForcesEnabled] = useState(false)
	const [details, setDetails] = useState<TrussDetailsType | null>(null)

	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState<{ left: number, top: number } | null>(null)
	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)

	useEffect(() => {
		props.truss.computeForces()

		const joints = props.truss.joints
		const connections = props.truss.connections

		const value = cost(props.truss)

		let maxCompression = -Infinity
		let maxTension = Infinity

		connections.forEach(c => {
			const a = joints[c[0]]
			const b = joints[c[1]]

			const force = a.connections[b.id]

			if (force) {
				maxCompression = Math.max(maxCompression, force)
				maxTension = Math.min(maxTension, force)
			}
		})

		setDetails({
			cost: value,
			maxCompression,
			maxTension,
		})
	}, [props.truss])

	if (!details) return null

	return (
		<Box
			component={'div'}
			sx={{
				position: 'absolute',
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%',
			}}
		>
			<Visualizer
				sx={{
					zIndex: 10,
				}}
			>
				<TrussModel
					position={new Vector3(
						0,
						0,
						0,
					)}
					truss={props.truss}
					enableForces={forcesEnabled}
					onConnectionClick={(e, a, b, details) => {
						setConnectionDetails(details)
						setPosition({
							left: (e as any).x,
							top: (e as any).y
						})
						setOpen(true)
					}}
				/>
			</Visualizer>
			<Popover
				sx={{
					left: position?.left || 0,
					top: position?.top || 0,
				}}
				open={open}
				anchorEl={document.body}
				onClose={() => setOpen(false)}
			>
				{connectionDetails && (
					<Box
						component={'div'}
						sx={{
							p: 2
						}}
					>
						<Typography
							sx={{
								fontWeight: 'bold',
							}}
							variant={'body1'}
						>
							Connection Details
						</Typography>
						<Typography
							variant={'body2'}
						>
							Force: {connectionDetails.force?.toFixed(0)}N
						</Typography>
						<Typography
							variant={'body2'}
						>
							Stress: {Math.abs(connectionDetails.stress * 100).toFixed(0)}%
						</Typography>
						<Typography
							variant={'body2'}
						>
							Length: {connectionDetails.length.toFixed(2)}m
						</Typography>
					</Box>
				)}
			</Popover>
			<Card
				sx={{
					boxShadow: 5,
					p: 2,
				}}
				variant={'outlined'}
			>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<Typography
						sx={{
							mr: 2,
						}}
						color={'text.primary'}
					>
						Cost: ${details.cost.toFixed(2)}
					</Typography>
					<Typography
						sx={{
							mr: 2,
						}}
						color={'text.primary'}
					>
						Max Compression: {details.maxCompression.toFixed(0)}N
					</Typography>
					<Typography
						sx={{
							mr: 2,
						}}
						color={'text.primary'}
					>
						Max Tension: {details.maxTension.toFixed(0)}N
					</Typography>
				</Box>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						mt: 1,
					}}
				>
					<Button
						sx={{
							mr: 2,
						}}
						variant={'contained'}
						onClick={() => setForcesEnabled(!forcesEnabled)}
					>
						{forcesEnabled ? 'Disable' : 'Enable'} Forces
					</Button>
				</Box>
			</Card>
		</Box>
	)
}

export default Viewer