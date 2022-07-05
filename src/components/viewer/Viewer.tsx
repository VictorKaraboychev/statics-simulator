import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Card, SxProps, Theme, Typography } from '@mui/material'
import Truss from '../../utility/Truss'
import Visualizer from './Visualizer'
import { TrussConnectionDetailsType, TrussDetailsType, TrussJointDetailsType } from '../../types/truss'
import TrussModel from './TrussModel'
import { ThreeEvent } from '@react-three/fiber'
import Joint from '../../utility/Joint'
import { saveAs } from 'file-saver'
import Drop from '../common/Drop'
import TrussInfo from './TrussInfo'
import useCustomState from '../../state/state'

interface ViewerProps {
	sx?: SxProps<Theme>,
}

const Viewer = (props: ViewerProps) => {
	const { value: truss, set: setTruss } = useCustomState.current_truss()

	const [forcesEnabled, setForcesEnabled] = useState(false)
	const [details, setDetails] = useState<TrussDetailsType | null>(null)

	const [connectionDetails, setConnectionDetails] = useState<TrussConnectionDetailsType | null>(null)
	const [jointDetails, setJointDetails] = useState<TrussJointDetailsType | null>(null)

	const dropRef = useRef<{ open: () => void }>()

	useEffect(() => {
		const joints = truss.joints
		const connections = truss.connections

		const value = truss.cost

		let maxCompression = 0
		let maxTension = 0

		connections.forEach(c => {
			const a = joints[c[0]]
			const b = joints[c[1]]

			const force = a.connections[b.id].force

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
	}, [])

	const handleJointClick = (e: ThreeEvent<MouseEvent>, details: TrussJointDetailsType) => {
		setJointDetails(details)
		setConnectionDetails(null)
	}

	const handleConnectionClick = (e: ThreeEvent<MouseEvent>, a: Joint, b: Joint, details: TrussConnectionDetailsType) => {
		setConnectionDetails(details)
		setJointDetails(null)
	}

	const handleExport = () => {
		const json = JSON.stringify(truss.toJSON())
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
				...props.sx
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
				<TrussInfo
					truss={truss}
					connectionDetails={connectionDetails}
					jointDetails={jointDetails}
					onSubmit={setTruss}
				/>
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