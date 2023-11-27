import { Box, Button, Card, Checkbox, SxProps, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography } from '@mui/material'
import NumberField from '../../common/textfields/NumberField'
import { TrussJointDetailsType } from '../../../types/truss'
import { Vector2 } from 'three'
import { useEventEffect, useReliantState } from '../../../utility/hooks'
import Truss from '../../../utility/truss/Truss'
import { roundVector2 } from '../../../utility/functions'
import { DEFAULT_PRECISION } from '../../../config/GlobalConfig'
import EngineeringField from '../../common/textfields/EngineeringField'
import { fEngineering } from '../../../utility/format'

interface JointInfoProps {
	sx?: SxProps<Theme>
	truss: Truss
	jointDetails: TrussJointDetailsType
	onSubmit?: (truss: Truss) => void
}

const JointInfo = (props: JointInfoProps) => {
	const jointDetails = props.jointDetails
	const joint = props.truss.getJoint(jointDetails.joint.id)

	const [position, setPosition] = useReliantState<Vector2>(joint ? joint.position : new Vector2(0, 0), [joint.position])
	const [externalForce, setExternalForce] = useReliantState<Vector2>(joint ? joint.force : new Vector2(0, 0), [joint.force])

	const canSubmit = Boolean(
		joint &&
		!position.equals(joint.position) ||
		(!joint.fixtures.x && externalForce.x !== joint.force.x) ||
		(!joint.fixtures.y && externalForce.y !== joint.force.y)
	)

	const handleSubmit = () => {
		if (!canSubmit || !joint) return

		joint.position = roundVector2(position, DEFAULT_PRECISION)
		joint.force = roundVector2(externalForce, DEFAULT_PRECISION)

		props.onSubmit?.(props.truss)
	}

	useEventEffect((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Enter':
				handleSubmit()
				break
		}
	}, 'keydown')

	if (!joint) return null

	return (
		<Card
			sx={{
				display: 'flex',
				boxShadow: 5,
				width: 400,
				p: 2,
				mb: 'auto',
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
					Joint Details
				</Typography>
				<Typography
					variant={'body2'}
				>
					ID: {jointDetails.id}
				</Typography>
				<Typography
					sx={{
						mb: 1,
					}}
					variant={'body2'}
				>
					Connections: {jointDetails.joint.numConnections}
				</Typography>
				<Table
					size={'small'}
				>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									fontWeight: 'bold',
								}}
							>
								Property
							</TableCell>
							<TableCell
								sx={{
									fontWeight: 'bold',
									width: 100,
								}}
								align={'center'}
							>
								X
							</TableCell>
							<TableCell
								sx={{
									fontWeight: 'bold',
									width: 100,
								}}
								align={'center'}
							>
								Y
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>
								Displacement
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(joint.displacement.x, 'm')}
							</TableCell>
							<TableCell
								align={'right'}
							>
								{fEngineering(joint.displacement.y, 'm')}
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>
								Fixed
							</TableCell>
							<TableCell
								align={'center'}
							>
								<Checkbox
									sx={{
										my: -0.75
									}}
									checked={joint?.fixtures.x}
									onChange={(e) => {
										joint.fixtures.x = e.currentTarget.checked
										joint.force.x = 0
										props.onSubmit?.(props.truss)
									}}
								/>
							</TableCell>
							<TableCell
								align={'center'}
							>
								<Checkbox
									sx={{
										my: -0.75
									}}
									checked={joint?.fixtures.y}
									onChange={(e) => {
										joint.fixtures.y = e.currentTarget.checked
										joint.force.y = 0
										props.onSubmit?.(props.truss)
									}}
								/>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
				<Typography
					sx={{
						my: 2,
						fontWeight: 'bold',
					}}
					variant={'body2'}
				>
					Joint Properties
				</Typography>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mb: 1,
					}}
				>
					<EngineeringField
						sx={{
							mr: 1,
						}}
						label={'Position (X)'}
						size={'small'}
						decimals={5}
						baseUnit={'m'}
						defaultValue={joint.position.x}
						onSubmit={(value) => setPosition(new Vector2(value, position.y))}
					/>
					<EngineeringField
						label={'Position (Y)'}
						size={'small'}
						decimals={5}
						baseUnit={'m'}
						defaultValue={joint.position.y}
						onSubmit={(value) => setPosition(new Vector2(position.x, value))}

					/>
				</Box>
				<Box
					component={'div'}
					sx={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						mb: 1,
					}}
				>
					<EngineeringField
						sx={{
							mr: 1,
						}}
						label={'Force (X)'}
						size={'small'}
						baseUnit={'N'}
						disabled={joint.fixtures.x}
						decimals={5}
						defaultValue={joint.force.x}
						onSubmit={(value) => setExternalForce(new Vector2(value, externalForce.y))}
					/>
					<EngineeringField
						label={'Force (Y)'}
						size={'small'}
						baseUnit={'N'}
						disabled={joint.fixtures.y}
						decimals={5}
						defaultValue={joint.force.y}
						onSubmit={(value) => setExternalForce(new Vector2(externalForce.x, value))}
					/>
				</Box>
				<Button
					sx={{
						mt: 1,
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

export default JointInfo