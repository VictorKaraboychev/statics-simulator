import { Box, Button, Card, SxProps, Theme, Typography } from '@mui/material'
import NumberField from '../../common/textfields/NumberField'
import { TrussConnectionDetailsType } from '../../../types/truss'
import Truss from '../../../utility/truss/Truss'
import { useCompoundState, useEventEffect } from '../../../utility/hooks'
import Connection from '../../../utility/truss/Connection'

interface ConnectionInfoProps {
	sx?: SxProps<Theme>
	truss: Truss
	connectionDetails: TrussConnectionDetailsType
	onSubmit?: (truss: Truss) => void
}

const ConnectionInfo = (props: ConnectionInfoProps) => {
	const connectionDetails = props.connectionDetails
	const connection = props.truss.getConnection(connectionDetails.connection.id)

	// console.log('CONNECTION: ', connection, connectionDetails.id, props.truss)

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
					Length: {connectionDetails.length.toFixed(4)}m
				</Typography>
				<Typography
					variant={'body2'}
				>
					Angle: {(connectionDetails.angle * (180 / Math.PI)).toFixed(4)}° {(connectionDetails.angle / Math.PI).toFixed(4)}π rad
				</Typography>
				<Typography
					variant={'body2'}
				>
					Force: {Math.ceil(connectionDetails.connection.force || 0)?.toFixed(0)}N
				</Typography>
				<Typography
					variant={'body2'}
				>
					Stress: {Math.abs(connectionDetails.connection.stress * 100).toFixed(0)}MPa
				</Typography>
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
						Youngs Modulus:
					</Typography>
					<NumberField
						label={'Youngs Modulus (GPa)'}
						value={connection.youngsModulus / 1e9}
						size={'small'}
						onSubmit={(value) => {

						}}
					/>
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