import { Box, Button, Card, Typography } from '@mui/material'
import TooltipButton from '../common/TooltipButton'
import useCustomState from '../../state/state'
import Truss from '../../utility/truss/Truss'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import HomeIcon from '@mui/icons-material/Home'
import PublishIcon from '@mui/icons-material/Publish'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Settings from '../Settings'
import { useEventEffect } from '../../utility/hooks'
import Info from '../Info'
import { useEffect, useState } from 'react'
import { fEngineering } from '../../utility/format'

interface ViewerInfoBarProps {
	truss: Truss,
	forcesEnabled: boolean,
	onHome?: () => void,
	onToggleForces?: () => void,
	onImport?: () => void,
	onExport?: () => void,
	onSubmit?: (truss: Truss) => void,
}

const ViewerInfoBar = (props: ViewerInfoBarProps) => {
	const [mass, setMass] = useState(0)
	const [maxForces, setMaxForces] = useState({
		compression: 0,
		tension: 0,
	})

	const truss = props.truss

	useEffect(() => {
		const mass = truss.connections.reduce((acc, [a, b, connection]) => {
			return acc + connection.mass
		}, 0)

		const maxForces = truss.connections.reduce((acc, [a, b, connection]) => {
			const force = connection.force

			return {
				compression: Math.min(acc.compression, force),
				tension: Math.max(acc.tension, force),
			}
		}, { 
			compression: 0, 
			tension: 0 
		})

		setMass(mass)
		setMaxForces(maxForces)
	}, [props.truss])

	useEventEffect((e: KeyboardEvent) => {
		const {
			altKey: alt,
			ctrlKey: ctrl,
			shiftKey: shift,
			key,
		} = e

		switch (key) {
			case 'f':
				if (!ctrl) break
				e.preventDefault()
				props.onToggleForces?.()
				break
		}
	}, 'keydown')


	return (
		<>
			<Card
				sx={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					boxShadow: 5,
					borderRadius: 0,
					px: 2,
					pt: 2,
					pb: 4,
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
						variant={'body2'}
						color={'text.primary'}
					>
						Max Compression: {fEngineering(maxForces.compression, 'N')}
					</Typography>
					<Typography
						sx={{
							mr: 2,
						}}
						variant={'body2'}
						color={'text.primary'}
					>
						Max Tension: {fEngineering(maxForces.tension, 'N')}
					</Typography>
				</Box>
				<Typography
					sx={{
						mr: 2,
					}}
					variant={'body2'}
					color={'text.primary'}
				>
					Total Mass: {fEngineering(mass * 1e3, 'g')}
				</Typography>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mt: 2,
					}}
				>
					<TooltipButton
						sx={{
							mr: 2,
							backgroundColor: 'primary.main',
							'&:hover': {
								backgroundColor: 'primary.dark',
							}
						}}
						label={'Home'}
						onClick={props.onHome}
					>
						<HomeIcon />
					</TooltipButton>
					<Button
						sx={{
							mr: 2,
							width: 125,
						}}
						variant={'contained'}
						size={'small'}
						onClick={props.onToggleForces}
					>
						{props.forcesEnabled ? 'Hide' : 'Show'} Forces
					</Button>
					<Box
						component={'div'}
						sx={{
							ml: 'auto',
						}}
					>
						<TooltipButton
							sx={{
								mr: 2,
								backgroundColor: 'primary.main',
								'&:hover': {
									backgroundColor: 'primary.dark',
								}
							}}
							label={'Import'}
							onClick={props.onImport}
						>
							<PublishIcon />
						</TooltipButton>
						<TooltipButton
							sx={{
								mr: 2,
								backgroundColor: 'primary.main',
								'&:hover': {
									backgroundColor: 'primary.dark',
								}
							}}
							label={'Export'}
							onClick={props.onExport}
						>
							<FileDownloadIcon />
						</TooltipButton>
					</Box>
					<Info
						sx={{
							mr: 2,
						}}
					/>
					<Settings
						sx={{

						}}
					/>
				</Box>
			</Card>
		</>
	)
}

export default ViewerInfoBar