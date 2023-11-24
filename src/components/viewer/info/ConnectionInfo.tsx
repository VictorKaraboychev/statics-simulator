import { Box, Button, Card, SxProps, Theme, Typography } from '@mui/material'
import NumberField from '../../common/textfields/NumberField'
import { TrussConnectionDetailsType } from '../../../types/truss'
import Truss from '../../../utility/truss/Truss'
import { useCompoundState, useEventEffect } from '../../../utility/hooks'
import Connection from '../../../utility/truss/Connection'
import { fEngineering } from '../../../utility/format'

interface ConnectionInfoProps {
	sx?: SxProps<Theme>
	truss: Truss
	connectionDetails: TrussConnectionDetailsType
	onSubmit?: (truss: Truss) => void
}

const ConnectionInfo = (props: ConnectionInfoProps) => {
	const connectionDetails = props.connectionDetails
	const connection = props.truss.getConnection(connectionDetails.connection.id)

	// const [connection, setConnection] = useCompoundState<Connection>(props.truss.getConnection(connectionDetails.id), [props.connectionDetails, props.truss])

	const canSubmit = Boolean(

	)

	const handleSubmit = () => {
		if (!connectionDetails || !connection) return


		props.onSubmit?.(props.truss)
	}

	useEventEffect((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Enter':
				handleSubmit()
				break
		}
	}, 'keydown')

	if (!connection) return null

	const length = connectionDetails.length
	const angle = connectionDetails.angle

	const stress = connection.stress
	const isTension = connection.stressType === 'tension'

	return (
		<Card
			sx={{
				boxShadow: 5,
				width: 400,
				p: 2,
				...props.sx,
			}}
			variant={'outlined'}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
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
					Mass: {fEngineering(connection.getMass(length * 1e3), 'g')}
				</Typography>
				<Typography
					variant={'body2'}
				>
					Length: {fEngineering(length, 'm')}
				</Typography>
				<Typography
					variant={'body2'}
				>
					Angle: {(angle * (180 / Math.PI)).toFixed(2)}° {(angle / Math.PI).toFixed(4)}π rad
				</Typography>
				<Typography
					variant={'body2'}
				>
					Force: {fEngineering(connection.force, 'N')}
				</Typography>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<Typography
						variant={'body2'}
					>
						Stress: {fEngineering(stress, 'Pa')}
						(
						<Typography
							sx={{
								fontWeight: 'bold',
								color: isTension ? 'error.main' : 'success.main',
								textJustify: 'center',
								textTransform: 'capitalize',
							}}
							variant={'caption'}
						>
							{connection.stressType}
						</Typography>
						)
					</Typography>
				</Box>
				<Typography
					variant={'body2'}
				>
					Elongation: {fEngineering(connection.getElongation(length), 'm')} ({(connection.strain * 100).toFixed(4)}%)
				</Typography>

				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						mt: 2,
						width: '100%',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 1,
							width: '100%',
						}}
					>
						<NumberField
							sx={{
								mr: 0.5,
								width: '30%',
							}}
							label={'Density (kg/m³)'}
							value={connection.density}
							size={'small'}
							onSubmit={(value) => {

							}}
						/>
						<NumberField
							sx={{
								mr: 0.5,
								width: '30%',
							}}
							label={'Area (m²)'}
							value={connection.area}
							size={'small'}
							onSubmit={(value) => {

							}}
						/>
						<NumberField
							sx={{
								mr: 0.5,
								width: '40%',
							}}
							label={'Youngs Modulus (GPa)'}
							value={connection.youngsModulus / 1e9}
							size={'small'}
							onSubmit={(value) => {

							}}
						/>
					</Box>
					<Box
						component={'div'}
						sx={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							mb: 1,
							width: '100%',
						}}
					>
						<Typography
							sx={{
								mr: 'auto',
								minWidth: 125,
							}}
							variant={'body2'}
							noWrap={true}
						>
							Ultimate Stress:
						</Typography>
						<NumberField
							sx={{
								mr: 0.5,
							}}
							label={'Tensile (MPa)'}
							value={connection.ultimateStress.tension / 1e6}
							size={'small'}
							onSubmit={(value) => {

							}}
						/>
						<NumberField
							label={'Compressive (MPa)'}
							value={connection.ultimateStress.compression / 1e6}
							size={'small'}
							onSubmit={(value) => {

							}}
						/>
					</Box>
				</Box>
				<Button
					sx={{
						mt: 'auto',
					}}
					disabled={!canSubmit}
					fullWidth={true}
					variant={'contained'}
					onClick={handleSubmit}
				>
					Save
				</Button>
			</Box>
		</Card>
	)
}

export default ConnectionInfo