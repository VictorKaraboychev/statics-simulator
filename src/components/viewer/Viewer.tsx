import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Card, Popover, SxProps, Theme, Typography } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { cost } from '../../utility/trussy/cost'
import { TrussConnectionDetailsType, TrussDetailsType, TrussJointDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import Joint from '../../utility/Joint'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'

interface ViewerProps {
	sx?: SxProps<Theme>,
	truss: Truss,
}

const Viewer = (props: ViewerProps) => {
	const [truss, setTruss] = useState(props.truss)

	const [forcesEnabled, setForcesEnabled] = useState(false)
	const [details, setDetails] = useState<TrussDetailsType | null>(null)

	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState<{ left: number, top: number } | null>(null)

	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)
	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()

	useEffect(() => {
		truss.computeForces()

		const joints = truss.joints
		const connections = truss.connections

		const value = cost(truss)

		let maxCompression = 0
		let maxTension = 0

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
	}, [truss])

	const handleJointClick = (e: ThreeEvent<MouseEvent>, details: TrussJointDetailsType) => {
		setJointDetails(details)
		setConnectionDetails(null)
		setPosition({
			left: (e as any).x,
			top: (e as any).y
		})
		setOpen(true)
	}

	const handleConnectionClick = (e: ThreeEvent<MouseEvent>, a: Joint, b: Joint, details: TrussConnectionDetailsType) => {
		setConnectionDetails(details)
		setJointDetails(null)
		setPosition({
			left: (e as any).x,
			top: (e as any).y
		})
		setOpen(true)
	}

	const handleClose = () => {
		setOpen(false)
	}

	const handleExport = () => {
		const json = JSON.stringify(props.truss.toJSON())
		const blob = new Blob([json], { type: 'application/json' })

		saveAs(blob, 'truss.json')
	}

	const handleDrop = (files: File[]) => {
		const file = files[0]
		file.text().then((text) => {
			const json = JSON.parse(text)
			setTruss(Truss.fromJSON(json))
		})
	}

	if (!details) return null

	return (
		<Drop
			sx={{
				width: '100%',
				height: '100%',
			}}
			reference={dropRef}
			noClick={true}
			noKeyboard={true}
			hideBorder={true}
			multiple={false}
			onSubmit={handleDrop}
		>
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
						truss={truss}
						enableForces={forcesEnabled}
						onJointClick={handleJointClick}
						onConnectionClick={handleConnectionClick}
					/>
				</Visualizer>
				<Popover
					sx={{
						left: position?.left || 0,
						top: position?.top || 0,
					}}
					open={open}
					anchorEl={document.body}
					onClose={handleClose}
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
								ID: {connectionDetails.id}
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
					{jointDetails && (
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
								Joint Details
							</Typography>
							<Typography
								variant={'body2'}
							>
								ID: {jointDetails.id}
							</Typography>
							<Typography
								variant={'body2'}
							>
								Connections: {jointDetails.joint.connections_count}
							</Typography>
							<Typography
								variant={'body2'}
							>
								Position: ({jointDetails.joint.position.toArray().map(x => x.toFixed(2)).join(', ')})
							</Typography>
							<Typography
								variant={'body2'}
							>
								External Forces: ({jointDetails.joint.externalForce.toArray().map(x => x.toFixed(0)).join(', ')})N
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
						<Box
							component={'div'}
							sx={{
								ml: 'auto',
							}}
						>
							<Button
								sx={{
									mr: 2,
								}}
								variant={'contained'}
								onClick={() => dropRef.current?.open()}
							>
								Import
							</Button>
							<Button
								variant={'contained'}
								onClick={handleExport}
							>
								Export
							</Button>
						</Box>
					</Box>
				</Card>
			</Box>
		</Drop>
	)
}

export default Viewer